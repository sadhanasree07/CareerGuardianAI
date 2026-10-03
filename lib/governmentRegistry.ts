export type GovernmentRegistryStatus = "VERIFIED" | "UNVERIFIED" | "NOT_FOUND" | "UNAVAILABLE" | "SUSPICIOUS";
export type GovernmentDomainStatus = "PASS" | "FAIL" | "UNKNOWN" | "NOT_APPLICABLE";
export type GovernmentEvidenceQuality = "HIGH" | "MEDIUM" | "LOW" | "UNAVAILABLE";
export type GovernmentClaimType = "GOVERNMENT" | "PRIVATE" | "PSU_GOVERNMENT_LINKED" | "UNKNOWN";
import type { NcsReferenceResult } from "./governmentRegistryNcs.ts";

export const governmentRegistryConfig = {
  enabled: process.env.GOVERNMENT_REGISTRY_ENABLED !== "false",
};

export type GovernmentRegistryCheck = {
  source: string;
  status: GovernmentRegistryStatus;
  matched: boolean;
  evidence: string;
};

export type GovernmentRecruitmentFacts = {
  claimedOrganization: string;
  department: string;
  notificationNumber: string;
  advertisementNumber: string;
  recruitmentNumber: string;
  jobId: string;
  postTitle: string;
  recruitmentYear: string;
  location: string;
  salary: string;
  applicationStartDate: string;
  applicationClosingDate: string;
  eligibility: string;
  applicationUrl: string;
  sourceUrl: string;
  paymentInformation: string;
  contactInformation: string;
  emailAddresses: string[];
  phoneNumbers: string[];
  upiIds: string[];
  bankDetails: string[];
  rawText: string;
};

export type GovernmentVerificationResult = {
  isGovernmentJobClaim: boolean;
  claimType: GovernmentClaimType;
  claimedOrganization: string;
  notificationNumber: string;
  ncsReference: NcsReferenceResult;
  domainValidation: {
    urlChecked: string;
    officialTld: boolean;
    status: GovernmentDomainStatus;
    reason: string;
  };
  registryChecks: GovernmentRegistryCheck[];
  notificationMatch: {
    status: "VERIFIED" | "UNVERIFIED" | "NOT_FOUND" | "UNKNOWN" | "NOT_APPLICABLE" | "UNAVAILABLE" | "CONTRADICTED";
    matchedFields: string[];
  };
  recruitmentConsistency: {
    status: "CONSISTENT" | "INCONSISTENT" | "UNKNOWN" | "NOT_APPLICABLE";
    issues: string[];
  };
  paymentSafety: {
    status: "SAFE" | "PERSONAL_OR_SUSPICIOUS" | "UNKNOWN" | "NOT_APPLICABLE";
    issues: string[];
  };
  evidenceQuality: GovernmentEvidenceQuality;
  verificationStatus: GovernmentRegistryStatus | "NOT_APPLICABLE";
  redFlags: string[];
  positiveSignals: string[];
  recommendation: string;
};

const GOVERNMENT_HINTS = [
  "government of india",
  "government of the state",
  "central government",
  "state government",
  "central government recruitment",
  "state government recruitment",
  "government recruitment",
  "government job",
  "government vacancy",
  "government department",
  "government organization",
  "government organisation",
  "ministry of",
  "union public service commission",
  "staff selection commission",
  "railway recruitment board",
  "indian railways recruitment",
  "department of posts",
  "india post recruitment",
  "isro recruitment",
  "public sector undertaking",
  "government exam",
];

const GOVERNMENT_ORGANIZATION_NAMES = [
  "UPSC", "SSC", "RRB", "Staff Selection Commission", "Union Public Service Commission",
  "Railway Recruitment Board", "Indian Railways", "India Post", "Department of Posts", "ISRO",
];

const GOV_TLDS = [".gov.in", ".nic.in"];

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function firstNonEmpty(...values: unknown[]) {
  for (const value of values) {
    const text = clean(value);
    if (text) return text;
  }
  return "";
}

function chooseNotificationMatch(candidates: string[]) {
  const valid = candidates.filter(Boolean).map((value) => value.trim().replace(/[.,;:!?)]*$/g, ""));
  const yearOnly = valid.filter((value) => /^\d{4}$/.test(value.trim()));
  if (yearOnly.length && valid.length > 1) {
    return valid.find((value) => !/^\d{4}$/.test(value.trim())) || valid[0];
  }
  return valid[0] || "";
}

function extractUrls(text: string) {
  const matches = text.match(/https?:\/\/[^\s<>'")]+/gi) || [];
  return [...new Set(matches.map((value) => value.replace(/[),.;!?"]+$/g, "")))];
}

function matchAll(text: string, regex: RegExp) {
  return [...text.matchAll(regex)].map((match) => match[0].trim()).filter(Boolean);
}

function toDisplayDate(value: string) {
  return value.trim();
}

function isOfficialGovDomain(hostname: string) {
  const lower = hostname.toLowerCase();
  return GOV_TLDS.some((tld) => lower.endsWith(tld));
}

function lookalikeRisk(hostname: string) {
  const lower = hostname.toLowerCase();
  const suspicious = /(gov|government|recruitment|rrb|ssc|upsc|railway|post|isro|career).*(\.com|\.co\.in|\.site|\.in|\.org|\.net)/i.test(lower)
    || /(?:^|\.)(?:railways-gov|ssc-recruitment|upsc-careers|government-job-site|rrb-official|[a-z-]+gov\.in)/i.test(lower)
    || /(?:gov|government)[a-z-]*\.(?:com|co\.in|site|org|net)/i.test(lower);
  return suspicious;
}

export function extractGovernmentRecruitmentFacts(input: Record<string, unknown>): GovernmentRecruitmentFacts {
  const rawText = [
    input.rawText,
    input.description,
    input.text,
    input.extractedText,
    input.transcript,
    input.cleanTranscript,
    input.applicationFee,
    input.additionalEvidenceText,
  ].filter((value): value is string => typeof value === "string").join("\n");

  const candidateUrl = firstNonEmpty(input.website, input.url, input.sourceUrl, input.applicationUrl, extractUrls(rawText)[0]);
  const claimedOrganization = firstNonEmpty(input.company, input.organization, input.claimedOrganization, "");
  const department = firstNonEmpty(input.department, input.ministry, rawText.match(/(?:department|ministry)\s*(?:name)?\s*[:\-]?\s*([^\n]{2,120})/i)?.[1]);
  const notificationCandidates: string[] = [
    typeof input.notificationNumber === "string" ? input.notificationNumber : "",
    rawText.match(/(?:Notification(?:\s+No\.?|\s+Number)?|Advt\.?\s*No\.?|Advertisement(?:\s+No\.?|\s+Number)?|Exam(?:\s+No\.?|\s+Number)?)\s*[:\-]?\s*([A-Za-z0-9][A-Za-z0-9./-]{1,40})/i)?.[1] ?? "",
    rawText.match(/(?:Recruitment(?:\s+No\.?|\s+Number)?|Vacancy(?:\s+No\.?|\s+Number)?)\s*[:\-]?\s*([A-Za-z0-9][A-Za-z0-9./-]{1,40})/i)?.[1] ?? "",
    rawText.match(/(?:No\.?|No\s*[:.]?)\s*(([A-Za-z][A-Za-z0-9./-]*)|([0-9]{1,4}\/[A-Za-z0-9.-]{2,40}))/i)?.[1] ?? "",
  ];
  const notificationNumber = chooseNotificationMatch(notificationCandidates);
  const advertisementNumber = chooseNotificationMatch([
    rawText.match(/(?:Advt\.?\s*No\.?|Advertisement\s*No\.?|Advt\.?\s*No\.? )\s*[:\-]?\s*([A-Za-z0-9./-]+)/i)?.[1] ?? "",
    notificationNumber,
  ]);
  const recruitmentNumber = chooseNotificationMatch([
    rawText.match(/(?:Recruitment\s*(?:No\.?|Number)?|Exam\s*(?:No\.?|Number)?|Application\s*(?:No\.?|Number)?)\s*[:\-]?\s*([A-Za-z0-9./-]+)/i)?.[1] ?? "",
    notificationNumber,
  ]);
  const postTitle = firstNonEmpty(
    input.jobRole,
    rawText.match(/(?:Post|Post Name|Vacancy|Recruitment for)\s*[:\-]?\s*([A-Za-z0-9 .,&()/+-]{3,120})/i)?.[1],
    rawText.match(/\b(?:SSC|UPSC|RRB|ISRO|Indian Post|Railway|Recruitment|CGL|NTPC|Group D|Technician)\b[^\n]{0,80}/i)?.[0],
  );
  const jobId = firstNonEmpty(input.jobId, rawText.match(/(?:job|vacancy|post)\s*ID\s*[:#\-]?\s*([A-Za-z0-9/-]{2,50})/i)?.[1]);
  const recruitmentYear = firstNonEmpty(
    input.recruitmentYear,
    rawText.match(/\b(19\d{2}|20\d{2})\b/)?.[1],
    rawText.match(/\b(20\d{2})\b/)?.[1],
  );
  const applicationStartDate = firstNonEmpty(
    input.applicationStartDate,
    rawText.match(/(?:application(?:\s+start|\s+opens)|start(?:ing)?\s+date|online\s+application\s+from|apply\s+from|opening\s+date)\s*[:\-]?\s*(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/i)?.[1],
    rawText.match(/(?:from|on)\s*(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})\s*(?:to|until|upto|till)/i)?.[1],
  );
  const applicationClosingDate = firstNonEmpty(
    input.applicationClosingDate,
    rawText.match(/(?:application\s*(?:closing|ends|last\s+date)|last\s+date\s*for\s*application|close(?:s|d)?\s*on|closing\s+date|last\s+date)\s*[:\-]?\s*(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/i)?.[1],
    rawText.match(/(?:to|till|until|upto)\s*(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/i)?.[1],
  );
  const eligibility = firstNonEmpty(
    input.education,
    rawText.match(/(?:eligibility|qualification|minimum qualification|education)\s*[:\-]?\s*([^\n]{2,180})/i)?.[1],
  );
  const location = firstNonEmpty(input.location, rawText.match(/(?:job\s+)?location\s*[:\-]?\s*([^\n]{2,120})/i)?.[1]);
  const salary = firstNonEmpty(input.salary, rawText.match(/(?:salary|pay\s+scale|pay\s+level|remuneration)\s*[:\-]?\s*([^\n]{2,120})/i)?.[1]);
  const paymentInformation = firstNonEmpty(input.applicationFee, rawText.match(/(?:application|registration|processing|interview|security|training|fee|deposit)\s*(?:amount|fee|charge|payment)\s*[:\-]?\s*([^\n]{0,120})/i)?.[1], "");
  const contactInformation = firstNonEmpty(input.phone, input.email, rawText.match(/(?:contact|phone|mobile|whatsapp|telegram|email|contact us)\s*[:\-]?\s*([^\n]{2,200})/i)?.[1], "");
  const emailAddresses = [...new Set(matchAll(rawText, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi))];
  const phoneNumbers = [...new Set(matchAll(rawText, /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)\d{3}[-.\s]?\d{4,7}/g))];
  const upiIds = [...new Set(matchAll(rawText, /[A-Za-z0-9._-]+@[A-Za-z0-9.-]+/gi).filter((value) => /@/.test(value) && !/@gmail|@yahoo|@outlook|@hotmail/i.test(value)))];
  const bankDetails = [...new Set(matchAll(rawText, /(?:A\/c|Account\s*No\.?|Bank\s*Name|IFSC|Bank\s*Account)\s*[:\-]?[^\n]{2,150}/gi))];

  return {
    claimedOrganization,
    department,
    notificationNumber: notificationNumber || "",
    advertisementNumber: advertisementNumber || notificationNumber || "",
    recruitmentNumber: recruitmentNumber || notificationNumber || "",
    jobId,
    postTitle: postTitle || clean(input.jobRole) || "",
    recruitmentYear: recruitmentYear || "",
    location,
    salary,
    applicationStartDate: toDisplayDate(applicationStartDate || ""),
    applicationClosingDate: toDisplayDate(applicationClosingDate || ""),
    eligibility,
    applicationUrl: firstNonEmpty(candidateUrl, rawText.match(/https?:\/\/[^\s<>'")]+/i)?.[0], ""),
    sourceUrl: firstNonEmpty(candidateUrl, ""),
    paymentInformation,
    contactInformation,
    emailAddresses,
    phoneNumbers,
    upiIds,
    bankDetails,
    rawText,
  };
}

export function classifyGovernmentRecruitmentClaim(input: Record<string, unknown>): GovernmentClaimType {
  const facts = extractGovernmentRecruitmentFacts(input);
  const context = `${facts.rawText}\n${facts.claimedOrganization}\n${facts.department}`.toLowerCase();
  const organization = facts.claimedOrganization.toLowerCase();
  const officialGovDomain = [facts.sourceUrl, facts.applicationUrl].some((candidate) => {
    try { return isOfficialGovDomain(new URL(candidate.startsWith("http") ? candidate : `https://${candidate}`).hostname); }
    catch { return false; }
  });
  const psuClaim = /\b(psu|public sector undertaking|maharatna|navratna|miniratna)\b/i.test(context);
  const namedGovernmentOrganization = GOVERNMENT_ORGANIZATION_NAMES.some((name) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?:^|\\b)${escaped}(?:$|\\b)`, "i").test(organization);
  });
  const explicitGovernmentClaim = GOVERNMENT_HINTS.some((hint) => context.includes(hint.toLowerCase())) || namedGovernmentOrganization;
  if (psuClaim) return "PSU_GOVERNMENT_LINKED";
  if (explicitGovernmentClaim || officialGovDomain && Boolean(facts.postTitle || facts.notificationNumber || facts.jobId)) return "GOVERNMENT";
  if (/\b(private sector|private company|private limited|pvt\.?\s*ltd|incorporated|startup)\b/i.test(context) || /\b(private|pvt)\b/i.test(organization)) return "PRIVATE";
  return "UNKNOWN";
}

function ncsUnavailableResult(facts: GovernmentRecruitmentFacts, governmentJobClaim: boolean, reason: string): NcsReferenceResult {
  return {
    source: "NCS",
    status: governmentJobClaim ? "UNAVAILABLE" : "NOT_APPLICABLE",
    governmentJobClaim,
    organization: facts.claimedOrganization || null,
    jobTitle: facts.postTitle || null,
    notificationNumber: facts.notificationNumber || facts.advertisementNumber || null,
    matchedFields: [],
    mismatchedFields: [],
    unavailableFields: ["organization", "jobTitle", "notificationNumber", "applicationUrl"],
    ncsReferenceUrl: null,
    officialSourceUrl: null,
    evidence: [],
    confidence: 0,
    checkedAt: null,
    reason,
    searchQueries: [],
  };
}

function registryProviders(ncsReference: NcsReferenceResult): GovernmentRegistryCheck[] {
  if (ncsReference.status === "NOT_APPLICABLE") return [];
  const status: GovernmentRegistryStatus = ["EXACT_MATCH", "STRONG_MATCH"].includes(ncsReference.status)
    ? "VERIFIED"
    : ncsReference.status === "NOT_FOUND"
      ? "NOT_FOUND"
      : ncsReference.status === "UNAVAILABLE"
        ? "UNAVAILABLE"
        : "UNVERIFIED";
  const matched = ["EXACT_MATCH", "STRONG_MATCH", "PARTIAL_MATCH"].includes(ncsReference.status);
  return [{
    source: "NCS",
    status,
    matched,
    evidence: ncsReference.reason || (matched ? `NCS reference match found (${ncsReference.status}).` : `NCS reference status: ${ncsReference.status}.`),
  }];
}

export function assessGovernmentRegistryCrossCheck(input: Record<string, unknown>, ncsResult?: NcsReferenceResult): GovernmentVerificationResult {
  const facts = extractGovernmentRecruitmentFacts(input);
  const rawText = facts.rawText.toLowerCase();
  const claimType = classifyGovernmentRecruitmentClaim(input);
  const isGovernmentJobClaim = claimType === "GOVERNMENT" || claimType === "PSU_GOVERNMENT_LINKED";
  const ncsReference = ncsResult || ncsUnavailableResult(facts, isGovernmentJobClaim, "NCS reference checking was not completed.");

  if (!isGovernmentJobClaim) {
    return {
      isGovernmentJobClaim: false,
      claimType,
      claimedOrganization: facts.claimedOrganization || "",
      notificationNumber: facts.notificationNumber || "",
      ncsReference: ncsUnavailableResult(facts, false, "NCS checking is not applicable to this claim."),
      domainValidation: {
        urlChecked: facts.sourceUrl || facts.applicationUrl || "",
        officialTld: false,
        status: "NOT_APPLICABLE",
        reason: "The submitted content does not claim a government recruitment notice.",
      },
        registryChecks: [],
      notificationMatch: { status: "NOT_APPLICABLE", matchedFields: [] },
      recruitmentConsistency: { status: "NOT_APPLICABLE", issues: [] },
      paymentSafety: { status: "NOT_APPLICABLE", issues: [] },
      evidenceQuality: "LOW",
      verificationStatus: "NOT_APPLICABLE",
      redFlags: [],
      positiveSignals: [],
      recommendation: "No government recruitment claim was identified, so the government registry cross-check is not applicable.",
    };
  }

  const urlChecked = facts.sourceUrl || facts.applicationUrl || "";
  let domainValidation: GovernmentVerificationResult["domainValidation"];

  if (!urlChecked) {
    domainValidation = {
      urlChecked: "",
      officialTld: false,
      status: "UNKNOWN",
      reason: "No application URL was supplied, so domain authenticity could not be independently checked.",
    };
  } else {
    try {
      const hostname = new URL(urlChecked.startsWith("http") ? urlChecked : `https://${urlChecked}`).hostname;
      const officialTld = isOfficialGovDomain(hostname);
      const suspiciousPattern = lookalikeRisk(hostname);
      if (officialTld) {
        domainValidation = {
          urlChecked: hostname,
          officialTld: true,
          status: "PASS",
          reason: "The source URL uses an official government domain.",
        };
      } else if (suspiciousPattern) {
        domainValidation = {
          urlChecked: hostname,
          officialTld: false,
          status: "FAIL",
          reason: "The source URL uses a suspicious or lookalike pattern inconsistent with official government recruitment domains.",
        };
      } else {
        domainValidation = {
          urlChecked: hostname,
          officialTld: false,
          status: "UNKNOWN",
          reason: "The domain is not an official government domain, but the claim will be evaluated alongside other evidence rather than automatically treated as fraud.",
        };
      }
    } catch {
      domainValidation = {
        urlChecked: urlChecked,
        officialTld: false,
        status: "UNKNOWN",
        reason: "The application URL could not be parsed, so the domain could not be independently validated.",
      };
    }
  }

  const registryChecks = registryProviders(ncsReference);
  const matchedChecks = registryChecks.filter((entry) => entry.matched);
  const hasVerifiedRegistry = ["EXACT_MATCH", "STRONG_MATCH"].includes(ncsReference.status);
  const hasSuspiciousRegistry = registryChecks.some((entry) => entry.status === "SUSPICIOUS");
  const hasUnavailableRegistry = registryChecks.length > 0 && registryChecks.every((entry) => entry.status === "UNAVAILABLE");
  const hasNotFoundRegistry = registryChecks.some((entry) => entry.status === "NOT_FOUND");

  let notificationMatchStatus: GovernmentVerificationResult["notificationMatch"]["status"] = "UNKNOWN";
  const matchedFields: string[] = [];
  if (!facts.notificationNumber) {
    notificationMatchStatus = "NOT_APPLICABLE";
  } else {
    if (ncsReference.status === "EXACT_MATCH" || ncsReference.status === "STRONG_MATCH") {
      notificationMatchStatus = "VERIFIED";
      matchedFields.push(...ncsReference.matchedFields);
    } else if (ncsReference.status === "NO_MATCH") {
      notificationMatchStatus = "CONTRADICTED";
    } else if (hasNotFoundRegistry) {
      notificationMatchStatus = "NOT_FOUND";
    } else if (hasUnavailableRegistry) {
      notificationMatchStatus = "UNAVAILABLE";
    } else {
      notificationMatchStatus = "UNVERIFIED";
    }
  }

  const issues: string[] = [];
  if (facts.applicationStartDate && facts.applicationClosingDate) {
    const start = new Date(facts.applicationStartDate);
    const end = new Date(facts.applicationClosingDate);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start > end) {
      issues.push("The extracted application dates are contradictory: the start date is later than the closing date.");
    }
  }
  if (facts.claimedOrganization && facts.notificationNumber && facts.recruitmentYear && !new RegExp(facts.recruitmentYear, "i").test(facts.notificationNumber)) {
    issues.push("The notification number and recruitment year are not clearly aligned.");
  }
  const consistencyStatus = issues.length ? "INCONSISTENT" : hasVerifiedRegistry ? "CONSISTENT" : "UNKNOWN";
  if (ncsReference.status === "NO_MATCH" && ncsReference.mismatchedFields.length) {
    issues.push(`The NCS reference differs from the submitted ${ncsReference.mismatchedFields.join(", ")}.`);
  }

  const personalPaymentSignal = facts.upiIds.length > 0 || facts.bankDetails.length > 0 || /(?:@upi|upi|phonepe|paytm|googlepay|bharatpe|personal upi|own account)/i.test(facts.paymentInformation || facts.contactInformation || rawText);
  const paymentIssues: string[] = [];
  let paymentStatus: GovernmentVerificationResult["paymentSafety"]["status"] = "SAFE";
  if (personalPaymentSignal) {
    paymentStatus = "PERSONAL_OR_SUSPICIOUS";
    paymentIssues.push("The notice requests payment through a personal UPI or bank-style route, which is a strong fraud indicator unless independently verified by an official government channel.");
  } else if (facts.paymentInformation) {
    paymentStatus = "UNKNOWN";
    paymentIssues.push("The notice includes payment instructions, but their channel could not be independently confirmed as official.");
  } else {
    paymentStatus = "SAFE";
  }

  const redFlags: string[] = [];
  const positiveSignals: string[] = [];

  if (domainValidation.status === "FAIL") redFlags.push("The application domain is not an official government domain and appears inconsistent with the recruitment claim.");
  if (domainValidation.status === "PASS") positiveSignals.push("The supplied source URL uses an official government domain.");
  if (paymentStatus === "PERSONAL_OR_SUSPICIOUS") redFlags.push("Payment instructions appear to be routed through a personal UPI or bank account.");
  if (consistencyStatus === "INCONSISTENT") redFlags.push("Recruitment details contain date or notification contradictions.");
  if (hasSuspiciousRegistry) redFlags.push("One or more registry checks returned suspicious evidence.");
  if (ncsReference.status === "NO_MATCH" && ncsReference.mismatchedFields.length) redFlags.push("An accessible NCS recruitment reference conflicts with submitted opportunity details; this contradiction needs review.");
  if (hasVerifiedRegistry) positiveSignals.push("A matching NCS recruitment reference was found for this opportunity.");

  let verificationStatus: GovernmentVerificationResult["verificationStatus"] = "UNVERIFIED";
  if (hasVerifiedRegistry && redFlags.length === 0) {
    verificationStatus = "VERIFIED";
  } else if (redFlags.length > 0 && (domainValidation.status === "FAIL" || paymentStatus === "PERSONAL_OR_SUSPICIOUS" || consistencyStatus === "INCONSISTENT")) {
    verificationStatus = "SUSPICIOUS";
  } else if (hasUnavailableRegistry) {
    verificationStatus = "UNAVAILABLE";
  } else if (hasNotFoundRegistry && redFlags.length === 0) {
    verificationStatus = "NOT_FOUND";
  }

  const evidenceQuality: GovernmentEvidenceQuality = verificationStatus === "VERIFIED" ? "HIGH" : verificationStatus === "SUSPICIOUS" ? "MEDIUM" : verificationStatus === "UNAVAILABLE" || verificationStatus === "NOT_FOUND" ? "LOW" : "LOW";

  let recommendation = "Unable to independently verify the government recruitment notice with official registry data at this time.";
  if (verificationStatus === "VERIFIED") {
    recommendation = "A matching NCS reference was found. This is supporting evidence for the opportunity, not a guarantee of authenticity; review the submitted source, domain, recruiter, and payment details too.";
  } else if (verificationStatus === "SUSPICIOUS") {
    recommendation = "The notice contains meaningful contradictions or suspicious payment/domain signals and should be treated as high-risk until independently confirmed through an official government channel.";
  } else if (verificationStatus === "NOT_FOUND") {
    recommendation = "No matching NCS reference was found in the query-scoped official results. This does not establish fraud; additional independent verification is required.";
  } else if (verificationStatus === "UNAVAILABLE") {
    recommendation = "The NCS reference was unavailable during this check. Other CareerGuardian evidence remains in effect; confirm through the official recruitment source.";
  } else if (ncsReference.status === "NO_MATCH") {
    recommendation = "An accessible NCS reference conflicts with submitted organization or opportunity details. Review the mismatch and verify through the official recruitment source; the mismatch alone does not prove fraud.";
  } else if (ncsReference.status === "PARTIAL_MATCH") {
    recommendation = "A partial NCS reference match was found, but important fields could not be confirmed. Additional independent verification is required.";
  }

  return {
    isGovernmentJobClaim: true,
    claimType,
    claimedOrganization: facts.claimedOrganization || "",
    notificationNumber: facts.notificationNumber || "",
    ncsReference,
    domainValidation,
    registryChecks,
    notificationMatch: {
      status: notificationMatchStatus,
      matchedFields,
    },
    recruitmentConsistency: {
      status: consistencyStatus,
      issues,
    },
    paymentSafety: {
      status: paymentStatus,
      issues: paymentIssues,
    },
    evidenceQuality,
    verificationStatus,
    redFlags,
    positiveSignals,
    recommendation,
  };
}

export function mergeGovernmentRegistryEvidence(
  evidence: {
    evidence: Array<{ id: string; category: string; state: string; weight: number; explanation: string; source: string }>;
    positiveSignals: string[];
    negativeSignals: string[];
    missingSignals: string[];
    riskScore: number;
    trustScore: number;
    verdict: string;
    layers: Array<{ state: string; passed: boolean; score: number; message: string; title?: string; layer?: number }>;
  },
  governmentVerification: GovernmentVerificationResult,
) {
  if (!governmentVerification.isGovernmentJobClaim) return evidence;

  const ncsReference = governmentVerification.ncsReference;
  const decisiveNcsMismatch = ncsReference.status === "NO_MATCH"
    && ncsReference.mismatchedFields.some((field) => ["organization", "notificationNumber", "advertisementNumber", "jobId"].includes(field));
  const riskImpact = governmentVerification.domainValidation.status === "FAIL"
    ? 12
    : governmentVerification.paymentSafety.status === "PERSONAL_OR_SUSPICIOUS"
      ? 16
      : governmentVerification.recruitmentConsistency.status === "INCONSISTENT"
        ? 8
        : decisiveNcsMismatch ? 8 : 0;
  const state = ["EXACT_MATCH", "STRONG_MATCH"].includes(ncsReference.status)
    ? "PASS"
    : ncsReference.status === "NO_MATCH" || ncsReference.status === "PARTIAL_MATCH"
      ? "REVIEW"
      : "NOT_VERIFIED";

  evidence.evidence.push({
    id: "government-registry-cross-check",
    category: "government-registry",
    state,
    weight: decisiveNcsMismatch ? 8 : 0,
    explanation: governmentVerification.recommendation,
    source: "NCS public reference and Government Registry",
  });
  for (const item of ncsReference.evidence) {
    evidence.evidence.push({
      id: `ncs-${item.signal.toLowerCase()}`,
      category: "government-reference",
      state: item.status === "PASS" ? "PASS" : "REVIEW",
      weight: item.status === "MISMATCH" ? 4 : 0,
      explanation: `${item.signal.replace(/_/g, " ")}: submitted ${item.observedValue || "not provided"}; NCS reference ${item.referenceValue || "not provided"}.`,
      source: `NCS: ${item.sourceUrl}`,
    });
  }

  evidence.positiveSignals.push(...governmentVerification.positiveSignals);
  evidence.negativeSignals.push(...governmentVerification.redFlags);
  if (ncsReference.status === "NOT_FOUND") {
    evidence.missingSignals.push("No matching NCS reference was found; absence alone is not evidence of fraud.");
  } else if (ncsReference.status === "UNAVAILABLE") {
    evidence.missingSignals.push(ncsReference.reason || "NCS reference access was unavailable; other verification evidence remains in effect.");
  }

  if (riskImpact > 0) {
    evidence.riskScore = Math.min(100, Math.max(0, evidence.riskScore + riskImpact));
    evidence.trustScore = Math.max(0, Math.min(100, evidence.trustScore - riskImpact * 0.65));
  }
  if ((decisiveNcsMismatch || ncsReference.status === "PARTIAL_MATCH") && evidence.verdict === "LOW RISK") evidence.verdict = "REVIEW";

  const layer = evidence.layers[11];
  if (layer) {
    layer.state = evidence.verdict === "HIGH RISK" ? "HIGH_RISK" : evidence.verdict === "LOW RISK" ? "PASS" : "REVIEW";
    layer.passed = evidence.verdict === "LOW RISK";
    layer.score = evidence.trustScore;
    layer.message = `${layer.message} NCS reference status: ${ncsReference.status.toLowerCase().replace(/_/g, " ")}${governmentVerification.domainValidation.status === "FAIL" ? "; submitted domain authenticity failed." : ""}.`;
  }

  return evidence;
}
