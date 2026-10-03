import dns from "node:dns/promises";
import net from "node:net";
import { compareDomains, fetchPublicPageSafely, getRegistrableDomain, validatePublicUrlSafely } from "./linkSentinel/index.ts";
import { findVerifiedOrganization } from "./linkSentinel/registry.ts";
import type { SafePublicPage } from "./linkSentinel/index.ts";
import type {
  AuthenticityStatus,
  WebsiteAuthenticityEvidence,
  WebsiteAuthenticityResult,
} from "./websiteAuthenticity.types.ts";

type SiteSnapshot = {
  url: string;
  rootDomain: string;
  a: string[];
  aaaa: string[];
  cname: string[];
  ns: string[];
  mx: string[];
  txt: string[];
  caa: string[];
  page: SafePublicPage | null;
  registration: WebsiteAuthenticityResult["registration"];
  asn: { number: string | null; organization: string | null };
  title: string;
  text: string;
  footerText: string;
  emails: string[];
  links: string[];
  assetOrigins: string[];
};

const LOOKUP_TIMEOUT_MS = 4500;
const CDN_MARKERS = ["cloudflare", "akamai", "fastly", "cloudfront", "azureedge", "googlecdn", "imperva", "stackpath"];
const timestamp = () => new Date().toISOString();

function normalizeUrl(value: string) {
  const candidate = value.trim();
  const url = new URL(/^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`);
  if (url.username || url.password) throw new Error("URLs containing credentials are not supported.");
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Only public HTTP and HTTPS websites can be analyzed.");
  url.hash = "";
  return url;
}

async function timed<T>(promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Lookup timed out")), LOOKUP_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function record<T>(lookup: () => Promise<T>, format: (value: T) => string[]) {
  try {
    return format(await timed(lookup()));
  } catch {
    return [];
  }
}

function flattenTxt(records: string[][]) {
  return records.map((record) => record.join(""));
}

function datesFromRdap(value: unknown) {
  const events = isRecord(value) && Array.isArray(value.events) ? value.events : [];
  const result = { createdAt: null as string | null, updatedAt: null as string | null, expiresAt: null as string | null };
  for (const item of events) {
    if (!isRecord(item) || typeof item.eventAction !== "string" || typeof item.eventDate !== "string") continue;
    if (item.eventAction === "registration") result.createdAt = item.eventDate;
    if (item.eventAction === "last changed") result.updatedAt = item.eventDate;
    if (item.eventAction === "expiration") result.expiresAt = item.eventDate;
  }
  return result;
}

function registrarFromRdap(value: unknown) {
  if (!isRecord(value) || !Array.isArray(value.entities)) return null;
  for (const entity of value.entities) {
    if (!isRecord(entity) || !Array.isArray(entity.roles) || !entity.roles.includes("registrar")) continue;
    if (typeof entity.handle === "string") return entity.handle;
    if (typeof entity.name === "string") return entity.name;
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function rdap(url: string) {
  try {
    const response = await fetchPublicPageSafely(url, { maxBytes: 65536, maxRedirects: 3, timeoutMs: LOOKUP_TIMEOUT_MS });
    if (response.status < 200 || response.status >= 300 || !response.body) return null;
    return JSON.parse(response.body) as unknown;
  } catch {
    return null;
  }
}

async function lookupAsn(address: string) {
  if (net.isIP(address) === 0) return { number: null, organization: null };
  try {
    const result = await rdap(`https://api.bgpview.io/ip/${encodeURIComponent(address)}`);
    if (!isRecord(result) || !isRecord(result.data) || !Array.isArray(result.data.prefixes)) {
      return { number: null, organization: null };
    }
    const prefix = result.data.prefixes.find((item: unknown) => isRecord(item) && isRecord(item.asn));
    if (!isRecord(prefix) || !isRecord(prefix.asn)) return { number: null, organization: null };
    return {
      number: typeof prefix.asn.asn === "number" ? `AS${prefix.asn.asn}` : null,
      organization: typeof prefix.asn.name === "string" ? prefix.asn.name : null,
    };
  } catch {
    return { number: null, organization: null };
  }
}

function textFromHtml(html: string) {
  return html
    .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20000);
}

function extractPageDetails(html: string, baseUrl: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, "").trim().slice(0, 240) || "";
  const text = textFromHtml(html);
  const footerHtml = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/i)?.[1] || "";
  const footerText = textFromHtml(footerHtml);
  const emails = [...new Set(html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [])].slice(0, 20);
  const links = [...html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi)]
    .slice(0, 100)
    .map((match) => resolveHost(match[1], baseUrl))
    .filter((host): host is string => Boolean(host));
  const rawAssets = [...html.matchAll(/<(?:img|script|iframe|source|link)\b[^>]*(?:src|href)\s*=\s*["']([^"']+)["'][^>]*>/gi)]
    .slice(0, 150)
    .map((match) => resolveHost(match[1], baseUrl))
    .filter((host): host is string => Boolean(host));
  return { title, text, footerText, emails, links: [...new Set(links)], assetOrigins: [...new Set(rawAssets)] };
}

function resolveHost(rawValue: string, baseUrl: string) {
  try {
    const url = new URL(rawValue, baseUrl);
    return url.protocol === "https:" || url.protocol === "http:" ? url.hostname.toLowerCase() : null;
  } catch {
    return null;
  }
}

async function inspectSite(url: URL): Promise<SiteSnapshot> {
  await validatePublicUrlSafely(url.toString());
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const rootDomain = getRegistrableDomain(host);
  const [a, aaaa, cname, ns, mx, txt, caa, page, registrationData] = await Promise.all([
    net.isIPv4(host) ? Promise.resolve([host]) : record(() => dns.resolve4(host), (values) => values),
    net.isIPv6(host) ? Promise.resolve([host]) : record(() => dns.resolve6(host), (values) => values),
    record(() => dns.resolveCname(host), (values) => values),
    record(() => dns.resolveNs(host), (values) => values),
    record(() => dns.resolveMx(host), (values) => values.map((item) => `${item.exchange} (priority ${item.priority})`)),
    record(() => dns.resolveTxt(host), flattenTxt),
    record(() => dns.resolveCaa(host), (values) => values.map((item) => `${item.issue || item.issuewild || item.iodef || ""} (flags ${item.critical})`)),
    fetchPublicPageSafely(url.toString(), { maxBytes: 196608, maxRedirects: 3, timeoutMs: 5500 }).catch(() => null),
    net.isIP(host) ? Promise.resolve(null) : rdap(`https://rdap.org/domain/${encodeURIComponent(rootDomain)}`),
  ]);
  const domainDates = datesFromRdap(registrationData);
  const createdAt = domainDates.createdAt;
  const age = createdAt ? Math.floor((Date.now() - Date.parse(createdAt)) / 86400000) : null;
  const registration = {
    registrar: registrarFromRdap(registrationData),
    createdAt,
    updatedAt: domainDates.updatedAt,
    expiresAt: domainDates.expiresAt,
    domainAgeDays: Number.isFinite(age) && age !== null && age >= 0 ? age : null,
    status: registrationData ? "AVAILABLE" as const : "UNAVAILABLE" as const,
  };
  const parsed = page ? extractPageDetails(page.body, page.finalUrl) : { title: "", text: "", footerText: "", emails: [], links: [], assetOrigins: [] };
  const addresses = [...a, ...aaaa].slice(0, 1);
  const asn = addresses.length ? await lookupAsn(addresses[0]) : { number: null, organization: null };
  return {
    url: host,
    rootDomain,
    a,
    aaaa,
    cname,
    ns,
    mx,
    txt,
    caa,
    page,
    registration,
    asn,
    ...parsed,
  };
}

function cleanOrganizationTokens(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(/\s+/)
    .filter((token) => token.length > 2 && !["limited", "ltd", "private", "pvt", "inc", "corporation", "company", "technologies"].includes(token));
}

function similarity(left: string, right: string) {
  const leftWords = new Set(left.toLowerCase().match(/[a-z0-9]{3,}/g) || []);
  const rightWords = new Set(right.toLowerCase().match(/[a-z0-9]{3,}/g) || []);
  if (!leftWords.size || !rightWords.size) return null;
  const overlap = [...leftWords].filter((word) => rightWords.has(word)).length;
  return Math.round((overlap / (leftWords.size + rightWords.size - overlap)) * 100);
}

function isCdn(provider: string | null) {
  return Boolean(provider && CDN_MARKERS.some((marker) => provider.toLowerCase().includes(marker)));
}

function comparableSet(left: string[], right: string[]): AuthenticityStatus {
  if (!left.length || !right.length) return "UNAVAILABLE";
  if (left.some((value) => right.includes(value))) return "MATCH";
  return "MISMATCH";
}

function notApplicableResult(claimedOrganization: string, timestampValue: string): WebsiteAuthenticityResult {
  return {
    status: "NOT_APPLICABLE",
    claimedOrganization: claimedOrganization || null,
    submittedUrl: null,
    finalUrl: null,
    redirectChain: [],
    referenceUrl: null,
    referenceStatus: "UNKNOWN",
    domain: { submittedDomain: null, rootDomain: null, referenceDomain: null, status: "NOT_APPLICABLE", suspiciousPatterns: [] },
    dns: { a: [], aaaa: [], cname: [], ns: [], mx: [], txt: [], caa: [], reference: { a: [], aaaa: [], cname: [], ns: [], mx: [], txt: [], caa: [] }, dnssec: "UNAVAILABLE", status: "UNAVAILABLE" },
    ip: { submitted: [], reference: [], relationship: "NOT_APPLICABLE" },
    asn: { submitted: null, reference: null, submittedOrganization: null, referenceOrganization: null, relationship: "NOT_APPLICABLE" },
    hosting: { submittedProvider: null, referenceProvider: null, relationship: "NOT_APPLICABLE" },
    nameservers: { submitted: [], reference: [], relationship: "NOT_APPLICABLE" },
    tls: { issuer: null, subject: null, sanMatches: null, valid: null, validFrom: null, validTo: null, status: "NOT_APPLICABLE" },
    registration: { registrar: null, createdAt: null, updatedAt: null, expiresAt: null, domainAgeDays: null, status: "UNAVAILABLE" },
    ownership: { organizationMatch: "NOT_APPLICABLE", contactDomainMatch: "NOT_APPLICABLE", footerMatch: "NOT_APPLICABLE", officialLinksMatch: "NOT_APPLICABLE", contradictions: [] },
    assets: { officialAssetOrigins: 0, unrelatedAssetOrigins: 0, suspiciousAssetOrigins: [], status: "NOT_APPLICABLE" },
    contentSimilarity: { similarityScore: null, interpretation: "No website content was available for comparison." },
    infrastructureRelationship: "UNKNOWN",
    positiveSignals: [],
    redFlags: [],
    unavailableSignals: [],
    evidence: [{
      signal: "website-authenticity",
      observedValue: null,
      referenceValue: null,
      status: "NOT_APPLICABLE",
      source: "SUBMITTED_WEBSITE",
      timestamp: timestampValue,
      confidence: 0,
    }],
    evidenceCoverage: { observed: 0, total: 13 },
    confidence: 0,
  };
}

export function unavailableWebsiteAuthenticity(submittedUrl: string, claimedOrganization?: string): WebsiteAuthenticityResult {
  const result = notApplicableResult(claimedOrganization?.trim() || "", timestamp());
  result.status = "UNAVAILABLE";
  result.submittedUrl = submittedUrl.slice(0, 2048);
  result.domain.status = "UNAVAILABLE";
  result.infrastructureRelationship = "UNKNOWN";
  result.unavailableSignals = ["Live website authenticity and infrastructure lookups could not be completed."];
  result.evidence[0].status = "UNAVAILABLE";
  return result;
}

export async function inspectWebsiteAuthenticity(input: {
  submittedUrl?: string;
  claimedOrganization?: string;
  contactEmail?: string;
  content?: string;
}): Promise<WebsiteAuthenticityResult> {
  const now = timestamp();
  const claimedOrganization = input.claimedOrganization?.trim() || "";
  if (!input.submittedUrl?.trim()) return notApplicableResult(claimedOrganization, now);

  let submittedUrl: URL;
  try {
    submittedUrl = normalizeUrl(input.submittedUrl);
  } catch (error) {
    const result = notApplicableResult(claimedOrganization, now);
    result.status = "UNAVAILABLE";
    result.submittedUrl = input.submittedUrl.slice(0, 2048);
    result.domain.status = "UNAVAILABLE";
    result.infrastructureRelationship = "UNKNOWN";
    result.unavailableSignals.push(error instanceof Error ? error.message : "The submitted website URL is invalid.");
    result.evidence[0].status = "UNAVAILABLE";
    return result;
  }

  const organization = findVerifiedOrganization(claimedOrganization, input.content || "");
  const referenceUrl = organization?.officialUrls[0] || null;
  const referenceStatus: WebsiteAuthenticityResult["referenceStatus"] = organization ? "VERIFIED" : "UNAVAILABLE";
  const submittedPromise = inspectSite(submittedUrl);
  const referencePromise = referenceUrl
    ? inspectSite(new URL(referenceUrl)).catch(() => null)
    : Promise.resolve(null);
  const [submitted, reference] = await Promise.all([submittedPromise.catch(() => null), referencePromise]);
  const submittedHost = submitted?.url || submittedUrl.hostname.toLowerCase();
  const finalHost = submitted?.page?.finalUrl ? new URL(submitted.page.finalUrl).hostname.toLowerCase() : submittedHost;
  const referenceHost = reference?.page?.finalUrl ? new URL(reference.page.finalUrl).hostname.toLowerCase() : reference?.url || null;
  const officialDomains = organization?.officialDomains || [];
  const exactOfficialDomain = officialDomains.some((domain) => finalHost === domain || finalHost.endsWith(`.${domain}`));
  const domainComparison = compareDomains(finalHost, claimedOrganization, input.content || "");
  const domainStatus: AuthenticityStatus = !organization
    ? "UNKNOWN"
    : exactOfficialDomain
      ? "MATCH"
      : "MISMATCH";
  const redirectRoots = submitted?.page?.redirectChain.map((item) =>
    getRegistrableDomain(new URL(item).hostname),
  ) || [];
  const suspiciousPatterns = submitted
    ? [
        ...domainComparison.differenceType,
        ...(finalHost.split(".").length > 4 ? ["excessive_subdomains"] : []),
        ...(finalHost.split(".").slice(0, -2).some((label) => /(?:^|[-_])(login|verify|payment|recruit|career|job)(?:$|[-_])/i.test(label)) ? ["sensitive_keyword_in_subdomain"] : []),
        ...(finalHost.split(".").some((label) => label.startsWith("xn--")) ? ["internationalized_hostname"] : []),
        ...(domainStatus === "MISMATCH" && organization ? ["verified_organization_domain_mismatch"] : []),
        ...(submitted?.page?.finalUrl && getRegistrableDomain(finalHost) !== submitted.rootDomain ? ["redirected_to_different_root_domain"] : []),
        ...(new Set(redirectRoots).size > 1 ? ["cross_domain_redirect"] : []),
      ]
    : [];

  const submittedIps = submitted ? [...submitted.a, ...submitted.aaaa] : [];
  const referenceIps = reference ? [...reference.a, ...reference.aaaa] : [];
  const submittedProvider = submitted?.asn.organization || null;
  const referenceProvider = reference?.asn.organization || null;
  const cdnShared = isCdn(submittedProvider) && isCdn(referenceProvider)
    && submittedProvider?.toLowerCase() === referenceProvider?.toLowerCase();
  const ipRelationship: WebsiteAuthenticityResult["ip"]["relationship"] = !submitted || !reference || !submittedIps.length || !referenceIps.length
    ? "UNAVAILABLE"
    : submittedIps.some((address) => referenceIps.includes(address))
      ? "MATCH"
      : cdnShared
        ? "CDN_SHARED_INFRASTRUCTURE"
        : "DIFFERENT";
  const asnRelationship: WebsiteAuthenticityResult["asn"]["relationship"] = !submitted?.asn.number || !reference?.asn.number
    ? "UNAVAILABLE"
    : submitted.asn.number === reference.asn.number
      ? cdnShared ? "CDN_SHARED_INFRASTRUCTURE" : "MATCH"
      : "MISMATCH";
  const nameserverRelationship = comparableSet(submitted?.ns || [], reference?.ns || []);
  const tlsDetails = submitted?.page?.tls || null;
  const hostnameMatchesTls = Boolean(tlsDetails?.subjectAltName?.split(/,\s*/).some((name) => {
    const dnsName = name.replace(/^DNS:/i, "").toLowerCase();
    return dnsName === finalHost || (dnsName.startsWith("*.") && finalHost.endsWith(dnsName.slice(1)));
  }));
  const tlsValid = tlsDetails
    ? tlsDetails.authorized
      && Boolean(tlsDetails.validFrom && Date.parse(tlsDetails.validFrom) <= Date.now())
      && Boolean(tlsDetails.validTo && Date.parse(tlsDetails.validTo) > Date.now())
      && hostnameMatchesTls
    : null;
  const tlsStatus: AuthenticityStatus = tlsValid === null ? "UNAVAILABLE" : tlsValid ? "MATCH" : "MISMATCH";
  const organizationTokens = cleanOrganizationTokens(organization?.name || claimedOrganization);
  const orgTextMatch = organizationTokens.length > 0 && organizationTokens.some((token) =>
    `${submitted?.title || ""} ${submitted?.text || ""}`.toLowerCase().includes(token),
  );
  const footerMatch = organizationTokens.length > 0 && organizationTokens.some((token) =>
    (submitted?.footerText || "").toLowerCase().includes(token),
  );
  const emailDomains = [...new Set([
    ...(input.contactEmail?.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []),
    ...(submitted?.emails || []),
  ].map((email) => email.split("@")[1]?.toLowerCase()).filter((value): value is string => Boolean(value)))];
  const contactDomainMatch: AuthenticityStatus = !emailDomains.length
    ? "UNKNOWN"
    : reference && emailDomains.some((domain) => domain === reference.rootDomain || domain.endsWith(`.${reference.rootDomain}`))
      ? "MATCH"
      : reference
        ? "MISMATCH"
        : "UNKNOWN";
  const officialLinksMatch: AuthenticityStatus = !submitted?.links.length
    ? "UNAVAILABLE"
    : reference && submitted.links.some((host) => host === reference.rootDomain || host.endsWith(`.${reference.rootDomain}`))
      ? "MATCH"
      : "UNKNOWN";
  const officialAssetOrigins = reference
    ? (submitted?.assetOrigins || []).filter((host) => host === reference.rootDomain || host.endsWith(`.${reference.rootDomain}`)).length
    : 0;
  const knownCdnAssetOrigins = (submitted?.assetOrigins || []).filter((host) => CDN_MARKERS.some((marker) => host.includes(marker))).length;
  const unrelatedAssetOrigins = Math.max(0, (submitted?.assetOrigins.length || 0) - officialAssetOrigins - knownCdnAssetOrigins);
  const suspiciousAssetOrigins = reference
    ? (submitted?.assetOrigins || []).filter((host) => host !== reference.rootDomain && !host.endsWith(`.${reference.rootDomain}`) && !CDN_MARKERS.some((marker) => host.includes(marker))).slice(0, 10)
    : [];
  const similarityScore = submitted?.text && reference?.text ? similarity(submitted.text, reference.text) : null;
  const contentSimilarityInterpretation = similarityScore === null
    ? "Content comparison unavailable. Appearance or text resemblance is supporting evidence only and does not establish authenticity."
    : `Textual content overlap is ${similarityScore}%. Website appearance and copied content can be imitated; this is supporting evidence only.`;

  let infrastructureRelationship: WebsiteAuthenticityResult["infrastructureRelationship"] = "UNKNOWN";
  if (organization && reference) {
    if (exactOfficialDomain) infrastructureRelationship = "STRONG_MATCH";
    else if (cdnShared) infrastructureRelationship = "CDN_SHARED_INFRASTRUCTURE";
    else if (domainStatus === "MISMATCH") infrastructureRelationship = "MISMATCH";
    else if (asnRelationship === "MATCH" || nameserverRelationship === "MATCH" || officialLinksMatch === "MATCH") infrastructureRelationship = "PARTIAL_MATCH";
    else if (submitted) infrastructureRelationship = "WEAK_RELATIONSHIP";
  }

  const unavailableSignals = [
    ...(!reference ? ["Verified official reference website unavailable for this organization."] : []),
    ...(!submitted ? ["Submitted website, DNS, TLS and registration data unavailable."] : []),
    ...(submitted && !submitted.page ? ["Submitted website content or TLS data unavailable."] : []),
    ...(submitted && !reference ? ["No independent DNS/IP/ASN/nameserver comparison is available."] : []),
    ...(submitted && !submitted.registration.createdAt ? ["Public domain registration data unavailable."] : []),
    ...(submitted && !submitted.asn.number ? ["ASN/hosting provider lookup unavailable."] : []),
    "DNSSEC validation is unavailable from the configured resolver.",
    "Visual similarity analysis is not performed.",
  ];
  const redFlags: string[] = [];
  if (organization && domainStatus === "MISMATCH") redFlags.push("Submitted root domain does not match the organization’s curated verified domain.");
  if (contactDomainMatch === "MISMATCH") redFlags.push("Contact email domain does not match the verified organization reference.");
  if (nameserverRelationship === "MISMATCH" && reference) redFlags.push("Nameserver infrastructure differs from the verified reference; this is supporting evidence, not proof of fraud.");
  if (tlsStatus === "MISMATCH") redFlags.push("TLS certificate is invalid, expired, or does not cover the submitted hostname.");
  if (reference && submitted?.registration.domainAgeDays !== null && submitted?.registration.domainAgeDays !== undefined && submitted.registration.domainAgeDays < 90) {
    redFlags.push("The domain registration is recent; domain age alone does not establish fraud.");
  }
  if (suspiciousPatterns.includes("redirected_to_different_root_domain")) redFlags.push("The website redirected to a different registrable domain; verify the destination independently.");
  if (suspiciousPatterns.includes("cross_domain_redirect")) redFlags.push("The website redirect chain crosses registrable domains.");
  if (suspiciousPatterns.includes("excessive_subdomains") || suspiciousPatterns.includes("sensitive_keyword_in_subdomain")) {
    redFlags.push("The submitted URL uses a potentially misleading or excessive subdomain structure.");
  }
  if (/government|recruitment board|public service commission|railway|upsc|ssc/i.test(`${claimedOrganization} ${input.content || ""}`)
    && !/\.(gov|nic)\.in$/i.test(finalHost)) {
    redFlags.push("GOVERNMENT DOMAIN MISMATCH: the claimed government opportunity uses a domain other than .gov.in or .nic.in; authorized external platforms still require independent provenance checks.");
  }
  const positiveSignals: string[] = [];
  if (exactOfficialDomain && organization) positiveSignals.push("Submitted hostname matches a domain in CareerGuardian’s curated organization registry.");
  if (tlsStatus === "MATCH") positiveSignals.push("The TLS certificate is valid for the submitted hostname.");
  if (cdnShared) positiveSignals.push("Both sites use a matching CDN/network provider; shared infrastructure is not proof of common ownership.");
  if (officialAssetOrigins) positiveSignals.push(`${officialAssetOrigins} asset origin(s) are hosted on the verified reference domain.`);
  const observedCount = [
    Boolean(submitted),
    Boolean(submitted && (submitted.a.length || submitted.aaaa.length || submitted.ns.length)),
    Boolean(submitted?.page),
    Boolean(submitted?.page?.tls),
    Boolean(submitted?.registration.createdAt),
    Boolean(submitted?.asn.number),
    Boolean(reference),
    Boolean(reference && (reference.a.length || reference.aaaa.length)),
    Boolean(reference?.asn.number),
    Boolean(reference?.page),
    Boolean(submitted?.emails.length || input.contactEmail),
    Boolean(submitted?.assetOrigins.length),
    similarityScore !== null,
  ].filter(Boolean).length;
  const confidence = Math.round((observedCount / 13) * 100);
  const status: AuthenticityStatus = !submitted
    ? "UNAVAILABLE"
    : domainComparison.isLookalike || tlsStatus === "MISMATCH" || contactDomainMatch === "MISMATCH"
      ? "SUSPICIOUS"
      : domainStatus === "MISMATCH"
        ? "MISMATCH"
      : exactOfficialDomain
        ? "MATCH"
        : reference
          ? "PARTIAL_MATCH"
          : "UNKNOWN";
  const evidence: WebsiteAuthenticityEvidence[] = [];
  const addEvidence = (
    signal: string,
    observedValue: WebsiteAuthenticityEvidence["observedValue"],
    referenceValue: WebsiteAuthenticityEvidence["referenceValue"],
    evidenceStatus: AuthenticityStatus,
    source: WebsiteAuthenticityEvidence["source"],
    confidenceValue: number,
  ) => evidence.push({ signal, observedValue, referenceValue, status: evidenceStatus, source, timestamp: now, confidence: confidenceValue });
  addEvidence("domain", finalHost, referenceHost, domainStatus, "SUBMITTED_URL_VS_VERIFIED_REFERENCE", organization ? 95 : 0);
  addEvidence(
    "redirect-chain",
    submitted?.page?.redirectChain || null,
    reference?.page?.redirectChain || null,
    suspiciousPatterns.includes("cross_domain_redirect") || suspiciousPatterns.includes("redirected_to_different_root_domain") ? "SUSPICIOUS" : submitted?.page ? "MATCH" : "UNAVAILABLE",
    "SUBMITTED_WEBSITE",
    submitted?.page ? 80 : 0,
  );
  const hasDnsRecords = Boolean(submitted && [submitted.a, submitted.aaaa, submitted.cname, submitted.ns, submitted.mx, submitted.txt, submitted.caa].some((records) => records.length));
  addEvidence("dns", submitted ? [...submitted.a, ...submitted.aaaa, ...submitted.ns] : null, reference ? [...reference.a, ...reference.aaaa, ...reference.ns] : null, hasDnsRecords ? "PARTIAL_MATCH" : "UNAVAILABLE", "INDEPENDENT_SOURCE", hasDnsRecords ? 90 : 0);
  const ipEvidenceStatus: AuthenticityStatus = ipRelationship === "MATCH"
    ? "MATCH"
    : ipRelationship === "CDN_SHARED_INFRASTRUCTURE"
      ? "PARTIAL_MATCH"
      : ipRelationship === "DIFFERENT"
        ? "UNKNOWN"
        : "UNAVAILABLE";
  addEvidence("ip", submittedIps, referenceIps, ipEvidenceStatus, "INDEPENDENT_SOURCE", submittedIps.length ? 75 : 0);
  const asnEvidenceStatus: AuthenticityStatus = asnRelationship === "CDN_SHARED_INFRASTRUCTURE" ? "PARTIAL_MATCH" : asnRelationship;
  addEvidence("asn-hosting", submitted?.asn.number || null, reference?.asn.number || null, asnEvidenceStatus, "INDEPENDENT_SOURCE", submitted?.asn.number ? 75 : 0);
  addEvidence("nameservers", submitted?.ns || null, reference?.ns || null, nameserverRelationship, "INDEPENDENT_SOURCE", submitted?.ns.length ? 70 : 0);
  addEvidence("tls", tlsDetails?.subjectAltName || null, finalHost, tlsStatus, "SUBMITTED_WEBSITE", tlsDetails ? 95 : 0);
  addEvidence("registration", submitted?.registration.createdAt || null, null, submitted?.registration.createdAt ? "MATCH" : "UNAVAILABLE", "INDEPENDENT_SOURCE", submitted?.registration.createdAt ? 85 : 0);
  addEvidence("contact-domain", emailDomains, reference?.rootDomain || null, contactDomainMatch, "SUBMITTED_URL_VS_VERIFIED_REFERENCE", reference ? 75 : 0);
  addEvidence("organization-content", orgTextMatch ? organization?.name || claimedOrganization : null, organization?.name || null, orgTextMatch ? "PARTIAL_MATCH" : submitted ? "UNKNOWN" : "UNAVAILABLE", "SUBMITTED_WEBSITE", orgTextMatch ? 40 : 0);
  addEvidence("asset-origins", submitted?.assetOrigins || null, reference?.rootDomain || null, officialAssetOrigins ? "PARTIAL_MATCH" : submitted?.assetOrigins.length ? "UNKNOWN" : "UNAVAILABLE", "SUBMITTED_WEBSITE", officialAssetOrigins ? 50 : 0);
  addEvidence("content-similarity", similarityScore, null, similarityScore === null ? "UNAVAILABLE" : "PARTIAL_MATCH", "SUBMITTED_WEBSITE", similarityScore === null ? 0 : 30);

  return {
    status,
    claimedOrganization: claimedOrganization || null,
    submittedUrl: input.submittedUrl.slice(0, 2048),
    finalUrl: submitted?.page?.finalUrl || null,
    redirectChain: submitted?.page?.redirectChain || [],
    referenceUrl,
    referenceStatus,
    domain: {
      submittedDomain: submittedHost,
      rootDomain: submitted?.rootDomain || getRegistrableDomain(submittedHost),
      referenceDomain: referenceHost,
      status: domainStatus,
      suspiciousPatterns,
    },
    dns: {
      a: submitted?.a || [],
      aaaa: submitted?.aaaa || [],
      cname: submitted?.cname || [],
      ns: submitted?.ns || [],
      mx: submitted?.mx || [],
      txt: (submitted?.txt || []).slice(0, 10),
      caa: submitted?.caa || [],
      reference: {
        a: reference?.a || [],
        aaaa: reference?.aaaa || [],
        cname: reference?.cname || [],
        ns: reference?.ns || [],
        mx: reference?.mx || [],
        txt: (reference?.txt || []).slice(0, 10),
        caa: reference?.caa || [],
      },
      dnssec: "UNAVAILABLE",
      status: submitted && [submitted.a, submitted.aaaa, submitted.cname, submitted.ns, submitted.mx, submitted.txt, submitted.caa].some((records) => records.length) ? "AVAILABLE" : "UNAVAILABLE",
    },
    ip: { submitted: submittedIps, reference: referenceIps, relationship: ipRelationship },
    asn: {
      submitted: submitted?.asn.number || null,
      reference: reference?.asn.number || null,
      submittedOrganization: submittedProvider,
      referenceOrganization: referenceProvider,
      relationship: asnRelationship,
    },
    hosting: {
      submittedProvider,
      referenceProvider,
      relationship: cdnShared ? "CDN_SHARED_INFRASTRUCTURE" : asnRelationship,
    },
    nameservers: {
      submitted: submitted?.ns || [],
      reference: reference?.ns || [],
      relationship: nameserverRelationship,
    },
    tls: {
      issuer: tlsDetails?.issuer || null,
      subject: tlsDetails?.subject || null,
      sanMatches: tlsDetails ? hostnameMatchesTls : null,
      valid: tlsValid,
      validFrom: tlsDetails?.validFrom || null,
      validTo: tlsDetails?.validTo || null,
      status: tlsStatus,
    },
    registration: submitted?.registration || {
      registrar: null,
      createdAt: null,
      updatedAt: null,
      expiresAt: null,
      domainAgeDays: null,
      status: "UNAVAILABLE",
    },
    ownership: {
      organizationMatch: orgTextMatch ? "PARTIAL_MATCH" : reference ? "UNKNOWN" : "UNAVAILABLE",
      contactDomainMatch,
      footerMatch: footerMatch ? "PARTIAL_MATCH" : submitted?.footerText ? "UNKNOWN" : "UNAVAILABLE",
      officialLinksMatch,
      contradictions: redFlags,
    },
    assets: {
      officialAssetOrigins,
      unrelatedAssetOrigins,
      suspiciousAssetOrigins,
      status: !submitted?.assetOrigins.length ? "UNAVAILABLE" : officialAssetOrigins ? "PARTIAL_MATCH" : "UNKNOWN",
    },
    contentSimilarity: { similarityScore, interpretation: contentSimilarityInterpretation },
    infrastructureRelationship,
    positiveSignals,
    redFlags,
    unavailableSignals,
    evidence,
    evidenceCoverage: { observed: observedCount, total: 13 },
    confidence,
  };
}
