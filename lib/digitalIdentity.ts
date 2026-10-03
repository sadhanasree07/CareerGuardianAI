import type { NcsReferenceResult } from "./governmentRegistryNcs.ts";

export type DigitalIdentityStatus = "PASS" | "REVIEW" | "HIGH_RISK" | "UNKNOWN" | "NOT_APPLICABLE";

export type DigitalIdentitySignal = {
  signal: string;
  observedValue: string | null;
  referenceValue: string | null;
  status: string;
  source: string;
  independent: boolean;
  timestamp: string;
  confidence: number;
};

export type DigitalIdentityAssessment = {
  submittedUrl: string | null;
  finalUrl: string | null;
  claimedOrganization: string | null;
  referenceOrganization: string | null;
  referenceUrl: string | null;
  referenceStatus: "VERIFIED" | "UNAVAILABLE" | "UNKNOWN";
  domain: {
    submittedDomain: string | null;
    rootDomain: string | null;
    referenceDomain: string | null;
    status: string;
    suspiciousPatterns: string[];
  };
  registration: {
    registrar: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    expiresAt: string | null;
    domainAgeDays: number | null;
    status: string;
  };
  dns: {
    a: string[];
    aaaa: string[];
    cname: string[];
    ns: string[];
    mx: string[];
    txt: string[];
    caa: string[];
    dnssec: string;
    status: string;
  };
  infrastructure: {
    ips: string[];
    referenceIps: string[];
    asn: string | null;
    referenceAsn: string | null;
    asnOrganization: string | null;
    referenceAsnOrganization: string | null;
    hostingProvider: string | null;
    referenceHostingProvider: string | null;
    relationship: string;
  };
  tls: {
    issuer: string | null;
    subject: string | null;
    sanMatches: boolean | null;
    valid: boolean | null;
    status: string;
  };
  nameservers: {
    submitted: string[];
    reference: string[];
    relationship: string;
  };
  organizationIdentity: {
    organizationMatch: string;
    contactMatch: string;
    officialLinksMatch: string;
    ownershipSignals: string[];
    contradictions: string[];
  };
  recruiterIdentity: {
    recruiterName: string | null;
    recruiterEmail: string | null;
    recruiterDomain: string | null;
    organizationRelationship: string;
    status: string;
    evidence: string[];
  };
  opportunityIdentity: {
    jobTitle: string | null;
    jobId: string | null;
    notificationNumber: string | null;
    location: string | null;
    eligibility: string | null;
    salary: string | null;
    deadline: string | null;
    applicationUrl: string | null;
  };
  opportunityAuthorization: {
    status: "AUTHORIZED" | "PARTIALLY_VERIFIED" | "NOT_VERIFIED" | "CONTRADICTED" | "UNKNOWN" | "UNAVAILABLE";
    matchedSources: string[];
    contradictions: string[];
    evidence: string[];
  };
  sourceProvenance: {
    sourceType: string | null;
    sourceConfidence: number | null;
    independentSource: boolean | null;
    sourceChainStatus: string;
  };
  paymentIdentity: {
    requested: boolean;
    amount: string | null;
    upi: string | null;
    bankDetailsPresent: boolean;
    beneficiary: string | null;
    relationshipToOrganization: string;
    status: string;
  };
  historicalInfrastructure: {
    changesDetected: string[];
    status: string;
  };
  contentProvenance: {
    organizationMatch: string;
    contactMatch: string;
    canonicalMatch: string;
    officialLinksMatch: string;
    status: string;
  };
  assetOrigin: {
    officialAssets: number;
    trustedCdnAssets: number;
    unrelatedAssets: number;
    suspiciousAssets: string[];
    status: string;
  };
  visualSimilarity: {
    score: number | null;
    interpretation: string;
  };
  trustAnchor: {
    organizationPassport: string;
    domainControl: string;
    independentSources: string[];
    status: string;
  };
  positiveSignals: string[];
  redFlags: string[];
  unavailableSignals: string[];
  evidenceCoverage: {
    observed: number;
    total: number;
  };
  riskScore: number | null;
  verificationConfidence: number | null;
  finalStatus: DigitalIdentityStatus;
  evidence: DigitalIdentitySignal[];
  governmentReference: NcsReferenceResult | null;
};

function normalizeRootDomain(hostname: string): string | null {
  if (!hostname) return null;
  const trimmed = hostname.trim().toLowerCase().replace(/^\[|\]$/g, "");
  if (!trimmed || trimmed.includes(":") && !trimmed.startsWith("[") && !trimmed.includes(".")) {
    return null;
  }
  const labels = trimmed.split(".").filter(Boolean);
  if (labels.length < 2) return trimmed;
  if (labels.length === 2) return trimmed;
  return labels.slice(-2).join(".");
}

function cleanUrl(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function isSafePassiveUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl) return false;
  try {
    const url = new URL(rawUrl);
    if (!/^(https?):$/i.test(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    if (!host || host === "localhost" || host.endsWith(".localhost") || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1" || host.includes("127.0.0.1") || host.includes("0.0.0.0") || host === "169.254.169.254") return false;
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/i.test(host)) return false;
    if (/^\[?::1\]?$|^::1$/i.test(host)) return false;
    if (/^\[?fc|fd|fe8[0-9a-f]|fe9[0-9a-f]|fec[0-9a-f]|fe[89ab][0-9a-f]/i.test(host)) return false;
    if (/(?:^|\.)local(?:host)?$|\binternal\b|\bmetadata\b|\blocalhost\b/i.test(host)) return false;
    return true;
  } catch {
    return false;
  }
}

function getSafetyStatus(inputWebsite: string | null | undefined): { submittedUrl: string | null; finalUrl: string | null; domain: string | null; status: string } {
  const safeUrl = cleanUrl(inputWebsite);
  if (!safeUrl) {
    return { submittedUrl: null, finalUrl: null, domain: null, status: "NOT_APPLICABLE" };
  }
  if (!isSafePassiveUrl(safeUrl)) {
    return { submittedUrl: safeUrl, finalUrl: null, domain: null, status: "BLOCKED" };
  }
  try {
    const parsed = new URL(safeUrl);
    return {
      submittedUrl: safeUrl,
      finalUrl: parsed.href,
      domain: parsed.hostname,
      status: "AVAILABLE",
    };
  } catch {
    return { submittedUrl: safeUrl, finalUrl: null, domain: null, status: "INVALID_URL" };
  }
}

export function buildDigitalIdentityAssessment(input: {
  website?: string | null;
  company?: string | null;
  sourceType?: string | null;
  jobRole?: string | null;
  notificationNumber?: string | null;
  jobId?: string | null;
  location?: string | null;
  eligibility?: string | null;
  salary?: string | null;
  recruiterEmail?: string | null;
  recruiterName?: string | null;
  applicationFee?: string | null;
  description?: string | null;
  rawText?: string | null;
  paymentRequested?: boolean;
  personalPaymentRisk?: boolean;
  paymentAmount?: string | null;
  upi?: string | null;
  bankDetailsPresent?: boolean;
  governmentReference?: NcsReferenceResult | null;
  sourceConfidence?: number | null;
}): DigitalIdentityAssessment {
  const timestamp = new Date().toISOString();
  const sourceType = input.sourceType || "unknown";
  const urlInfo = getSafetyStatus(input.website);
  const submittedUrl = urlInfo.submittedUrl;
  const finalUrl = urlInfo.finalUrl;
  const submittedDomain = submittedUrl ? new URL(submittedUrl).hostname.toLowerCase() : null;
  const rootDomain = submittedDomain ? normalizeRootDomain(submittedDomain) : null;
  const companyName = input.company && input.company.trim() ? input.company.trim() : null;
  const governmentReference = input.governmentReference || null;
  const ncsMatched = governmentReference && ["EXACT_MATCH", "STRONG_MATCH"].includes(governmentReference.status);
  const ncsPartial = governmentReference?.status === "PARTIAL_MATCH";
  const ncsContradicted = governmentReference?.status === "NO_MATCH";
  const companyNormalized = companyName ? companyName.toLowerCase() : null;
  const suspiciousPatterns: string[] = [];
  if (submittedDomain) {
    const host = submittedDomain.toLowerCase();
    if (host.includes("verify") || host.includes("login") || host.includes("careers") && host.includes("-")) suspiciousPatterns.push("misleading_subdomain_pattern");
    if (host.split(".").length > 3) suspiciousPatterns.push("excessive_subdomains");
    if (host.includes("-login") || host.includes("-verify") || host.includes("-career")) suspiciousPatterns.push("lookalike_or_typosquat_pattern");
  }

  const referenceStatus = companyName ? "UNKNOWN" : "UNAVAILABLE";
  const referenceDomain = referenceStatus === "UNKNOWN" && submittedDomain ? rootDomain : null;

  let domainStatus = "UNKNOWN";
  if (!submittedUrl) {
    domainStatus = "NOT_APPLICABLE";
  } else if (companyNormalized && submittedDomain) {
    domainStatus = companyNormalized.includes(submittedDomain.replace(/\..*$/, "")) || companyNormalized.includes(rootDomain || "") ? "MATCH" : "MISMATCH";
  } else if (submittedUrl) {
    domainStatus = suspiciousPatterns.length ? "SUSPICIOUS" : "UNKNOWN";
  }
  if (!submittedUrl) {
    domainStatus = "NOT_APPLICABLE";
  }

  const paymentRequested = Boolean(input.paymentRequested || input.upi || input.bankDetailsPresent || input.paymentAmount);
  const personalPaymentRisk = Boolean(input.personalPaymentRisk);
  const evidence: DigitalIdentitySignal[] = [
    {
      signal: "domain_identity",
      observedValue: submittedDomain,
      referenceValue: referenceDomain,
      status: domainStatus,
      source: "submitted_url_vs_claimed_organization",
      independent: false,
      timestamp,
      confidence: domainStatus === "MATCH" ? 0.9 : domainStatus === "MISMATCH" ? 0.96 : 0.45,
    },
    {
      signal: "organization_identity",
      observedValue: companyName,
      referenceValue: null,
      status: companyName ? "UNKNOWN" : "UNAVAILABLE",
      source: "submitted_organization_claim",
      independent: false,
      timestamp,
      confidence: companyName ? 0.52 : 0.0,
    },
    {
      signal: "opportunity_authorization",
      observedValue: input.jobRole || input.notificationNumber || input.jobId || null,
      referenceValue: null,
      status: input.jobRole || input.notificationNumber || input.jobId ? "NOT_VERIFIED" : "UNAVAILABLE",
      source: "submitted_opportunity_claim",
      independent: false,
      timestamp,
      confidence: input.jobRole || input.notificationNumber || input.jobId ? 0.72 : 0.0,
    },
    {
      signal: "recruiter_identity",
      observedValue: input.recruiterEmail || input.recruiterName || null,
      referenceValue: null,
      status: input.recruiterEmail || input.recruiterName ? "UNVERIFIED" : "UNAVAILABLE",
      source: "submitted_recruiter_claim",
      independent: false,
      timestamp,
      confidence: input.recruiterEmail ? 0.68 : 0.25,
    },
    {
      signal: "payment_identity",
      observedValue: input.paymentRequested ? (input.paymentAmount || input.upi || "payment_requested") : "no_payment_requested",
      referenceValue: null,
      status: personalPaymentRisk ? "MISMATCH" : paymentRequested ? "REVIEW" : "NOT_PROVIDED",
      source: "submitted_payment_details",
      independent: false,
      timestamp,
      confidence: personalPaymentRisk ? 0.9 : paymentRequested ? 0.55 : 0.2,
    },
  ];

  for (const item of governmentReference?.evidence || []) {
    evidence.push({
      signal: `ncs_${item.signal.toLowerCase()}`,
      observedValue: item.observedValue,
      referenceValue: item.referenceValue,
      status: item.status === "PASS" ? "MATCH" : "MISMATCH",
      source: `NCS public reference: ${item.sourceUrl}`,
      independent: true,
      timestamp: item.timestamp,
      confidence: item.confidence / 100,
    });
  }

  const positiveSignals: string[] = [];
  const redFlags: string[] = [];
  const unavailableSignals: string[] = [];

  const hasOfficialOpportunityEvidence = Boolean(input.jobRole || input.notificationNumber || input.jobId);
  const sourceConfidence = typeof input.sourceConfidence === "number" ? input.sourceConfidence : 0;

  if (submittedUrl && domainStatus === "MATCH") positiveSignals.push("Submitted website appears to align with the claimed organization domain.");
  if (submittedUrl && domainStatus === "MISMATCH") redFlags.push("Domain mismatch: the submitted website does not align with the claimed organization domain.");
  if (hasOfficialOpportunityEvidence) positiveSignals.push("The opportunity contains identifying details such as a job title, notification number, or job reference.");
  else unavailableSignals.push("No independent opportunity authorization record was available for this specific recruitment posting.");
  if (personalPaymentRisk) redFlags.push("Payment evidence includes an unverified personal or organization-mismatched destination.");
  else if (paymentRequested) unavailableSignals.push("A payment or fee was mentioned, but the beneficiary and authorization were not independently confirmed.");
  else positiveSignals.push("No payment demand was detected in the supplied input.");
  if (ncsMatched) positiveSignals.push("A matching NCS recruitment reference was found; this is supporting evidence, not a guarantee of authenticity.");
  if (governmentReference?.status === "NOT_FOUND") unavailableSignals.push("No matching NCS reference was found; absence alone is not evidence of fraud.");
  if (governmentReference?.status === "UNAVAILABLE") unavailableSignals.push("NCS reference access was unavailable; other verification evidence remains in effect.");
  if (ncsContradicted) redFlags.push(`An accessible NCS reference conflicts with submitted opportunity fields: ${governmentReference?.mismatchedFields.join(", ") || "identity"}.`);
  if (sourceType && /whatsapp|telegram|chat|text|email|linkedin|recruiter/i.test(sourceType)) {
    if (sourceConfidence < 50) redFlags.push("The opportunity arrived through a weak or informal source channel that lacks independent verification.");
    else positiveSignals.push("Opportunity source was supplied and may be partially corroborated by the reported channel.");
  }
  if (!submittedUrl) unavailableSignals.push("No URL was supplied, so digital identity analysis was not applicable.");
  if (urlInfo.status === "BLOCKED") redFlags.push("Unsafe URL pattern was blocked by the passive verification safeguards.");
  if (!companyName) unavailableSignals.push("Organization name was not supplied, so identity matching remains limited.");
  if (suspiciousPatterns.length) redFlags.push("Domain structure contains suspicious lookalike or subdomain patterns.");

  let finalStatus: DigitalIdentityStatus = "UNKNOWN";
  if (!submittedUrl) finalStatus = "NOT_APPLICABLE";
  else if (domainStatus === "MISMATCH" || personalPaymentRisk || urlInfo.status === "BLOCKED") finalStatus = "HIGH_RISK";
  else if (ncsContradicted || ncsPartial || governmentReference?.status === "NOT_FOUND" || paymentRequested || domainStatus === "SUSPICIOUS" || !hasOfficialOpportunityEvidence || sourceConfidence < 50) finalStatus = "REVIEW";
  else if (domainStatus === "MATCH") finalStatus = "PASS";

  const observedSignals = evidence.filter((entry) => entry.observedValue !== null).length;
  const coverageTotal = 8;
  const evidenceCoverage = { observed: Math.min(observedSignals, coverageTotal), total: coverageTotal };
  const verificationConfidence = Math.max(10, Math.min(95, Math.round((observedSignals / coverageTotal) * 100)));
  const riskScore = finalStatus === "HIGH_RISK" ? 82 : finalStatus === "REVIEW" ? 48 : finalStatus === "PASS" ? 12 : 0;
  const officialSourceHost = (() => {
    try { return governmentReference?.officialSourceUrl ? new URL(governmentReference.officialSourceUrl).hostname.toLowerCase() : null; }
    catch { return null; }
  })();

  return {
    submittedUrl,
    finalUrl,
    claimedOrganization: companyName,
    referenceOrganization: governmentReference?.organization || null,
    referenceUrl: governmentReference?.ncsReferenceUrl || null,
    referenceStatus: ncsMatched ? "VERIFIED" : governmentReference?.status === "UNAVAILABLE" ? "UNAVAILABLE" : governmentReference ? "UNKNOWN" : referenceStatus,
    domain: {
      submittedDomain,
      rootDomain,
      referenceDomain: officialSourceHost,
      status: domainStatus,
      suspiciousPatterns,
    },
    registration: {
      registrar: null,
      createdAt: null,
      updatedAt: null,
      expiresAt: null,
      domainAgeDays: null,
      status: submittedUrl ? "UNAVAILABLE" : "NOT_APPLICABLE",
    },
    dns: {
      a: [],
      aaaa: [],
      cname: [],
      ns: [],
      mx: [],
      txt: [],
      caa: [],
      dnssec: "UNAVAILABLE",
      status: submittedUrl ? "UNAVAILABLE" : "NOT_APPLICABLE",
    },
    infrastructure: {
      ips: [],
      referenceIps: [],
      asn: null,
      referenceAsn: null,
      asnOrganization: null,
      referenceAsnOrganization: null,
      hostingProvider: null,
      referenceHostingProvider: null,
      relationship: submittedUrl ? (domainStatus === "MATCH" ? "PARTIAL_MATCH" : "MISMATCH") : "UNKNOWN",
    },
    tls: {
      issuer: null,
      subject: null,
      sanMatches: null,
      valid: null,
      status: submittedUrl ? "UNAVAILABLE" : "NOT_APPLICABLE",
    },
    nameservers: {
      submitted: [],
      reference: [],
      relationship: submittedUrl ? "UNKNOWN" : "UNAVAILABLE",
    },
    organizationIdentity: {
      organizationMatch: companyName ? "UNKNOWN" : "UNAVAILABLE",
      contactMatch: "UNKNOWN",
      officialLinksMatch: "UNKNOWN",
      ownershipSignals: companyName ? ["Claimed organization name extracted from the submitted opportunity."] : [],
      contradictions: redFlags.filter((item) => /domain|contact|organization|source/i.test(item)),
    },
    recruiterIdentity: {
      recruiterName: input.recruiterName || null,
      recruiterEmail: input.recruiterEmail || null,
      recruiterDomain: input.recruiterEmail ? input.recruiterEmail.split("@")[1] || null : null,
      organizationRelationship: companyName ? "UNVERIFIED" : "UNKNOWN",
      status: input.recruiterEmail || input.recruiterName ? "UNVERIFIED" : "UNAVAILABLE",
      evidence: input.recruiterEmail ? [`Recruiter contact ${input.recruiterEmail} was supplied but not independently verified.`] : [],
    },
    opportunityIdentity: {
      jobTitle: input.jobRole || null,
      jobId: input.jobId || null,
      notificationNumber: input.notificationNumber || null,
      location: input.location || null,
      eligibility: input.eligibility || null,
      salary: input.salary || null,
      deadline: null,
      applicationUrl: submittedUrl,
    },
    opportunityAuthorization: {
      status: ncsContradicted ? "CONTRADICTED" : ncsMatched && governmentReference?.officialSourceUrl && submittedUrl && normalizeUrl(governmentReference.officialSourceUrl) === normalizeUrl(submittedUrl) ? "AUTHORIZED" : ncsMatched || ncsPartial ? "PARTIALLY_VERIFIED" : governmentReference?.status === "UNAVAILABLE" ? "UNAVAILABLE" : hasOfficialOpportunityEvidence ? "NOT_VERIFIED" : "UNAVAILABLE",
      matchedSources: ncsMatched || ncsPartial ? ["NCS"] : [],
      contradictions: [...(ncsContradicted ? [`NCS reference differs in: ${governmentReference?.mismatchedFields.join(", ") || "opportunity identity"}.`] : []), ...(personalPaymentRisk ? ["Payment destination is not independently associated with the organization."] : [])],
      evidence: ncsMatched || ncsPartial ? [`NCS reference match type: ${governmentReference?.status}.`, ...(governmentReference?.officialSourceUrl ? [`Official source linked by NCS: ${governmentReference.officialSourceUrl}`] : [])] : governmentReference?.status === "UNAVAILABLE" ? ["NCS did not return a machine-readable reference; no NCS match is claimed."] : governmentReference?.status === "NOT_FOUND" ? ["No matching NCS reference was found; absence does not prove fraud."] : hasOfficialOpportunityEvidence ? ["Opportunity details were supplied, but no independent official source could be confirmed."] : ["No opportunity authorization evidence was independently available."],
    },
    sourceProvenance: {
      sourceType,
      sourceConfidence: sourceConfidence || null,
      independentSource: null,
      sourceChainStatus: sourceConfidence >= 60 ? "PARTIALLY_CORROBORATED" : "UNVERIFIED",
    },
    paymentIdentity: {
      requested: paymentRequested,
      amount: input.paymentAmount || null,
      upi: input.upi || null,
      bankDetailsPresent: Boolean(input.bankDetailsPresent),
      beneficiary: null,
      relationshipToOrganization: personalPaymentRisk ? "MISMATCH" : paymentRequested ? "UNVERIFIED" : "UNKNOWN",
      status: paymentRequested ? "REVIEW" : "NOT_PROVIDED",
    },
    historicalInfrastructure: {
      changesDetected: [],
      status: submittedUrl ? "UNAVAILABLE" : "NOT_APPLICABLE",
    },
    contentProvenance: {
      organizationMatch: companyName ? "UNKNOWN" : "UNAVAILABLE",
      contactMatch: "UNKNOWN",
      canonicalMatch: "UNKNOWN",
      officialLinksMatch: "UNKNOWN",
      status: companyName ? "UNAVAILABLE" : "NOT_APPLICABLE",
    },
    assetOrigin: {
      officialAssets: 0,
      trustedCdnAssets: 0,
      unrelatedAssets: 0,
      suspiciousAssets: [],
      status: submittedUrl ? "UNAVAILABLE" : "NOT_APPLICABLE",
    },
    visualSimilarity: {
      score: null,
      interpretation: "Visual similarity is supporting evidence only and does not establish authenticity.",
    },
    trustAnchor: {
      organizationPassport: "UNAVAILABLE",
      domainControl: "UNKNOWN",
      independentSources: [],
      status: "UNAVAILABLE",
    },
    positiveSignals,
    redFlags,
    unavailableSignals,
    evidenceCoverage,
    riskScore,
    verificationConfidence,
    finalStatus,
    evidence,
    governmentReference,
  };
}

function normalizeUrl(value: string) {
  try { const url = new URL(value); url.hash = ""; url.search = ""; return `${url.hostname.toLowerCase()}${url.pathname.replace(/\/$/, "")}`; }
  catch { return ""; }
}
