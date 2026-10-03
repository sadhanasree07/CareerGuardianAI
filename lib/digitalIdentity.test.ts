import assert from "node:assert/strict";
import test from "node:test";
import { buildDigitalIdentityAssessment } from "./digitalIdentity.ts";
import type { NcsReferenceResult } from "./governmentRegistryNcs.ts";

const strongBase = {
  website: "https://ssc.gov.in",
  company: "SSC",
  sourceType: "company_website",
  jobRole: "Combined Graduate Level",
  notificationNumber: "01/2026",
  sourceConfidence: 80,
};

function reference(status: NcsReferenceResult["status"], extra: Partial<NcsReferenceResult> = {}): NcsReferenceResult {
  return {
    source: "NCS",
    status,
    governmentJobClaim: true,
    organization: "Staff Selection Commission",
    jobTitle: "Combined Graduate Level",
    notificationNumber: "01/2026",
    matchedFields: [],
    mismatchedFields: [],
    unavailableFields: [],
    ncsReferenceUrl: status === "UNAVAILABLE" ? null : "https://www.ncs.gov.in/job-listing?id=actual-ref",
    officialSourceUrl: null,
    evidence: [],
    confidence: status === "EXACT_MATCH" ? 98 : 0,
    checkedAt: "2026-10-03T00:00:00.000Z",
    searchQueries: ["01/2026", "SSC Combined Graduate Level"],
    ...extra,
  };
}

test("an NCS exact reference is exposed as an independent opportunity authorization source", () => {
  const result = buildDigitalIdentityAssessment({
    ...strongBase,
    governmentReference: reference("EXACT_MATCH", {
      matchedFields: ["organization", "jobTitle", "notificationNumber"],
      evidence: [{
        layer: "GOVERNMENT_REFERENCE", source: "NCS", signal: "NOTIFICATION_NUMBER_MATCH",
        observedValue: "01/2026", referenceValue: "01/2026", status: "PASS",
        sourceUrl: "https://www.ncs.gov.in/job-listing?id=actual-ref", timestamp: "2026-10-03T00:00:00.000Z", independent: true, confidence: 98,
      }],
    }),
  });
  assert.equal(result.opportunityAuthorization.status, "PARTIALLY_VERIFIED");
  assert.deepEqual(result.opportunityAuthorization.matchedSources, ["NCS"]);
  assert.equal(result.referenceUrl, "https://www.ncs.gov.in/job-listing?id=actual-ref");
  assert.ok(result.evidence.some((item) => item.signal === "ncs_notification_number_match" && item.independent));
});

test("NCS UNAVAILABLE does not invalidate strong domain evidence", () => {
  const result = buildDigitalIdentityAssessment({ ...strongBase, governmentReference: reference("UNAVAILABLE") });
  assert.equal(result.finalStatus, "PASS");
  assert.ok(result.unavailableSignals.some((signal) => /NCS reference access was unavailable/i.test(signal)));
});

test("NCS NOT_FOUND requests review but is not classified as high risk", () => {
  const result = buildDigitalIdentityAssessment({ ...strongBase, governmentReference: reference("NOT_FOUND") });
  assert.equal(result.finalStatus, "REVIEW");
  assert.ok(result.unavailableSignals.some((signal) => /absence alone is not evidence of fraud/i.test(signal)));
});

test("a stated application fee alone is not treated as a personal payment mismatch", () => {
  const result = buildDigitalIdentityAssessment({ ...strongBase, applicationFee: "₹500", paymentRequested: false });
  assert.equal(result.paymentIdentity.requested, false);
  assert.equal(result.paymentIdentity.relationshipToOrganization, "UNKNOWN");
  assert.equal(result.finalStatus, "PASS");
});

test("an identified personal payment destination remains high risk", () => {
  const result = buildDigitalIdentityAssessment({ ...strongBase, paymentRequested: true, upi: "person@paytm", personalPaymentRisk: true });
  assert.equal(result.finalStatus, "HIGH_RISK");
  assert.equal(result.paymentIdentity.relationshipToOrganization, "MISMATCH");
});

test("an accessible NCS identity contradiction requests review, not an automatic scam verdict", () => {
  const result = buildDigitalIdentityAssessment({
    ...strongBase,
    governmentReference: reference("NO_MATCH", { mismatchedFields: ["notificationNumber"] }),
  });
  assert.equal(result.opportunityAuthorization.status, "CONTRADICTED");
  assert.equal(result.finalStatus, "REVIEW");
});