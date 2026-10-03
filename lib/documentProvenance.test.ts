import assert from "node:assert/strict";
import test from "node:test";
import { buildProvenanceAssessment, compareDocumentClaim, digitalSignatureStatus, extractDocumentFacts, maskPaymentIdentifier, qrProcessingMessage } from "./documentProvenance.ts";

const baseProvenance = {
  fileInfo: { name: "notice.pdf", mimeType: "application/pdf", sizeBytes: 100, sha256: "hash", modifiedAt: null },
  metadata: { status: "UNAVAILABLE" as const, createdAt: "", modifiedAt: "", author: "", creator: "", producer: "", title: "", subject: "", keywords: "", documentId: "", embeddedUrls: [], camera: "", software: "", gpsMetadataPresent: false },
  signature: { status: "NOT FOUND" as const, signer: "", certificateIssuer: "", signedAt: "", signerOrganizationMatch: "NOT VERIFIED" as const },
  facts: { organization: "", notificationNumber: "", recruitmentTitle: "", publicationDate: "", applicationOpeningDate: "", applicationClosingDate: "", applicationUrl: "" },
  qr: { status: "NOT_DETECTED" as const },
};

test("extracts notice identifiers, dates, title, and application URL", () => {
  assert.deepEqual(extractDocumentFacts("Notification No: ABC/2026\nPublication Date: 18/09/2026\nLast Date: 30/09/2026\nRecruitment for: Analyst\nhttps://example.gov.in/apply"), {
    organization: "", notificationNumber: "ABC/2026", recruitmentTitle: "Analyst", publicationDate: "18/09/2026", applicationOpeningDate: "", applicationClosingDate: "30/09/2026", applicationUrl: "https://example.gov.in/apply",
  });
});

test("missing document metadata remains unverified, not high risk", () => {
  const assessment = buildProvenanceAssessment({ provenance: baseProvenance, claimedOrganization: "Example Company", claimedNotificationNumber: "A-12" });
  assert.equal(assessment?.organization, "NOT VERIFIED");
  assert.equal(assessment?.evidenceStatus, "REVIEW REQUIRED");
  assert.equal(assessment?.officialSource, "NOT VERIFIED");
});

test("file metadata differences do not affect official publication matching", () => {
  const assessment = buildProvenanceAssessment({ provenance: baseProvenance, claimedOrganization: "", claimedNotificationNumber: "" });
  assert.equal(assessment?.publicationDate, "NOT VERIFIED");
  assert.match(assessment?.metadataCaveat || "", /metadata date difference alone is not evidence of fraud/i);
});

test("a personal payment mismatch becomes high risk only with payment evidence", () => {
  const assessment = buildProvenanceAssessment({
    provenance: { ...baseProvenance, qr: { status: "DECODED" } },
    claimedOrganization: "Indian Railways",
    claimedNotificationNumber: "",
    paymentFraudDetection: { paymentRequested: true, qrCodeMentioned: true, organizationMatch: "MISMATCH", verdict: "HIGH_RISK" },
  });
  assert.equal(assessment?.paymentIdentity, "MISMATCH");
  assert.equal(assessment?.evidenceStatus, "HIGH RISK");
});

test("payment provider identifiers are masked in display strings", () => {
  assert.equal(maskPaymentIdentifier("railwayfees123@paytm"), "ra••••••••••••@paytm");
});

test("organization comparison handles missing values without fabricating a match", () => {
  assert.equal(compareDocumentClaim("", "Indian Railways"), "NOT VERIFIED");
});

test("a private-company document is not classified as high risk without risk evidence", () => {
  const assessment = buildProvenanceAssessment({ provenance: baseProvenance, claimedOrganization: "Example Private Company", claimedNotificationNumber: "" });
  assert.equal(assessment?.officialSource, "NOT VERIFIED");
  assert.equal(assessment?.evidenceStatus, "REVIEW REQUIRED");
});

test("a screenshot with no metadata remains reviewable without a false scam verdict", () => {
  const assessment = buildProvenanceAssessment({ provenance: baseProvenance, claimedOrganization: "Organization", claimedNotificationNumber: "" });
  assert.equal(baseProvenance.metadata.status, "UNAVAILABLE");
  assert.notEqual(assessment?.evidenceStatus, "HIGH RISK");
});

test("PDF signature presence is reported as unable to verify, never as valid", () => {
  assert.equal(digitalSignatureStatus(true, true), "UNABLE TO VERIFY");
});

test("PDF without a signature reports not found", () => {
  assert.equal(digitalSignatureStatus(false, true), "NOT FOUND");
});

test("image signature verification is not checkable", () => {
  assert.equal(digitalSignatureStatus(false, false), "NOT CHECKABLE");
});

test("detected QR fallback explains that payment details could not be decoded", () => {
  assert.equal(qrProcessingMessage("UNAVAILABLE", "QR_DETECTED_BUT_NOT_DECODED"), "QR detected but payment information could not be decoded.");
  assert.equal(qrProcessingMessage("QR_DETECTED_BUT_NOT_DECODED"), "QR detected but payment information could not be decoded.");
});

test("no QR remains distinct from an unavailable scan", () => {
  assert.equal(qrProcessingMessage("NOT_DETECTED"), "No QR code detected.");
  assert.equal(qrProcessingMessage("UNAVAILABLE"), "QR scan unavailable; its presence could not be determined.");
});

test("unavailable official source does not become a scam verdict", () => {
  const assessment = buildProvenanceAssessment({
    provenance: baseProvenance,
    claimedOrganization: "Staff Selection Commission",
    claimedNotificationNumber: "Notice 22",
    governmentVerification: { verificationStatus: "UNAVAILABLE", domainValidation: { status: "UNKNOWN" }, recruitmentConsistency: { status: "UNKNOWN" } },
  });
  assert.equal(assessment?.officialSource, "NOT VERIFIED");
  assert.equal(assessment?.officialSourceMessage, "Official source could not be verified at this time.");
  assert.equal(assessment?.evidenceStatus, "REVIEW REQUIRED");
});

test("an exact Link Sentinel domain match is shown as official", () => {
  const assessment = buildProvenanceAssessment({
    provenance: baseProvenance,
    claimedOrganization: "Staff Selection Commission",
    claimedNotificationNumber: "",
    linkSentinel: { urlsAnalyzed: [{ domainAnalysis: { domainMatch: true } }] },
  });
  assert.equal(assessment?.applicationDomain, "OFFICIAL");
  assert.equal(assessment?.evidenceStatus, "REVIEW REQUIRED");
});

test("a heuristic registry miss stays unverified without an authoritative record", () => {
  const assessment = buildProvenanceAssessment({
    provenance: baseProvenance,
    claimedOrganization: "Staff Selection Commission",
    claimedNotificationNumber: "Notice 22",
    governmentVerification: { notificationMatch: { status: "NOT_FOUND" } },
  });
  assert.equal(assessment?.notificationNumber, "NOT VERIFIED");
  assert.equal(assessment?.evidenceStatus, "REVIEW REQUIRED");
});

test("a QR without an employment payment request is not critical by itself", () => {
  const assessment = buildProvenanceAssessment({
    provenance: { ...baseProvenance, qr: { status: "DECODED" } },
    claimedOrganization: "Example Company",
    claimedNotificationNumber: "",
    paymentFraudDetection: { paymentRequested: false, qrCodeMentioned: true, organizationMatch: "MISMATCH", verdict: "HIGH_RISK" },
  });
  assert.equal(assessment?.paymentIdentity, "MISMATCH");
  assert.equal(assessment?.evidenceStatus, "REVIEW REQUIRED");
});