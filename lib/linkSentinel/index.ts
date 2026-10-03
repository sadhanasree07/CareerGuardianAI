import dns from "node:dns/promises";
import net from "node:net";
import http from "node:http";
import https from "node:https";
import { domainToUnicode } from "node:url";
import { findVerifiedOrganization } from "@/lib/linkSentinel/registry";

const SHORTENERS = new Set(["bit.ly", "tinyurl.com", "is.gd", "t.co", "ow.ly", "buff.ly", "cutt.ly", "rebrand.ly", "rb.gy", "shorturl.at", "tiny.cc", "lnkd.in"]);
const SUSPICIOUS_TLDS = new Set(["tech", "site", "xyz", "top", "online", "info", "co"]);
const MULTI_LABEL_SUFFIXES = new Set(["gov.in", "nic.in", "co.in", "ac.in", "res.in", "gov.uk", "co.uk", "org.uk", "com.au", "net.au", "co.nz"]);
export const linkSentinelConfig = { enabled: process.env.LINK_SENTINEL_ENABLED !== "false" };

export type DomainStatus = "OFFICIAL_MATCH" | "VERIFIED_SUBDOMAIN" | "LOOKALIKE_DOMAIN" | "TYPOSQUATTING_DETECTED" | "SUSPICIOUS_DOMAIN" | "UNVERIFIED_DOMAIN" | "SHORTENED_URL" | "UNKNOWN_ORGANIZATION";
type Difference = { official: string; submitted: string; explanation: string };
export type LinkSentinelEntry = {
  originalUrl: string; normalizedUrl: string; resolvedUrl: string | null; isShortened: boolean; redirectChain: string[];
  domainAnalysis: {
    hostname: string; rootDomain: string; subdomain: string; tld: string; claimedOrganization: string;
    officialWebsite: string | null; matchedOfficialDomain: string | null; organizationDomainStatus: "VERIFIED" | "MISMATCH" | "UNKNOWN";
    domainStatus: DomainStatus; domainMatch: boolean; isLookalike: boolean; isTyposquatting: boolean;
    differenceType: string[]; differences: Difference[]; domainRiskContribution: number; similarityScore: number;
  };
  typosquatting: { detected: boolean; similarityScore: number; matchedBrandDomain: string | null };
  securityMetadata: { https: boolean; domainAgeDays: null; metadataStatus: "UNAVAILABLE" };
  phishingSignals: string[]; riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"; verdict: "SAFE" | "SUSPICIOUS" | "SCAM";
  confidenceScore: number; evidence: string[]; userWarningMessage: string;
};

export function extractUrls(text: string) {
  const matches = text.match(/(?:https?:\/\/|www\.)[^\s<>"']+|\b(?:bit\.ly|tinyurl\.com|is\.gd|t\.co|ow\.ly|buff\.ly|cutt\.ly|rebrand\.ly|rb\.gy|shorturl\.at|tiny\.cc|lnkd\.in)\/[a-z0-9_-]+/gi) || [];
  return [...new Set(matches.map((url) => url.replace(/[),.;!?\]}]+$/g, "")))].slice(0, 10);
}

function normalizeUrl(rawUrl: string) {
  const input = rawUrl.trim();
  const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  url.hostname = normalizeHostname(url.hostname);
  for (const key of [...url.searchParams.keys()]) if (/^(utm_.+|fbclid|gclid|mc_cid|mc_eid)$/i.test(key)) url.searchParams.delete(key);
  url.hash = "";
  return url.toString();
}

export function normalizeHostname(hostname: string) {
  if (!hostname) return "";
  const input = hostname.trim();
  try {
    if (/^https?:\/\//i.test(input)) {
      return new URL(input).hostname.toLowerCase().replace(/\.$/, "");
    }
    return new URL(`http://${input.replace(/\.$/, "")}`).hostname.toLowerCase().replace(/\.$/, "");
  } catch { return ""; }
}

export function getRegistrableDomain(hostname: string) {
  hostname = normalizeHostname(hostname);
  const labels = hostname.split(".");
  const suffix = labels.slice(-2).join(".");
  return labels.length <= 2 ? hostname : MULTI_LABEL_SUFFIXES.has(suffix) ? labels.slice(-3).join(".") : suffix;
}

function getSubdomain(hostname: string) {
  const labels = normalizeHostname(hostname).split(".");
  const rootLabels = getRegistrableDomain(hostname).split(".").length;
  return labels.slice(0, Math.max(0, labels.length - rootLabels)).join(".");
}

function editDistance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j++) { const old = row[j]; row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1)); previous = old; }
  }
  return row[b.length];
}

const CONFUSABLES: Record<string, string> = { "0": "o", "1": "i", "ı": "i", "ℓ": "l", "5": "s", "4": "a", "3": "e", "8": "b", "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "х": "x", "і": "i", "ј": "j", "у": "y", "к": "k", "м": "m", "т": "t", "в": "b" };
const foldLookalikes = (value: string) => [...value.toLowerCase()].map((char) => CONFUSABLES[char] || char).join("");

function explainDifference(official: string, submitted: string) {
  const officialLabel = getRegistrableDomain(official).split(".")[0];
  const submittedRoot = getRegistrableDomain(submitted);
  const submittedLabel = submittedRoot.split(".")[0];
  const types: string[] = [], explanations: string[] = [];
  const unicode = domainToUnicode(submitted);
  if (unicode !== submitted && /[^\x00-\x7F]/.test(unicode)) {
    types.push("unicode_homoglyph");
    explanations.push(`Internationalized hostname ${unicode} may contain characters that visually imitate Latin letters.`);
  }
  if (foldLookalikes(submittedLabel) === foldLookalikes(officialLabel) && submittedLabel !== officialLabel) {
    types.push("character_substitution");
    const index = [...submittedLabel].findIndex((char, i) => char !== officialLabel[i]);
    const expected = officialLabel[index], found = submittedLabel[index];
    explanations.push(expected && found ? `Character substitution detected: '${expected}' appears as '${found}'.` : "Lookalike character substitution detected.");
  }
  const officialPrefix = getRegistrableDomain(official).split(".")[0];
  if (submittedLabel.includes("-") && (submittedLabel.replace(/-/g, "") === officialPrefix || submittedLabel.startsWith(`${officialPrefix}-`) || official.split(".").slice(0, -1).join("-") === submitted.split(".").slice(0, -1).join("-"))) {
    types.push("hyphen_manipulation");
    explanations.push("The submitted hostname uses a hyphenated structure to imitate the official domain.");
  }
  const distance = editDistance(officialLabel, submittedLabel);
  if (distance === 1 && officialLabel.length !== submittedLabel.length) {
    const type = submittedLabel.length > officialLabel.length ? "extra_character" : "missing_character";
    types.push(type);
    explanations.push(type === "extra_character" ? "The submitted registrable domain contains an extra character." : "The submitted registrable domain is missing a character from the official domain.");
  } else if (distance === 1 && officialLabel.length === submittedLabel.length && !types.includes("character_substitution")) {
    const transposed = [...officialLabel].some((char, i) => char !== submittedLabel[i] && officialLabel[i + 1] === submittedLabel[i] && char === submittedLabel[i + 1]);
    types.push(transposed ? "character_transposition" : "character_substitution");
    explanations.push(transposed ? "Two neighboring characters appear to be transposed." : "A character differs from the official registrable domain.");
  }
  if (officialLabel === submittedLabel && submittedRoot !== getRegistrableDomain(official)) {
    types.push("wrong_tld");
    explanations.push("The organization name matches, but the submitted website uses a different domain suffix.");
  }
  const brand = officialPrefix;
  if (submittedLabel.startsWith(`${brand}-`) || new RegExp(`^${brand}(?:jobs?|careers?|recruitment|offer)`, "i").test(submittedLabel)) {
    types.push("misleading_keyword");
    explanations.push("The domain adds recruitment-related words to the organization name without matching its verified domain.");
  }
  if (!types.length) {
    types.push("different_registrable_domain");
    explanations.push("The submitted website is not the verified registrable domain for the claimed organization.");
  }
  return { types: [...new Set(types)], explanations };
}

export function compareDomains(submittedHostname: string, claimedOrganization: string, contextText = "") {
  const hostname = normalizeHostname(submittedHostname);
  const organization = findVerifiedOrganization(claimedOrganization, contextText);
  const rootDomain = getRegistrableDomain(hostname), labels = hostname.split(".");
  const base = { hostname, rootDomain, subdomain: getSubdomain(hostname), tld: `.${labels.at(-1) || ""}` };
  if (!organization) return { ...base, organization: null, domainStatus: "UNKNOWN_ORGANIZATION" as DomainStatus, domainMatch: false, isLookalike: false, isTyposquatting: false, similarityScore: 0, matchedOfficialDomain: null, officialWebsite: null, differenceType: [] as string[], differences: [] as Difference[], domainRiskContribution: 0, explanation: [] as string[] };

  let best: { score: number; official: string; officialUrl: string; exact: boolean; subdomain: boolean } | null = null;
  for (const [index, domainValue] of organization.officialDomains.entries()) {
    const official = normalizeHostname(domainValue), officialRoot = getRegistrableDomain(official);
    const exact = hostname === official, subdomain = organization.allowSubdomains && hostname.endsWith(`.${official}`);
    const candidateLabel = rootDomain.split(".")[0], officialLabel = officialRoot.split(".")[0];
    const similarityScore = Math.max(
      Math.round(100 * (1 - editDistance(rootDomain, officialRoot) / Math.max(rootDomain.length, officialRoot.length))),
      Math.round(100 * (1 - editDistance(hostname, official) / Math.max(hostname.length, official.length))),
      Math.round(100 * (1 - editDistance(candidateLabel, officialLabel) / Math.max(candidateLabel.length, officialLabel.length))),
    );
    const option = { score: exact || subdomain ? 100 : similarityScore, official, officialUrl: organization.officialUrls[index], exact, subdomain };
    if (!best || option.exact || option.subdomain || option.score > best.score) best = option;
  }
  const selected = best!;
  const difference = selected.exact || selected.subdomain ? { types: [] as string[], explanations: [] as string[] } : explainDifference(selected.official, hostname);
  const brand = selected.official.split(".")[0];
  const misleadingKeyword = difference.types.includes("misleading_keyword");
  const sameBrandOtherTld = rootDomain.split(".")[0] === getRegistrableDomain(selected.official).split(".")[0];
  const close = selected.score >= 78 || misleadingKeyword || sameBrandOtherTld;
  const domainStatus: DomainStatus = selected.exact ? "OFFICIAL_MATCH" : selected.subdomain ? "VERIFIED_SUBDOMAIN" : close ? (difference.types.some((type) => ["character_substitution", "extra_character", "missing_character", "character_transposition", "hyphen_manipulation", "unicode_homoglyph"].includes(type)) ? "TYPOSQUATTING_DETECTED" : "LOOKALIKE_DOMAIN") : "SUSPICIOUS_DOMAIN";
  const differenceTypes = selected.exact || selected.subdomain ? [] : difference.types;
  const explanations = selected.exact ? [`Submitted hostname exactly matches verified domain ${selected.official}.`] : selected.subdomain ? [`Submitted hostname is a subdomain of verified domain ${selected.official}.`] : [`Official domain is ${selected.official}.`, `Submitted domain is ${hostname}.`, ...difference.explanations];
  const differences: Difference[] = selected.exact || selected.subdomain ? [] : [{ official: selected.official, submitted: hostname, explanation: difference.explanations.join(" ") || "The hostname is not an exact match for the verified official domain." }];
  const domainRiskContribution = selected.exact ? 0 : selected.subdomain ? 1 : domainStatus === "TYPOSQUATTING_DETECTED" ? 16 : domainStatus === "LOOKALIKE_DOMAIN" ? 13 : 8;
  return { ...base, organization, domainStatus, domainMatch: selected.exact || selected.subdomain, isLookalike: close && !selected.exact && !selected.subdomain, isTyposquatting: domainStatus === "TYPOSQUATTING_DETECTED", similarityScore: selected.score, matchedOfficialDomain: selected.official, officialWebsite: selected.officialUrl, differenceType: differenceTypes, differences, domainRiskContribution, explanation: explanations, matchedBrand: brand };
}

function ipIsPublic(address: string) {
  const version = net.isIP(address);
  if (version === 4) {
    const [a, b] = address.split(".").map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 0 || b === 168)));
  }
  if (version !== 6) return false;
  const normalized = address.toLowerCase(), mapped = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  if (mapped) return ipIsPublic(mapped);
  return normalized !== "::1" && normalized !== "::" && !(normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb") || normalized.startsWith("2001:db8"));
}

async function validatePublicUrl(value: string) {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("Malformed URL"); }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Unsupported protocol");
  const hostname = url.hostname.toLowerCase();
  if (url.username || url.password) throw new Error("Credential-bearing URLs are not allowed");
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal") || hostname === "metadata.google.internal") throw new Error("Internal hostname blocked");
  if (net.isIP(hostname)) {
    const family = net.isIP(hostname);
    if (!ipIsPublic(hostname)) throw new Error("Private IP blocked");
    return { url, address: hostname, family };
  }
  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!records.length || records.some((record) => !ipIsPublic(record.address))) throw new Error("Non-public destination blocked");
  return { url, address: records[0].address, family: records[0].family };
}

function safeHead(url: URL, address: string, family: number) {
  return new Promise<{ status: number; location: string | null }>((resolve, reject) => {
    const transport = url.protocol === "https:" ? https : http;
    const request = transport.request(url, { method: "HEAD", timeout: 5000, lookup: (_hostname, _options, callback) => callback(null, address, family), headers: { "user-agent": "CareerGuardian-LinkSentinel/1.0" } }, (response) => {
      let bytes = 0;
      response.on("data", (chunk: Buffer) => { bytes += chunk.length; if (bytes > 65536) request.destroy(new Error("Response size limit exceeded")); });
      response.on("end", () => resolve({ status: response.statusCode || 0, location: typeof response.headers.location === "string" ? response.headers.location : null }));
    });
    request.on("timeout", () => request.destroy(new Error("Request timed out")));
    request.on("error", reject);
    request.end();
  });
}

async function resolveSafely(initialUrl: string) {
  const chain: string[] = [];
  let current = initialUrl;
  for (let hop = 0; hop <= 5; hop++) {
    const target = await validatePublicUrl(current), url = target.url;
    chain.push(url.toString());
    const response = await safeHead(url, target.address, target.family);
    if (![301, 302, 303, 307, 308].includes(response.status) || !response.location) return { finalUrl: url.toString(), chain, status: response.status };
    if (hop === 5) throw new Error("Redirect limit reached");
    current = new URL(response.location, url).toString();
  }
  return { finalUrl: current, chain, status: 0 };
}

export async function resolvePublicUrlSafely(rawUrl: string) {
  return resolveSafely(normalizeUrl(rawUrl));
}

export async function analyzeLink(rawUrl: string, contextText = "", claimedOrganization = ""): Promise<LinkSentinelEntry> {
  const normalizedUrl = normalizeUrl(rawUrl), original = new URL(normalizedUrl);
  const isShortened = SHORTENERS.has(original.hostname.toLowerCase());
  let resolvedUrl: string | null = normalizedUrl, redirectChain: string[] = [], resolutionFailure = "";
  try { const resolution = await resolveSafely(normalizedUrl); resolvedUrl = resolution.finalUrl; redirectChain = resolution.chain; }
  catch (error) { resolvedUrl = null; resolutionFailure = error instanceof Error ? error.message : "Safe redirect analysis failed"; }
  const finalUrl = resolvedUrl ? new URL(resolvedUrl) : original;
  const comparison = compareDomains(finalUrl.hostname, claimedOrganization, contextText);
  const domainStatus = isShortened && resolvedUrl === null ? "SHORTENED_URL" : comparison.domainStatus;
  const domainRiskContribution = isShortened && resolvedUrl === null ? 2 : comparison.domainRiskContribution;
  const signals: string[] = [], evidence = [...(comparison.explanation || [])];
  if (isShortened) signals.push("SHORTENED_URL");
  if (comparison.organization && !comparison.domainMatch && domainStatus !== "SHORTENED_URL") signals.push("ORGANIZATION_DOMAIN_MISMATCH");
  if (comparison.isTyposquatting) signals.push("POSSIBLE_TYPOSQUATTING");
  if (SUSPICIOUS_TLDS.has(comparison.tld.slice(1))) { signals.push("SCRUTINY_TLD"); evidence.push("This TLD may merit additional review; the TLD alone does not indicate fraud."); }
  if (/\b(login|verify|payment|registration|document-upload|candidate-verification)\b/i.test(finalUrl.pathname)) signals.push("SENSITIVE_APPLICATION_PATH");
  if (/(forms\.gle|docs\.google\.com\/forms|typeform\.com)/i.test(finalUrl.hostname)) signals.push("EXTERNAL_APPLICATION_FORM");
  if (finalUrl.hostname.split(".").some((part) => part.startsWith("xn--"))) signals.push("INTERNATIONALIZED_DOMAIN");
  if (resolutionFailure) evidence.push(`Redirect analysis unavailable: ${resolutionFailure}.`);
  if (isShortened && resolvedUrl === null) evidence.push("The short link destination could not be resolved, so its final domain remains unverified.");
  else if (isShortened) evidence.push("A URL shortener was detected; the resolved destination is analyzed. Shortening alone does not indicate fraud.");
  if (!comparison.organization) evidence.push("Official domain could not be independently verified because the organization is unknown or absent from the verified registry.");
  const riskLevel: LinkSentinelEntry["riskLevel"] = domainRiskContribution >= 15 ? "HIGH" : domainRiskContribution >= 8 ? "MEDIUM" : "LOW";
  const isVerified = comparison.domainMatch && domainStatus !== "SHORTENED_URL";
  const officialWebsite = comparison.officialWebsite;
  const userWarningMessage = isVerified ? `Submitted hostname matches the verified ${comparison.organization?.name} domain.` : comparison.isLookalike ? `Submitted website appears to imitate the verified ${comparison.organization?.name} domain. Review the exact domain difference.` : "Official domain could not be independently verified. Confirm through the organization’s known official channels.";
  return {
    originalUrl: rawUrl, normalizedUrl, resolvedUrl, isShortened, redirectChain,
    domainAnalysis: {
      hostname: finalUrl.hostname.toLowerCase(), rootDomain: comparison.rootDomain, subdomain: comparison.subdomain, tld: comparison.tld,
      claimedOrganization: comparison.organization?.name || "Unknown", officialWebsite, matchedOfficialDomain: comparison.matchedOfficialDomain,
      organizationDomainStatus: !comparison.organization ? "UNKNOWN" : isVerified ? "VERIFIED" : "MISMATCH", domainStatus,
      domainMatch: comparison.domainMatch, isLookalike: comparison.isLookalike, isTyposquatting: comparison.isTyposquatting,
      differenceType: comparison.differenceType, differences: comparison.differences, domainRiskContribution, similarityScore: comparison.similarityScore,
    },
    typosquatting: { detected: comparison.isTyposquatting, similarityScore: comparison.similarityScore, matchedBrandDomain: comparison.matchedOfficialDomain },
    securityMetadata: { https: finalUrl.protocol === "https:", domainAgeDays: null, metadataStatus: "UNAVAILABLE" },
    phishingSignals: signals, riskLevel, verdict: isVerified ? "SAFE" : "SUSPICIOUS", confidenceScore: comparison.domainMatch ? 95 : comparison.organization ? 65 : 25,
    evidence: [...new Set(evidence)], userWarningMessage,
  };
}

export async function analyzeLinks(text: string, claimedOrganization = "", directUrl = "") {
  const urls = [...new Set([...extractUrls(text), ...(directUrl ? [directUrl] : [])])].slice(0, 10);
  const results: LinkSentinelEntry[] = [];
  for (const url of urls) {
    try { results.push(await analyzeLink(url, text, claimedOrganization)); }
    catch (error) {
      const reason = error instanceof Error ? error.message : "Analysis failed";
      try {
        const normalized = normalizeUrl(url), parsed = new URL(normalized), comparison = compareDomains(parsed.hostname, claimedOrganization, text);
        results.push({
          originalUrl: url, normalizedUrl: normalized, resolvedUrl: null, isShortened: SHORTENERS.has(parsed.hostname), redirectChain: [],
          domainAnalysis: { hostname: parsed.hostname, rootDomain: comparison.rootDomain, subdomain: comparison.subdomain, tld: comparison.tld, claimedOrganization: comparison.organization?.name || "Unknown", officialWebsite: comparison.officialWebsite, matchedOfficialDomain: comparison.matchedOfficialDomain, organizationDomainStatus: comparison.organization ? "MISMATCH" : "UNKNOWN", domainStatus: comparison.domainStatus, domainMatch: comparison.domainMatch, isLookalike: comparison.isLookalike, isTyposquatting: comparison.isTyposquatting, differenceType: comparison.differenceType, differences: comparison.differences, domainRiskContribution: comparison.domainRiskContribution, similarityScore: comparison.similarityScore },
          typosquatting: { detected: comparison.isTyposquatting, similarityScore: comparison.similarityScore, matchedBrandDomain: comparison.matchedOfficialDomain },
          securityMetadata: { https: parsed.protocol === "https:", domainAgeDays: null, metadataStatus: "UNAVAILABLE" }, phishingSignals: ["SAFE_RESOLUTION_UNAVAILABLE"], riskLevel: "LOW", verdict: "SUSPICIOUS", confidenceScore: 0,
          evidence: [`Redirect analysis unavailable: ${reason}.`, ...(comparison.explanation || [])], userWarningMessage: "Link analysis was unavailable. Confirm this URL independently before using it.",
        });
      } catch {
        results.push({ originalUrl: url, normalizedUrl: "", resolvedUrl: null, isShortened: false, redirectChain: [],
          domainAnalysis: { hostname: "", rootDomain: "", subdomain: "", tld: "", claimedOrganization: "Unknown", officialWebsite: null, matchedOfficialDomain: null, organizationDomainStatus: "UNKNOWN", domainStatus: "UNVERIFIED_DOMAIN", domainMatch: false, isLookalike: false, isTyposquatting: false, differenceType: [], differences: [], domainRiskContribution: 0, similarityScore: 0 },
          typosquatting: { detected: false, similarityScore: 0, matchedBrandDomain: null }, securityMetadata: { https: false, domainAgeDays: null, metadataStatus: "UNAVAILABLE" },
          phishingSignals: ["MALFORMED_URL"], riskLevel: "LOW", verdict: "SUSPICIOUS", confidenceScore: 0, evidence: ["The submitted URL is malformed and could not be analyzed."], userWarningMessage: "Enter a complete public website URL to check it.",
        });
      }
    }
  }
  return results;
}
