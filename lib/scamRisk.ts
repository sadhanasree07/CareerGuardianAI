export const SCAM_RISK_WEIGHTS = {
  governmentRegistry: 25,
  notificationAuthenticity: 15,
  domainAuthenticity: 15,
  paymentIdentity: 20,
  documentProvenance: 10,
  threatNet: 10,
  contentPatterns: 5,
} as const;

type ScamRiskInput = {
  governmentClaim: boolean;
  governmentVerification?: {
    verificationStatus?: string;
    redFlags?: string[];
    registryChecks?: Array<{ status?: string }>;
    ncsReference?: { status?: string; mismatchedFields?: string[] };
  } | null;
  notificationNumber?: string;
  notificationMatchStatus?: string;
  recruitmentConsistencyStatus?: string;
  links?: Array<{
    originalUrl: string;
    isShortened: boolean;
    redirectChain: string[];
    phishingSignals: string[];
    domainAnalysis: {
      hostname: string;
      organizationDomainStatus: string;
      domainMatch: boolean;
      domainStatus: string;
      isLookalike: boolean;
      isTyposquatting: boolean;
      similarityScore: number;
    };
  }>;
  payment?: { paymentRequested?: boolean; severity?: string; organizationMatch?: string; upiIds?: unknown[]; bankAccounts?: unknown[] } | null;
  provenance?: { signature?: { status?: string } } | null;
  threat?: { status?: string; matched?: boolean; similarityScore?: number; reportCount?: number } | null;
  evidence?: Array<{ id: string; state: string; weight: number }>;
};

export type ScamRiskAssessment = {
  score: number;
  categoryScores: Record<keyof typeof SCAM_RISK_WEIGHTS, number>;
  categoryContributions: Record<keyof typeof SCAM_RISK_WEIGHTS, number>;
  categoryWeights: typeof SCAM_RISK_WEIGHTS;
  status: "LOW RISK" | "REVIEW REQUIRED" | "HIGH RISK" | "CRITICAL RISK";
  criticalOverride: string | null;
};

export function calculateEvidenceCoverage(input: {
  documentUploaded: boolean;
  governmentClaim: boolean;
  registryAvailable: boolean;
  registryNotificationAvailable: boolean;
  urlProvided: boolean;
  linkAnalysisActive: boolean;
  textAvailable: boolean;
  paymentAnalysisActive: boolean;
  threatStatus: string;
  sourceProvided: boolean;
}): number {
  const categories: Array<{ applicable: boolean; checked: boolean }> = [
    { applicable: input.documentUploaded, checked: input.documentUploaded },
    { applicable: input.governmentClaim, checked: input.governmentClaim && input.registryAvailable },
    { applicable: input.governmentClaim, checked: input.governmentClaim && input.registryNotificationAvailable },
    { applicable: input.urlProvided, checked: input.urlProvided && input.linkAnalysisActive },
    { applicable: input.textAvailable, checked: input.textAvailable && input.paymentAnalysisActive },
    { applicable: input.textAvailable, checked: ["MATCH_FOUND", "NO_MATCH"].includes(input.threatStatus) },
    { applicable: true, checked: input.sourceProvided },
    { applicable: input.textAvailable, checked: input.textAvailable },
  ];
  const applicable = categories.filter((category) => category.applicable);
  if (!applicable.length) return 0;
  return Math.round(applicable.filter((category) => category.checked).length / applicable.length * 100);
}

function domainCategoryScore(input: ScamRiskInput) {
  const links = input.links || [];
  const uniqueHosts = new Map<string, NonNullable<ScamRiskInput["links"]>[number]>();
  for (const link of links) {
    const key = link.domainAnalysis.hostname.toLowerCase() || link.originalUrl.toLowerCase();
    if (key && !uniqueHosts.has(key)) uniqueHosts.set(key, link);
  }
  let highest = 0;
  for (const link of uniqueHosts.values()) {
    const domain = link.domainAnalysis;
    const mismatch = domain.organizationDomainStatus === "MISMATCH" && !domain.domainMatch;
    let score = 0;
    if (mismatch && domain.isTyposquatting && domain.similarityScore >= 85) score = 95;
    else if (mismatch && domain.isLookalike) score = 75;
    else if (mismatch && domain.domainStatus === "SUSPICIOUS_DOMAIN") score = 45;
    if (link.phishingSignals.some((signal) => /MALICIOUS|PHISHING/i.test(signal))) score = Math.max(score, 90);
    if (link.redirectChain.length > 1 && mismatch) score = Math.min(100, score + 10);
    if (link.isShortened && score === 0) score = 5;
    highest = Math.max(highest, score);
  }
  return highest;
}

export function calculateEvidenceWeightedScamRisk(input: ScamRiskInput): ScamRiskAssessment {
  const ncsIdentityContradiction = input.governmentVerification?.ncsReference?.status === "NO_MATCH"
    && (input.governmentVerification.ncsReference.mismatchedFields || []).some((field) => ["organization", "notificationNumber", "advertisementNumber", "jobId"].includes(field));
  const ncsFieldDisagreement = ["NO_MATCH", "PARTIAL_MATCH"].includes(input.governmentVerification?.ncsReference?.status || "")
    && Boolean(input.governmentVerification?.ncsReference?.mismatchedFields?.length);
  const governmentRegistry = input.governmentClaim && input.governmentVerification?.registryChecks?.some((check) => check.status === "SUSPICIOUS") ? 95 : ncsIdentityContradiction ? 55 : ncsFieldDisagreement ? 40 : 0;
  const notificationAuthenticity = !input.governmentClaim ? 0
    : input.notificationMatchStatus === "CONTRADICTED" ? 60
      : input.recruitmentConsistencyStatus === "INCONSISTENT" ? 45
        : 0;
  const domainAuthenticity = domainCategoryScore(input);
  const paymentRequested = input.payment?.paymentRequested === true;
  const paymentIdentity = !paymentRequested ? 0
    : input.payment?.severity === "CRITICAL" ? 100
      : input.payment?.organizationMatch === "MISMATCH" ? 90
        : input.payment?.severity === "HIGH" ? 75
          : input.payment?.severity === "REVIEW" ? 40
            : 0;
  const signatureStatus = input.provenance?.signature?.status;
  const documentProvenance = signatureStatus === "INVALID" ? 85 : 0;
  const threatNet = input.threat?.matched && input.threat.status === "MATCH_FOUND"
    ? input.threat.similarityScore !== undefined && input.threat.similarityScore >= 90 && (input.threat.reportCount || 0) >= 2 ? 85 : 65
    : 0;
  const contentPatterns = Math.min(100, (input.evidence || [])
    .filter((item) => ["credentials", "urgency", "cross-source-fee-conflict"].includes(item.id) && item.weight > 0)
    .reduce((total, item) => total + (item.id === "credentials" ? 100 : item.id === "cross-source-fee-conflict" ? 65 : 30), 0));

  const categoryScores = {
    governmentRegistry,
    notificationAuthenticity,
    domainAuthenticity,
    paymentIdentity,
    documentProvenance,
    threatNet,
    contentPatterns,
  };
  const categoryContributions = Object.fromEntries(Object.entries(SCAM_RISK_WEIGHTS).map(([category, weight]) => [
    category,
    Math.round(categoryScores[category as keyof typeof categoryScores] * weight) / 100,
  ])) as Record<keyof typeof SCAM_RISK_WEIGHTS, number>;
  let score = Math.round(Object.values(categoryContributions).reduce((total, contribution) => total + contribution, 0));

  const governmentLookalike = input.governmentClaim && (input.links || []).some((link) =>
    link.domainAnalysis.organizationDomainStatus === "MISMATCH"
    && link.domainAnalysis.isTyposquatting
    && link.domainAnalysis.similarityScore >= 85,
  );
  const personalPayment = paymentRequested && (input.payment?.severity === "CRITICAL" || input.payment?.organizationMatch === "MISMATCH")
    && Boolean(input.payment?.upiIds?.length || input.payment?.bankAccounts?.length);
  let criticalOverride: string | null = null;
  const overrides: string[] = [];
  if (personalPayment) {
    score = Math.max(score, 90);
    overrides.push("Recruitment payment request targets a personal or organization-mismatched destination.");
  }
  if (input.governmentClaim && input.notificationMatchStatus === "CONTRADICTED") {
    score = Math.max(score, 25);
  }
  if (input.governmentClaim && ncsFieldDisagreement) {
    score = Math.max(score, 25);
  }
  if (governmentLookalike) {
    score = Math.max(score, 85);
    overrides.push("Government recruitment claim uses a high-similarity lookalike domain.");
  }
  if ((input.evidence || []).some((item) => item.id === "credentials" && item.state === "HIGH_RISK" && item.weight > 0)) {
    score = Math.max(score, 85);
    overrides.push("A request for sensitive account credentials was detected.");
  }
  if ((input.links || []).some((link) => link.phishingSignals.some((signal) => /MALICIOUS|PHISHING/i.test(signal)))) {
    score = Math.max(score, 85);
    overrides.push("A malicious or phishing redirect indicator was detected.");
  }
  criticalOverride = overrides.length ? overrides.join(" ") : null;

  score = Math.max(0, Math.min(100, score));
  const status: ScamRiskAssessment["status"] = score >= 85 ? "CRITICAL RISK" : score >= 70 ? "HIGH RISK" : score >= 20 ? "REVIEW REQUIRED" : "LOW RISK";
  return { score, categoryScores, categoryContributions, categoryWeights: SCAM_RISK_WEIGHTS, status, criticalOverride };
}