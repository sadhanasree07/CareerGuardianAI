type LinkRiskEvidence = {
  isShortened: boolean;
  redirectChain: string[];
  phishingSignals: string[];
  domainAnalysis: {
    organizationDomainStatus: "VERIFIED" | "MISMATCH" | "UNKNOWN";
    domainMatch: boolean;
    domainStatus: string;
    isLookalike: boolean;
    isTyposquatting: boolean;
    differenceType: string[];
    similarityScore: number;
  };
};

type CriticalRiskEvidence = {
  criticalFinancialOrCredential?: boolean;
  personalPayment?: boolean;
  suspiciousQrPayment?: boolean;
  maliciousRedirect?: boolean;
};

const MANIPULATION_TYPES = new Set([
  "character_substitution",
  "extra_character",
  "missing_character",
  "character_transposition",
  "hyphen_manipulation",
  "unicode_homoglyph",
  "brand_imitation",
]);

function scoreLink(link: LinkRiskEvidence) {
  const domain = link.domainAnalysis;
  const verified = domain.domainMatch || domain.organizationDomainStatus === "VERIFIED";
  let score = 0;

  if (!verified) {
    if (domain.organizationDomainStatus === "MISMATCH") {
      score = 25;
      if (domain.isTyposquatting || domain.similarityScore >= 85) score = 75;
      else if (domain.isLookalike) score = 55;

      const differenceTypes = new Set(domain.differenceType.map((type) => type.toLowerCase()));
      if ([...differenceTypes].some((type) => MANIPULATION_TYPES.has(type))) score += 5;
      if (differenceTypes.has("misleading_keyword")) score += 10;
      if (differenceTypes.has("suspicious_subdomain")) score += 10;
    } else if (domain.domainStatus !== "SHORTENED_URL") {
      score = 30;
    }

    if (domain.domainStatus === "SUSPICIOUS_DOMAIN" && /suspicious_tld|wrong_tld/.test(domain.differenceType.join(" ").toLowerCase())) score += 10;
    if (link.phishingSignals.some((signal) => /SCRUTINY_TLD|SUSPICIOUS_TLD/i.test(signal))) score += 10;

    const redirectedToMismatch = link.redirectChain.length > 1 && domain.organizationDomainStatus === "MISMATCH";
    if (redirectedToMismatch) score += 15;
  }

  if (link.isShortened) score += 5;
  if (link.phishingSignals.some((signal) => /MALICIOUS|PHISHING/i.test(signal))) score += 15;
  return Math.min(100, score);
}

export function aggregateScamRisk(
  existingRisk: number,
  links: readonly LinkRiskEvidence[],
  criticalEvidence: CriticalRiskEvidence = {},
) {
  const scores = links.map(scoreLink).sort((left, right) => right - left);
  const strongestLinkRisk = scores[0] || 0;
  const independentSevereRisk = Math.min(15, Math.max(0, scores.filter((score) => score >= 55).length - 1) * 5);
  let risk = Math.max(existingRisk, Math.min(100, strongestLinkRisk + independentSevereRisk));

  if (
    criticalEvidence.criticalFinancialOrCredential
    || criticalEvidence.personalPayment
    || criticalEvidence.suspiciousQrPayment
    || criticalEvidence.maliciousRedirect
  ) {
    risk = Math.max(risk, 90);
  }

  return Math.max(0, Math.min(100, Math.round(risk)));
}