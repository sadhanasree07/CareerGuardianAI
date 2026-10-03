import test from "node:test";
import assert from "node:assert/strict";

import { assessGovernmentRegistryCrossCheck, classifyGovernmentRecruitmentClaim, extractGovernmentRecruitmentFacts } from "./lib/governmentRegistry.ts";

test("government registry marks suspicious gov claim on fake .com domain as suspicious", () => {
  const text = "Government recruitment notice for SSC CGL 2026. Apply at ssc-recruitment.co.in. Advt No. 03/2026/SSC. Payment by personal UPI 9876543210@upi.";
  const result = assessGovernmentRegistryCrossCheck({
    rawText: text,
    website: "https://ssc-recruitment.co.in",
    company: "SSC",
    notificationNumber: "03/2026/SSC",
    description: text,
    applicationFee: "₹500",
  });

  assert.equal(result.isGovernmentJobClaim, true);
  assert.equal(result.domainValidation.status, "FAIL");
  assert.equal(result.paymentSafety.status, "PERSONAL_OR_SUSPICIOUS");
  assert.ok(result.redFlags.length > 0);
});

test("extracts government recruitment information from official-looking content", () => {
  const facts = extractGovernmentRecruitmentFacts({
    rawText: "UPSC Recruitment 2026 Notification No. 12/UPSC. Apply from 01 Aug 2026 to 20 Aug 2026 at https://upsc.gov.in",
    company: "UPSC",
    description: "UPSC Recruitment 2026 Notification No. 12/UPSC",
  });

  assert.equal(facts.claimedOrganization, "UPSC");
  assert.equal(facts.notificationNumber, "12/UPSC");
  assert.equal(facts.recruitmentYear, "2026");
  assert.equal(facts.sourceUrl, "https://upsc.gov.in");
});

test("classifies explicit government claims but does not infer government from generic national/commission wording", () => {
  assert.equal(classifyGovernmentRecruitmentClaim({ company: "SSC", jobRole: "CGL", rawText: "SSC Government recruitment notice" }), "GOVERNMENT");
  assert.equal(classifyGovernmentRecruitmentClaim({ company: "National Career Commission", jobRole: "Career Advisor", rawText: "National Career Commission is recruiting" }), "UNKNOWN");
  assert.equal(classifyGovernmentRecruitmentClaim({ company: "National Career Service", jobRole: "Career Advisor", rawText: "National Career Service role" }), "UNKNOWN");
  assert.equal(classifyGovernmentRecruitmentClaim({ company: "Acme Private Limited", jobRole: "Analyst", rawText: "Private company hiring" }), "PRIVATE");
  assert.equal(classifyGovernmentRecruitmentClaim({ company: "Oil India", jobRole: "Engineer", rawText: "PSU recruitment" }), "PSU_GOVERNMENT_LINKED");
});

test("NCS NOT_FOUND remains unverified rather than suspicious or genuine", () => {
  const result = assessGovernmentRegistryCrossCheck(
    { company: "SSC", jobRole: "CGL", notificationNumber: "01/2026", rawText: "Government of India recruitment notice" },
    {
      source: "NCS", status: "NOT_FOUND", governmentJobClaim: true, organization: "SSC", jobTitle: "CGL", notificationNumber: "01/2026",
      matchedFields: [], mismatchedFields: [], unavailableFields: [], ncsReferenceUrl: "https://www.ncs.gov.in/job-listing?search=01", officialSourceUrl: null,
      evidence: [], confidence: 0, checkedAt: "2026-10-03T00:00:00.000Z", searchQueries: ["01/2026"],
    },
  );

  assert.equal(result.isGovernmentJobClaim, true);
  assert.equal(result.ncsReference.status, "NOT_FOUND");
  assert.equal(result.verificationStatus, "NOT_FOUND");
  assert.equal(result.paymentSafety.status, "SAFE");
});

test("NCS unavailable does not create a red flag and a stated fee is not automatically personal payment", () => {
  const result = assessGovernmentRegistryCrossCheck(
    { company: "Staff Selection Commission", jobRole: "CGL", website: "https://ssc.gov.in", rawText: "Government recruitment. Application fee ₹500." , applicationFee: "₹500" },
    {
      source: "NCS", status: "UNAVAILABLE", governmentJobClaim: true, organization: "Staff Selection Commission", jobTitle: "CGL", notificationNumber: null,
      matchedFields: [], mismatchedFields: [], unavailableFields: ["notificationNumber"], ncsReferenceUrl: null, officialSourceUrl: null,
      evidence: [], confidence: 0, checkedAt: "2026-10-03T00:00:00.000Z", reason: "Public listing was not machine-readable.", searchQueries: ["Staff Selection Commission CGL"],
    },
  );

  assert.equal(result.verificationStatus, "UNAVAILABLE");
  assert.equal(result.paymentSafety.status, "UNKNOWN");
  assert.ok(!result.redFlags.some((flag) => /personal UPI|personal bank/i.test(flag)));
});
