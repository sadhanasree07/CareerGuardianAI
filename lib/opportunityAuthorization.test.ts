import assert from "node:assert/strict";
import test from "node:test";
import { evaluateOpportunityAuthorization, type TrustedOpportunityRecord } from "./opportunityAuthorization.ts";

const verifiedOrganization = {
  status: "MATCH",
  referenceStatus: "VERIFIED",
  claimedOrganization: "ABC Technologies",
  submittedUrl: "https://abc.com/jobs/abc-int-2026-042",
  finalUrl: "https://abc.com/jobs/abc-int-2026-042",
  domain: {
    status: "MATCH",
    referenceDomain: "abc.com",
    suspiciousPatterns: [],
  },
} as const;

function record(overrides: Partial<TrustedOpportunityRecord> = {}): TrustedOpportunityRecord {
  return {
    source: "INDEPENDENT_ORGANIZATION_SOURCE",
    sourceUrl: "https://independent-jobs.example.net/records/abc-int-2026-042",
    sourceIsIndependent: true,
    catalogComplete: false,
    organization: "ABC Technologies",
    domain: "abc.com",
    jobTitle: "Software Engineer Intern",
    jobId: "ABC-INT-2026-042",
    notificationId: null,
    recruiterName: "Jordan Lee",
    recruiterEmail: "jordan.lee@abc.com",
    recruiterPhone: "+1 555 010 0123",
    location: "Remote",
    applicationUrl: "https://abc.com/jobs/abc-int-2026-042",
    publishedDate: "2026-01-10",
    deadline: "2026-02-10",
    ...overrides,
  };
}

function payment(destinationType: string, organizationMatch = "UNVERIFIED") {
  return { paymentRequested: true, destinationType, organizationMatch };
}

test("same legitimate domain with personal UPI and unverified opportunity is high risk", () => {
  const result = evaluateOpportunityAuthorization({
    submission: {
      company: "ABC Technologies",
      website: "https://abc.com",
      jobRole: "Software Engineer Intern",
      jobId: "ABC-INT-2026-999",
      recruiterEmail: "unknown@gmail.com",
    },
    websiteAuthenticity: verifiedOrganization,
    payment: payment("PERSONAL_UPI"),
  });
  assert.equal(result.organizationVerified, true);
  assert.equal(result.jobIdStatus, "NOT_AVAILABLE");
  assert.equal(result.recruiterStatus, "NOT_VERIFIED");
  assert.equal(result.status, "HIGH_RISK");
});

test("same legitimate domain and unavailable job record stays review, not high risk", () => {
  const result = evaluateOpportunityAuthorization({
    submission: {
      company: "ABC Technologies",
      website: "https://abc.com",
      jobRole: "Software Engineer Intern",
      jobId: "ABC-INT-2026-999",
    },
    websiteAuthenticity: verifiedOrganization,
  });
  assert.equal(result.organizationVerified, true);
  assert.equal(result.opportunityAuthorized, false);
  assert.equal(result.jobIdStatus, "NOT_AVAILABLE");
  assert.equal(result.status, "REVIEW");
});

test("an ordinary unverified application fee is not itself a high-risk verdict", () => {
  const result = evaluateOpportunityAuthorization({
    submission: { company: "ABC Technologies", jobRole: "Software Engineer Intern", jobId: "ABC-INT-2026-999" },
    payment: payment("UNKNOWN"),
  });
  assert.equal(result.status, "REVIEW");
  assert.equal(result.strongContradiction, false);
});

test("opportunity is authorized only when independent record matches the identifying fields", () => {
  const result = evaluateOpportunityAuthorization({
    submission: {
      company: "ABC Technologies",
      website: "https://abc.com",
      jobRole: "Software Engineer Intern",
      jobId: "ABC-INT-2026-042",
      recruiterName: "Jordan Lee",
      recruiterEmail: "jordan.lee@abc.com",
      recruiterPhone: "+1 555 010 0123",
      location: "Remote",
      applicationUrl: "https://abc.com/jobs/abc-int-2026-042",
      publishedDate: "2026-01-10",
      deadline: "2026-02-10",
    },
    websiteAuthenticity: verifiedOrganization,
    trustedRecords: [record()],
  });
  assert.equal(result.status, "AUTHORIZED");
  assert.equal(result.opportunityAuthorized, true);
  assert.equal(result.recruiterStatus, "VERIFIED");
  assert.equal(result.evidence.applicationUrl.status, "MATCH");
});

test("a same-domain listing cannot serve as an independent authorization record", () => {
  const result = evaluateOpportunityAuthorization({
    submission: {
      company: "ABC Technologies",
      website: "https://abc.com",
      jobRole: "Software Engineer Intern",
      jobId: "ABC-INT-2026-042",
      applicationUrl: "https://abc.com/jobs/abc-int-2026-042",
    },
    trustedRecords: [record({ sourceUrl: "https://careers.abc.com/jobs/abc-int-2026-042" })],
  });
  assert.equal(result.status, "REVIEW");
  assert.equal(result.opportunityAuthorized, false);
  assert.equal(result.independentVerification, "INSUFFICIENT");
});

test("lookalike domain is high risk even when the company name is claimed", () => {
  const result = evaluateOpportunityAuthorization({
    submission: { company: "ABC Technologies", website: "https://abc-careers-india.com", jobRole: "Engineer" },
    websiteAuthenticity: {
      ...verifiedOrganization,
      status: "SUSPICIOUS",
      submittedUrl: "https://abc-careers-india.com",
      finalUrl: "https://abc-careers-india.com",
      domain: { status: "MISMATCH", referenceDomain: "abc.com", suspiciousPatterns: ["misleading_keyword"] },
    },
  });
  assert.equal(result.status, "HIGH_RISK");
});

test("government notification can be authorized by an independently verified registry record", () => {
  const result = evaluateOpportunityAuthorization({
    submission: {
      company: "Union Public Service Commission",
      website: "https://upsc.gov.in",
      applicationUrl: "https://upsc.gov.in/apply/12-2026",
      jobRole: "Civil Services Officer",
      notificationNumber: "UPSC/12/2026",
    },
    trustedRecords: [record({
      source: "OFFICIAL_RECRUITMENT_REGISTRY",
      sourceUrl: "https://verified-notifications.gov.in/upsc/12-2026",
      organization: "Union Public Service Commission",
      domain: "upsc.gov.in",
      jobTitle: "Civil Services Officer",
      jobId: null,
      notificationId: "UPSC/12/2026",
      recruiterName: null,
      recruiterEmail: null,
      recruiterPhone: null,
      applicationUrl: "https://upsc.gov.in/apply/12-2026",
    })],
  });
  assert.equal(result.status, "AUTHORIZED");
  assert.equal(result.notificationIdStatus, "MATCH");
});

test("notification absent from a complete independent catalog remains review, not high risk", () => {
  const result = evaluateOpportunityAuthorization({
    submission: {
      company: "Union Public Service Commission",
      website: "https://upsc.gov.in",
      jobRole: "Civil Services Officer",
      notificationNumber: "UPSC/999/2026",
    },
    trustedRecords: [record({
      source: "OFFICIAL_RECRUITMENT_REGISTRY",
      sourceUrl: "https://verified-notifications.gov.in/upsc/catalog",
      catalogComplete: true,
      organization: "Union Public Service Commission",
      domain: "upsc.gov.in",
      jobTitle: "Different notice",
      jobId: null,
      notificationId: "UPSC/12/2026",
      recruiterName: null,
      recruiterEmail: null,
      recruiterPhone: null,
      applicationUrl: null,
    })],
  });
  assert.equal(result.notificationIdStatus, "NOT_FOUND");
  assert.equal(result.status, "REVIEW");
});

test("recruiter mismatch against an independently matched opportunity is high risk", () => {
  const result = evaluateOpportunityAuthorization({
    submission: {
      company: "ABC Technologies",
      website: "https://abc.com",
      jobRole: "Software Engineer Intern",
      jobId: "ABC-INT-2026-042",
      recruiterEmail: "attacker@example.net",
      applicationUrl: "https://abc.com/jobs/abc-int-2026-042",
    },
    trustedRecords: [record()],
  });
  assert.equal(result.recruiterStatus, "MISMATCH");
  assert.equal(result.independentVerification, "CONFLICT");
  assert.equal(result.status, "HIGH_RISK");
});

test("missing identity fields do not create fraud evidence", () => {
  const result = evaluateOpportunityAuthorization({ submission: {} });
  assert.equal(result.status, "NOT_VERIFIED");
  assert.equal(result.strongContradiction, false);
  assert.equal(result.riskScore, 0);
  assert.ok(result.evidence.missingEvidence.length > 0);
});

test("conflicting independent records are exposed and not authorized", () => {
  const result = evaluateOpportunityAuthorization({
    submission: {
      company: "ABC Technologies",
      website: "https://abc.com",
      jobRole: "Software Engineer Intern",
      jobId: "ABC-INT-2026-042",
      applicationUrl: "https://abc.com/jobs/abc-int-2026-042",
    },
    trustedRecords: [
      record({ recruiterName: null, recruiterEmail: null, recruiterPhone: null }),
      record({ sourceUrl: "https://independent-jobs.example.org/records/abc-int-2026-042", jobTitle: "Sales Assistant", recruiterName: null, recruiterEmail: null, recruiterPhone: null }),
    ],
  });
  assert.equal(result.opportunityAuthorized, false);
  assert.equal(result.independentVerification, "CONFLICT");
  assert.equal(result.evidence.opportunityIdentity.jobTitle.status, "CONFLICT");
  assert.equal(result.status, "HIGH_RISK");
  assert.ok(result.evidence.contradictions.length > 0);
});
