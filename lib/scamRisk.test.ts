import assert from "node:assert/strict";
import test from "node:test";
import { calculateEvidenceCoverage, calculateEvidenceWeightedScamRisk, SCAM_RISK_WEIGHTS } from "./scamRisk.ts";

const unknownInput = { governmentClaim: false };
const typoLink = {
  originalUrl: "https://ssc-gov.in/apply",
  isShortened: false,
  redirectChain: ["https://ssc-gov.in/apply"],
  phishingSignals: ["POSSIBLE_TYPOSQUATTING"],
  domainAnalysis: {
    hostname: "ssc-gov.in", organizationDomainStatus: "MISMATCH", domainMatch: false,
    domainStatus: "TYPOSQUATTING_DETECTED", isLookalike: true, isTyposquatting: true,
    similarityScore: 90,
  },
};

test("risk weights total 100 and unknown categories add no risk", () => {
  assert.equal(Object.values(SCAM_RISK_WEIGHTS).reduce((sum, weight) => sum + weight, 0), 100);
  assert.equal(calculateEvidenceWeightedScamRisk(unknownInput).score, 0);
});

test("a government lookalike domain receives critical-range risk", () => {
  const result = calculateEvidenceWeightedScamRisk({ governmentClaim: true, links: [typoLink] });
  assert.ok(result.score >= 85);
  assert.equal(result.status, "CRITICAL RISK");
  assert.match(result.criticalOverride || "", /lookalike domain/i);
});

test("a genuine government notice with exact domain, confirmed registry and no payment risk stays low", () => {
  const result = calculateEvidenceWeightedScamRisk({
    governmentClaim: true,
    governmentVerification: { verificationStatus: "VERIFIED", registryChecks: [{ status: "VERIFIED" }] },
    notificationMatchStatus: "VERIFIED",
    recruitmentConsistencyStatus: "CONSISTENT",
    links: [{
      ...typoLink,
      domainAnalysis: { ...typoLink.domainAnalysis, hostname: "ssc.gov.in", organizationDomainStatus: "VERIFIED", domainMatch: true, domainStatus: "OFFICIAL_MATCH", isLookalike: false, isTyposquatting: false, similarityScore: 100 },
    }],
    payment: { paymentRequested: false, severity: "LOW" },
    threat: { status: "NO_MATCH", matched: false, similarityScore: 0, reportCount: 0 },
  });
  assert.equal(result.status, "LOW RISK");
  assert.ok(result.score < 20);
});

test("a government notification not found is not evidence of fraud by itself", () => {
  const result = calculateEvidenceWeightedScamRisk({ governmentClaim: true, notificationMatchStatus: "NOT_FOUND" });
  assert.equal(result.score, 0);
  assert.equal(result.status, "LOW RISK");
});

test("the same suspicious URL from multiple sources is counted once", () => {
  const result = calculateEvidenceWeightedScamRisk({ governmentClaim: false, links: [typoLink, typoLink] });
  assert.equal(result.score, Math.round(95 * SCAM_RISK_WEIGHTS.domainAuthenticity / 100));
});

test("a personal payment with a recruitment payment request receives critical risk", () => {
  const result = calculateEvidenceWeightedScamRisk({
    governmentClaim: true,
    payment: { paymentRequested: true, severity: "CRITICAL", upiIds: ["person@paytm"], organizationMatch: "MISMATCH" },
  });
  assert.ok(result.score >= 90);
  assert.equal(result.status, "CRITICAL RISK");
});

test("no QR or no ThreatNet match does not add risk", () => {
  const baseline = calculateEvidenceWeightedScamRisk({ governmentClaim: false });
  const absentOptionalSignals = calculateEvidenceWeightedScamRisk({
    governmentClaim: false,
    payment: { paymentRequested: false },
    threat: { status: "NO_MATCH", matched: false, similarityScore: 0, reportCount: 0 },
  });
  assert.equal(absentOptionalSignals.score, baseline.score);
});

test("a private-company domain is not punished for its TLD alone", () => {
  const privateDomain = { ...typoLink, domainAnalysis: { ...typoLink.domainAnalysis, organizationDomainStatus: "UNKNOWN", domainStatus: "UNVERIFIED_DOMAIN", isLookalike: false, isTyposquatting: false, similarityScore: 0 } };
  const result = calculateEvidenceWeightedScamRisk({ governmentClaim: false, links: [privateDomain] });
  assert.equal(result.score, 0);
});

test("NCS not found and unavailable modules remain risk-neutral", () => {
  const result = calculateEvidenceWeightedScamRisk({
    governmentClaim: true,
    governmentVerification: { verificationStatus: "UNAVAILABLE" },
    notificationMatchStatus: "NOT_FOUND",
  });
  assert.equal(result.score, 0);
  assert.equal(result.status, "LOW RISK");
});

test("an actual NCS identifier contradiction requests review but is not an automatic scam verdict", () => {
  const result = calculateEvidenceWeightedScamRisk({
    governmentClaim: true,
    governmentVerification: { ncsReference: { status: "NO_MATCH", mismatchedFields: ["notificationNumber"] } },
    notificationMatchStatus: "CONTRADICTED",
  });
  assert.ok(result.score >= 20);
  assert.ok(result.score < 70);
  assert.equal(result.status, "REVIEW REQUIRED");
  assert.equal(result.criticalOverride, null);
});

test("an NCS-linked application URL mismatch requests review without an automatic high-risk verdict", () => {
  const result = calculateEvidenceWeightedScamRisk({
    governmentClaim: true,
    governmentVerification: { ncsReference: { status: "PARTIAL_MATCH", mismatchedFields: ["applicationUrl"] } },
    notificationMatchStatus: "UNKNOWN",
  });
  assert.ok(result.score >= 20);
  assert.ok(result.score < 70);
  assert.equal(result.status, "REVIEW REQUIRED");
  assert.equal(result.criticalOverride, null);
});

test("no URL and no QR are not missing coverage penalties", () => {
  const coverage = calculateEvidenceCoverage({
    documentUploaded: false, governmentClaim: false, registryAvailable: false, registryNotificationAvailable: false,
    urlProvided: false, linkAnalysisActive: false, textAvailable: true, paymentAnalysisActive: true,
    threatStatus: "NO_MATCH", sourceProvided: true,
  });
  assert.equal(coverage, 100);
});

test("unavailable official registry does not count as checked evidence", () => {
  const coverage = calculateEvidenceCoverage({
    documentUploaded: true, governmentClaim: true, registryAvailable: false, registryNotificationAvailable: false,
    urlProvided: true, linkAnalysisActive: true, textAvailable: true, paymentAnalysisActive: true,
    threatStatus: "NO_MATCH", sourceProvided: true,
  });
  assert.equal(coverage, 75);
});
