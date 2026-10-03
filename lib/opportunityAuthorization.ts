import { extractGovernmentRecruitmentFacts } from "./governmentRegistry.ts";
import type { WebsiteAuthenticityResult } from "./websiteAuthenticity.types.ts";

export type OpportunityFieldStatus = "MATCH" | "MISMATCH" | "NOT_FOUND" | "NOT_AVAILABLE" | "CONFLICT";
export type OpportunityAuthorizationStatus = "AUTHORIZED" | "REVIEW" | "HIGH_RISK" | "NOT_VERIFIED";
type WebsiteIdentityEvidence = Pick<WebsiteAuthenticityResult, "status" | "referenceStatus" | "claimedOrganization" | "finalUrl" | "submittedUrl">
  & { domain: Pick<WebsiteAuthenticityResult["domain"], "status" | "referenceDomain" | "suspiciousPatterns"> };
type PaymentIdentityEvidence = {
  paymentRequested: boolean;
  destinationType: string;
  organizationMatch: string;
};

export type OpportunityIdentity = {
  organization: string | null;
  domain: string | null;
  jobTitle: string | null;
  jobId: string | null;
  notificationId: string | null;
  recruiterName: string | null;
  recruiterEmail: string | null;
  recruiterPhone: string | null;
  location: string | null;
  applicationUrl: string | null;
  source: string | null;
  publishedDate: string | null;
  deadline: string | null;
  paymentDestination: string | null;
};

export type TrustedOpportunityRecord = {
  source: "OFFICIAL_RECRUITMENT_REGISTRY" | "OFFICIAL_CAREERS_PAGE" | "INDEPENDENT_ORGANIZATION_SOURCE" | "COLLEGE_PLACEMENT_CELL";
  sourceUrl: string;
  sourceIsIndependent: true;
  catalogComplete: boolean;
  organization: string;
  domain?: string | null;
  jobTitle?: string | null;
  jobId?: string | null;
  notificationId?: string | null;
  recruiterName?: string | null;
  recruiterEmail?: string | null;
  recruiterPhone?: string | null;
  location?: string | null;
  applicationUrl?: string | null;
  publishedDate?: string | null;
  deadline?: string | null;
};

type FieldEvidence = {
  status: OpportunityFieldStatus;
  submitted: string | null;
  independentlyObserved: string | null;
  source: string;
};

export type OpportunityAuthorizationResult = {
  status: OpportunityAuthorizationStatus;
  finalStatus: OpportunityAuthorizationStatus;
  organizationVerified: boolean;
  opportunityAuthorized: boolean;
  jobIdStatus: OpportunityFieldStatus;
  notificationIdStatus: OpportunityFieldStatus;
  recruiterStatus: "VERIFIED" | "MISMATCH" | "CONFLICT" | "NOT_VERIFIED" | "NOT_AVAILABLE";
  independentVerification: "VERIFIED" | "INSUFFICIENT" | "CONFLICT";
  identity: OpportunityIdentity;
  evidence: {
    organizationIdentity: FieldEvidence;
    domainIdentity: FieldEvidence;
    opportunityIdentity: Record<"jobTitle" | "jobId" | "notificationId" | "location" | "publishedDate" | "deadline", FieldEvidence>;
    recruiterIdentity: FieldEvidence;
    sourceProvenance: FieldEvidence;
    applicationUrl: FieldEvidence;
    paymentIdentity: FieldEvidence;
    independentVerification: FieldEvidence;
    contradictions: string[];
    missingEvidence: string[];
    positiveEvidence: string[];
    negativeEvidence: string[];
  };
  strongContradiction: boolean;
  independentlyConfirmedConflict: boolean;
  riskScore: number;
  verificationConfidence: number;
  evidenceCoverage: { observed: number; total: number };
  explanation: string;
  nextAction: string;
};

type AuthorizationInput = {
  submission: Record<string, unknown>;
  websiteAuthenticity?: WebsiteIdentityEvidence | null;
  payment?: PaymentIdentityEvidence | null;
  trustedRecords?: readonly TrustedOpportunityRecord[];
  riskScore?: number;
  verificationConfidence?: number;
  evidenceCoverage?: number;
};

const asText = (value: unknown): string | null => typeof value === "string" && value.trim() ? value.trim().slice(0, 500) : null;
const normalize = (value: string | null | undefined) => value?.trim().toLocaleLowerCase().replace(/\s+/g, " ") || "";

function normalizeUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function normalizeDomain(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

function sameValue(submitted: string | null, trusted: string | null | undefined) {
  return Boolean(submitted && trusted && normalize(submitted) === normalize(trusted));
}

function fieldEvidence(submitted: string | null, trusted: string | null | undefined, source: string): FieldEvidence {
  return {
    status: !trusted ? "NOT_AVAILABLE" : !submitted ? "NOT_AVAILABLE" : sameValue(submitted, trusted) ? "MATCH" : "MISMATCH",
    submitted,
    independentlyObserved: trusted || null,
    source,
  };
}

function urlFieldEvidence(submitted: string | null, trusted: string | null | undefined, source: string): FieldEvidence {
  const normalizedSubmitted = normalizeUrl(submitted);
  const normalizedTrusted = normalizeUrl(trusted);
  return {
    status: !normalizedTrusted ? "NOT_AVAILABLE"
      : !normalizedSubmitted ? "NOT_AVAILABLE"
        : normalizedSubmitted === normalizedTrusted ? "MATCH" : "MISMATCH",
    submitted,
    independentlyObserved: normalizedTrusted,
    source,
  };
}

function sourceDomain(sourceUrl: string) {
  return normalizeDomain(sourceUrl);
}

function isIndependentRecord(record: TrustedOpportunityRecord, submittedUrl: string | null) {
  const recordUrl = normalizeUrl(record.sourceUrl);
  const recordDomain = sourceDomain(recordUrl || "");
  const submittedDomain = sourceDomain(submittedUrl || "");
  return record.sourceIsIndependent
    && Boolean(recordUrl)
    && Boolean(recordDomain)
    && (!submittedDomain || (recordDomain !== submittedDomain && !recordDomain.endsWith(`.${submittedDomain}`) && !submittedDomain.endsWith(`.${recordDomain}`)));
}

export function extractOpportunityIdentity(
  submission: Record<string, unknown>,
  websiteAuthenticity?: WebsiteIdentityEvidence | null,
  payment?: PaymentIdentityEvidence | null,
): OpportunityIdentity {
  const governmentFacts = extractGovernmentRecruitmentFacts(submission);
  const rawText = [
    submission.rawText,
    submission.extractedText,
    submission.text,
    submission.transcript,
    submission.cleanTranscript,
    submission.description,
  ].filter((value): value is string => typeof value === "string").join("\n");
  const jobId = asText(submission.jobId)
    || rawText.match(/(?:job|requisition|vacancy)\s*(?:id|no\.?|number)?\s*[:#-]\s*([A-Z0-9][A-Z0-9./_-]{2,48})/i)?.[1]
    || null;
  const website = asText(submission.website) || asText(submission.url);
  const extractedApplicationUrl = rawText.match(/https?:\/\/[^\s<>'")]+/i)?.[0] || null;
  const extractedGovernmentUrl = governmentFacts.applicationUrl && governmentFacts.applicationUrl !== website
    ? governmentFacts.applicationUrl
    : null;
  const applicationUrl = asText(submission.applicationUrl)
    || (submission.inputType === "url" ? website : null)
    || extractedApplicationUrl
    || extractedGovernmentUrl;
  const paymentDestination = payment?.destinationType === "PERSONAL_UPI" || payment?.destinationType === "PERSONAL_BANK"
    ? payment.destinationType
    : payment?.destinationType === "GOVERNMENT_DOMAIN" || payment?.destinationType === "MERCHANT"
      ? payment.destinationType
      : payment?.paymentRequested ? "UNVERIFIED_DESTINATION" : null;

  return {
    organization: asText(submission.company) || asText(submission.organization) || governmentFacts.claimedOrganization || null,
    domain: normalizeDomain(website || websiteAuthenticity?.finalUrl || websiteAuthenticity?.submittedUrl),
    jobTitle: asText(submission.jobRole) || governmentFacts.postTitle || null,
    jobId,
    notificationId: asText(submission.notificationNumber) || governmentFacts.notificationNumber || null,
    recruiterName: asText(submission.recruiterName) || asText(submission.contactName),
    recruiterEmail: asText(submission.recruiterEmail) || asText(submission.email),
    recruiterPhone: asText(submission.recruiterPhone) || asText(submission.phone),
    location: asText(submission.location) || null,
    applicationUrl: normalizeUrl(applicationUrl),
    source: asText(submission.sourceType) || asText(submission.source) || null,
    publishedDate: asText(submission.publishedDate) || governmentFacts.applicationStartDate || null,
    deadline: asText(submission.deadline) || governmentFacts.applicationClosingDate || null,
    paymentDestination,
  };
}

function matchRecord(identity: OpportunityIdentity, record: TrustedOpportunityRecord) {
  const source = `${record.source} (${normalizeUrl(record.sourceUrl) || "invalid source URL"})`;
  const suppliedFields = [
    ["jobTitle", identity.jobTitle, record.jobTitle],
    ["jobId", identity.jobId, record.jobId],
    ["notificationId", identity.notificationId, record.notificationId],
    ["location", identity.location, record.location],
    ["publishedDate", identity.publishedDate, record.publishedDate],
    ["deadline", identity.deadline, record.deadline],
  ] as const;
  const matched = suppliedFields.filter(([, submitted, trusted]) => submitted && trusted && sameValue(submitted, trusted)).length;
  const mismatched = suppliedFields.filter(([, submitted, trusted]) => submitted && trusted && !sameValue(submitted, trusted));
  const opportunityUrl = identity.applicationUrl && record.applicationUrl
    ? urlFieldEvidence(identity.applicationUrl, record.applicationUrl, source)
    : urlFieldEvidence(identity.applicationUrl, null, source);
  const organization = fieldEvidence(identity.organization, record.organization, source);
  const domain = fieldEvidence(identity.domain, normalizeDomain(record.domain || record.sourceUrl), source);
  const recruiterSubmitted = identity.recruiterEmail || identity.recruiterName || identity.recruiterPhone;
  const recruiterMatches = [
    sameValue(identity.recruiterName, record.recruiterName),
    sameValue(identity.recruiterEmail, record.recruiterEmail),
    sameValue(identity.recruiterPhone, record.recruiterPhone),
  ].some(Boolean);
  const recruiterMismatch = [
    [identity.recruiterName, record.recruiterName],
    [identity.recruiterEmail, record.recruiterEmail],
    [identity.recruiterPhone, record.recruiterPhone],
  ].some(([submitted, trusted]) => Boolean(submitted && trusted && !sameValue(submitted, trusted)));
  const recruiter: FieldEvidence = {
    status: !recruiterSubmitted ? "NOT_AVAILABLE" : recruiterMatches ? "MATCH" : recruiterMismatch ? "MISMATCH" : "NOT_FOUND",
    submitted: identity.recruiterEmail || identity.recruiterName || identity.recruiterPhone,
    independentlyObserved: record.recruiterEmail || record.recruiterName || record.recruiterPhone || null,
    source,
  };

  return {
    source,
    organization,
    domain,
    fields: Object.fromEntries(suppliedFields.map(([key, submitted, trusted]) => [key, fieldEvidence(submitted, trusted, source)])) as Record<typeof suppliedFields[number][0], FieldEvidence>,
    applicationUrl: opportunityUrl,
    recruiter,
    matched,
    mismatched,
    anchored: suppliedFields.some(([, submitted, trusted]) => submitted && trusted && sameValue(submitted, trusted)),
  };
}

export function evaluateOpportunityAuthorization(input: AuthorizationInput): OpportunityAuthorizationResult {
  const identity = extractOpportunityIdentity(input.submission, input.websiteAuthenticity, input.payment);
  const records = (input.trustedRecords || []).filter((record) => isIndependentRecord(record, identity.applicationUrl));
  const matchingOrganizationRecords = records.filter((record) => sameValue(identity.organization, record.organization));
  const evaluations = records.map((record) => matchRecord(identity, record));
  const exactRecord = evaluations.find((item) => item.organization.status === "MATCH"
    && item.mismatched.length === 0
    && item.fields.jobTitle.status === "MATCH"
    && (item.fields.jobId.status === "MATCH" || item.fields.notificationId.status === "MATCH")
    && item.applicationUrl.status === "MATCH"
    && (!(identity.recruiterName || identity.recruiterEmail || identity.recruiterPhone) || item.recruiter.status === "MATCH"));
  const conflictingRecord = evaluations.find((item) => item.anchored
    && (item.organization.status === "MISMATCH"
      || ((item.fields.jobId.status === "MATCH" || item.fields.notificationId.status === "MATCH")
        && (item.mismatched.length > 0 || item.applicationUrl.status === "MISMATCH" || item.recruiter.status === "MISMATCH"))));
  const titleRecord = evaluations.find((item) => item.fields.jobTitle.status === "MATCH");
  const selected = conflictingRecord || exactRecord || titleRecord;
  const organizationVerified = (input.websiteAuthenticity?.referenceStatus === "VERIFIED"
    && input.websiteAuthenticity.domain.status === "MATCH")
    || Boolean(selected?.organization.status === "MATCH");
  const lookalike = input.websiteAuthenticity?.status === "SUSPICIOUS"
    && input.websiteAuthenticity.domain.suspiciousPatterns.length > 0;
  const domainMismatch = input.websiteAuthenticity?.domain.status === "MISMATCH";
  const personalPayment = Boolean(input.payment?.paymentRequested
    && ["PERSONAL_UPI", "PERSONAL_BANK"].includes(input.payment.destinationType));
  const strongContradiction = Boolean((conflictingRecord?.mismatched.length || selected?.recruiter.status === "MISMATCH")
    || lookalike
    || domainMismatch
    || personalPayment
    || (input.payment?.paymentRequested && input.payment.organizationMatch === "MISMATCH"));

  const organizationEvidence: FieldEvidence = selected?.organization || {
    status: organizationVerified ? "MATCH" : identity.organization ? "NOT_AVAILABLE" : "NOT_AVAILABLE",
    submitted: identity.organization,
    independentlyObserved: organizationVerified ? input.websiteAuthenticity?.claimedOrganization || null : null,
    source: organizationVerified ? "CareerGuardian verified organization registry" : "No independent organization record",
  };
  const domainEvidence: FieldEvidence = selected?.domain || {
    status: input.websiteAuthenticity?.domain.status === "MATCH" ? "MATCH"
      : input.websiteAuthenticity?.domain.status === "MISMATCH" ? "MISMATCH"
        : identity.domain ? "NOT_AVAILABLE" : "NOT_AVAILABLE",
    submitted: identity.domain,
    independentlyObserved: input.websiteAuthenticity?.domain.referenceDomain || null,
    source: input.websiteAuthenticity?.referenceStatus === "VERIFIED" ? "CareerGuardian verified organization registry" : "No independent domain reference",
  };
  const unavailableSource = "No independent opportunity record is available";
  const opportunityFields = selected?.fields || {
    jobTitle: fieldEvidence(identity.jobTitle, null, unavailableSource),
    jobId: fieldEvidence(identity.jobId, null, unavailableSource),
    notificationId: fieldEvidence(identity.notificationId, null, unavailableSource),
    location: fieldEvidence(identity.location, null, unavailableSource),
    publishedDate: fieldEvidence(identity.publishedDate, null, unavailableSource),
    deadline: fieldEvidence(identity.deadline, null, unavailableSource),
  };
  const completeCatalog = matchingOrganizationRecords.some((record) => record.catalogComplete);
  if (!exactRecord && completeCatalog) {
    if (identity.jobId && !matchingOrganizationRecords.some((record) => sameValue(identity.jobId, record.jobId))) {
      opportunityFields.jobId = { status: "NOT_FOUND", submitted: identity.jobId, independentlyObserved: null, source: "Independently checked complete opportunity catalog" };
    }
    if (identity.notificationId && !matchingOrganizationRecords.some((record) => sameValue(identity.notificationId, record.notificationId))) {
      opportunityFields.notificationId = { status: "NOT_FOUND", submitted: identity.notificationId, independentlyObserved: null, source: "Independently checked complete opportunity catalog" };
    }
  }
  const recruiterEvidence: FieldEvidence = selected?.recruiter || {
    status: "NOT_AVAILABLE" as OpportunityFieldStatus,
    submitted: identity.recruiterEmail || identity.recruiterName || identity.recruiterPhone,
    independentlyObserved: null,
    source: unavailableSource,
  };
  const trustedOpportunityFound = Boolean(exactRecord);
  const independentVerification = conflictingRecord ? "CONFLICT"
    : trustedOpportunityFound ? "VERIFIED"
      : "INSUFFICIENT";
  const contradictions = [
    ...(domainMismatch || lookalike ? ["Submitted domain conflicts with the verified organization domain."] : []),
    ...(selected?.organization.status === "MISMATCH" ? ["Organization conflicts with an independently verified opportunity record."] : []),
    ...(selected?.mismatched.map(([field]) => `${field} conflicts with an independently verified opportunity record.`) || []),
    ...(selected?.recruiter.status === "MISMATCH" ? ["Recruiter details conflict with an independently verified source."] : []),
    ...(selected?.applicationUrl.status === "MISMATCH" ? ["Application URL conflicts with an independently verified opportunity record."] : []),
    ...(personalPayment ? ["Payment is requested to a personal destination."] : []),
    ...(input.payment?.paymentRequested && input.payment.organizationMatch === "MISMATCH" ? ["Payment beneficiary does not match the claimed organization."] : []),
  ];
  const missingEvidence = [
    ...(!identity.organization ? ["Organization was not provided."] : []),
    ...(!identity.jobTitle ? ["Job title was not provided."] : []),
    ...(!identity.jobId && !identity.notificationId ? ["Job or notification identifier was not provided."] : []),
    ...(!identity.recruiterName && !identity.recruiterEmail && !identity.recruiterPhone ? ["Recruiter details were not provided."] : []),
    ...(!records.length ? ["No independent opportunity authorization source is configured or available."] : []),
    ...(identity.applicationUrl && !selected?.applicationUrl ? ["Application URL has no independent comparison."] : []),
  ];
  const positiveEvidence = [
    ...(organizationVerified ? ["Organization identity matches CareerGuardian's curated verified-domain registry. This does not authorize the opportunity."] : []),
    ...(selected && selected.organization.status === "MATCH" ? ["Organization matches an independent opportunity record."] : []),
    ...(selected && selected.fields.jobTitle.status === "MATCH" ? ["Job title matches an independent opportunity record."] : []),
    ...(selected && (selected.fields.jobId.status === "MATCH" || selected.fields.notificationId.status === "MATCH") ? ["Opportunity identifier matches an independent record."] : []),
    ...(selected && selected.applicationUrl.status === "MATCH" ? ["Application URL matches an independent opportunity record."] : []),
    ...(selected && selected.recruiter.status === "MATCH" ? ["Recruiter details match an independent source."] : []),
  ];
  const negativeEvidence = [...contradictions];
  const riskScore = Math.max(0, Math.min(100, input.riskScore || 0));
  const highRisk = Boolean(strongContradiction && (
    personalPayment
    || input.payment?.organizationMatch === "MISMATCH"
    || lookalike
    || domainMismatch
    || Boolean(conflictingRecord)
  )) || riskScore >= 70;
  const finalStatus: OpportunityAuthorizationStatus = highRisk
    ? "HIGH_RISK"
    : trustedOpportunityFound
      ? "AUTHORIZED"
      : identity.organization || identity.jobTitle || identity.jobId || identity.notificationId
        ? "REVIEW"
        : "NOT_VERIFIED";
  const jobIdStatus = opportunityFields.jobId.status;
  const notificationIdStatus = opportunityFields.notificationId.status;
  const sourceEvidence: FieldEvidence = {
    status: selected ? "MATCH" : identity.source ? "NOT_AVAILABLE" : "NOT_AVAILABLE",
    submitted: identity.source,
    independentlyObserved: selected?.source || null,
    source: selected?.source || unavailableSource,
  };
  const paymentEvidence: FieldEvidence = {
    status: personalPayment || input.payment?.organizationMatch === "MISMATCH" ? "MISMATCH"
      : input.payment?.paymentRequested ? "NOT_AVAILABLE"
        : "NOT_AVAILABLE",
    submitted: identity.paymentDestination,
    independentlyObserved: null,
    source: input.payment?.paymentRequested ? "PayGuard; destination ownership not independently established" : "No payment request detected",
  };
  const independentEvidence: FieldEvidence = {
    status: trustedOpportunityFound ? "MATCH" : conflictingRecord ? "CONFLICT" : "NOT_AVAILABLE",
    submitted: identity.jobId || identity.notificationId || identity.jobTitle,
    independentlyObserved: trustedOpportunityFound ? selected?.source || null : null,
    source: selected?.source || unavailableSource,
  };
  const applicationEvidence = selected?.applicationUrl || urlFieldEvidence(identity.applicationUrl, null, unavailableSource);
  if (exactRecord && conflictingRecord) {
    for (const field of ["jobTitle", "jobId", "notificationId", "location", "publishedDate", "deadline"] as const) {
      if (exactRecord.fields[field].status === "MATCH" && conflictingRecord.fields[field].status === "MISMATCH") {
        opportunityFields[field] = { ...conflictingRecord.fields[field], status: "CONFLICT" };
      }
    }
    if (exactRecord.organization.status === "MATCH" && conflictingRecord.organization.status === "MISMATCH") {
      organizationEvidence.status = "CONFLICT";
    }
    if (exactRecord.recruiter.status === "MATCH" && conflictingRecord.recruiter.status === "MISMATCH") {
      recruiterEvidence.status = "CONFLICT";
    }
    if (exactRecord.applicationUrl.status === "MATCH" && conflictingRecord.applicationUrl.status === "MISMATCH") {
      applicationEvidence.status = "CONFLICT";
    }
  }
  const recruiterStatus = recruiterEvidence.status === "MATCH" ? "VERIFIED"
    : recruiterEvidence.status === "MISMATCH" ? "MISMATCH"
      : recruiterEvidence.status === "CONFLICT" ? "CONFLICT"
        : identity.recruiterEmail || identity.recruiterName || identity.recruiterPhone ? "NOT_VERIFIED" : "NOT_AVAILABLE";
  const independentEvidenceFields = [
    organizationEvidence,
    domainEvidence,
    ...Object.values(opportunityFields),
    recruiterEvidence,
    sourceEvidence,
    applicationEvidence,
    paymentEvidence,
    independentEvidence,
  ];
  const observedEvidenceCount = independentEvidenceFields.filter((item) => item.status !== "NOT_AVAILABLE").length;

  return {
    status: finalStatus,
    finalStatus,
    organizationVerified,
    opportunityAuthorized: finalStatus === "AUTHORIZED",
    jobIdStatus,
    notificationIdStatus,
    recruiterStatus,
    independentVerification,
    identity,
    evidence: {
      organizationIdentity: organizationEvidence,
      domainIdentity: domainEvidence,
      opportunityIdentity: opportunityFields,
      recruiterIdentity: recruiterEvidence,
      sourceProvenance: sourceEvidence,
      applicationUrl: applicationEvidence,
      paymentIdentity: paymentEvidence,
      independentVerification: independentEvidence,
      contradictions,
      missingEvidence,
      positiveEvidence,
      negativeEvidence,
    },
    strongContradiction,
    independentlyConfirmedConflict: Boolean(conflictingRecord),
    riskScore,
    verificationConfidence: Math.max(0, Math.min(100, input.verificationConfidence || 0)),
    evidenceCoverage: { observed: observedEvidenceCount, total: independentEvidenceFields.length },
    explanation: finalStatus === "AUTHORIZED"
      ? "The specific opportunity matches an independently verified record. Organization and opportunity authorization are assessed separately."
      : finalStatus === "HIGH_RISK"
        ? "Strong contradictory or payment evidence was found; the opportunity should not be treated as authorized."
        : organizationVerified
          ? "Organization identity is verified, but the specific opportunity could not be independently connected to an authorized recruitment record."
          : "The specific opportunity could not be independently verified. Missing or unavailable evidence is not, by itself, proof of fraud.",
    nextAction: finalStatus === "HIGH_RISK"
      ? "Do not pay or share sensitive information. Contact the organization using contact information obtained independently."
      : finalStatus === "AUTHORIZED"
        ? "Proceed only through the independently matched official application route and confirm that the record is current."
        : "Contact the organization through independently obtained official contact information and ask them to confirm this exact job or notification ID.",
  };
}
