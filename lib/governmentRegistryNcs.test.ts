import assert from "node:assert/strict";
import test from "node:test";
import {
  generateNcsSearchQueries,
  isApprovedNcsUrl,
  matchNcsReferences,
  normalizeGovernmentOrganization,
  normalizeRecruitmentTitle,
  parseOfficialNcsPage,
  verifyNcsReference,
  type NcsOpportunityInput,
} from "./governmentRegistryNcs.ts";

const baseInput: NcsOpportunityInput = {
  governmentJobClaim: true,
  organization: "SSC",
  jobTitle: "SSC CGL",
  notificationNumber: "01/2026",
  advertisementNumber: "01/2026",
  jobId: "CGL-2026-01",
  recruitmentYear: "2026",
  location: "New Delhi",
  applicationStartDate: "01 Aug 2026",
  applicationEndDate: "20 Aug 2026",
  applicationUrl: "https://ssc.gov.in/apply/cgl-2026",
};

const exactReference = {
  organization: "Staff Selection Commission",
  department: "Department of Personnel and Training",
  jobTitle: "Combined Graduate Level",
  notificationNumber: "01/2026",
  advertisementNumber: "01/2026",
  jobId: "CGL-2026-01",
  recruitmentYear: "2026",
  location: "New Delhi",
  applicationStartDate: "01 Aug 2026",
  applicationEndDate: "20 Aug 2026",
  applicationUrl: "https://ssc.gov.in/apply/cgl-2026",
  eligibility: "Bachelor degree",
  salary: "Pay level 7",
  ncsReferenceUrl: "https://www.ncs.gov.in/job-listing?id=actual-reference-1",
};

function postingHtml(reference: Record<string, unknown>) {
  const posting = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: reference.jobTitle,
    hiringOrganization: { name: reference.organization },
    identifier: { value: reference.notificationNumber },
    jobId: reference.jobId,
    recruitmentYear: reference.recruitmentYear,
    location: reference.location,
    applicationStartDate: reference.applicationStartDate,
    applicationEndDate: reference.applicationEndDate,
    applicationUrl: reference.applicationUrl,
    department: reference.department,
    eligibility: reference.eligibility,
    salary: reference.salary,
  };
  return `<html><head><title>NCS listing</title></head><body><script type="application/ld+json">${JSON.stringify(posting)}</script></body></html>`;
}

function fetcherFor(listingResponse: (url: URL) => Response | Promise<Response>) {
  const requested: string[] = [];
  const fetcher: typeof fetch = async (input) => {
    const url = new URL(String(input));
    requested.push(url.toString());
    if (url.pathname === "/robots.txt") return new Response("User-agent: *\nAllow: /job-listing", { headers: { "content-type": "text/plain" } });
    return listingResponse(url);
  };
  return { fetcher, requested };
}

test("normalizes known organization aliases and safe title acronyms without conflating CGL and CHSL", () => {
  assert.equal(normalizeGovernmentOrganization("SSC"), "STAFF SELECTION COMMISSION");
  assert.equal(normalizeGovernmentOrganization("Staff Selection Commission"), "STAFF SELECTION COMMISSION");
  assert.equal(normalizeRecruitmentTitle("CGL"), normalizeRecruitmentTitle("Combined Graduate Level"));
  assert.notEqual(normalizeRecruitmentTitle("SSC CGL"), normalizeRecruitmentTitle("SSC CHSL"));
});

test("generates exact identifiers first, followed by organization and role combinations", () => {
  const queries = generateNcsSearchQueries(baseInput);
  assert.equal(queries[0], "01/2026");
  assert.ok(queries.includes("SSC 01/2026"));
  assert.ok(queries.includes("SSC SSC CGL"));
  assert.ok(queries.includes("SSC CGL SSC 2026"));
});

test("accepts only HTTPS official NCS URLs and rejects user-controlled hosts/ports", () => {
  assert.equal(isApprovedNcsUrl("https://www.ncs.gov.in/job-listing"), true);
  assert.equal(isApprovedNcsUrl("https://ncs.gov.in/job-listing"), true);
  assert.equal(isApprovedNcsUrl("http://www.ncs.gov.in/job-listing"), false);
  assert.equal(isApprovedNcsUrl("https://www.ncs.gov.in.evil.example/job-listing"), false);
  assert.equal(isApprovedNcsUrl("https://127.0.0.1/job-listing"), false);
  assert.equal(isApprovedNcsUrl("https://www.ncs.gov.in:8443/job-listing"), false);
});

test("parses only structured JobPosting data from an official NCS page", () => {
  const parsed = parseOfficialNcsPage(postingHtml(exactReference), "https://www.ncs.gov.in/job-listing?search=SSC");
  assert.equal(parsed.machineReadable, true);
  assert.equal(parsed.queryScoped, true);
  assert.equal(parsed.records.length, 1);
  assert.equal(parsed.records[0].organization, "Staff Selection Commission");
  assert.equal(parsed.records[0].notificationNumber, "01/2026");
  assert.equal(parseOfficialNcsPage(postingHtml(exactReference), "https://example.com/job-listing").records.length, 0);
});

test("exact organization, title, and notification match produces traceable PASS evidence", () => {
  const result = matchNcsReferences(baseInput, [exactReference], exactReference.ncsReferenceUrl, false, "2026-10-03T00:00:00.000Z");
  assert.equal(result.status, "EXACT_MATCH");
  assert.ok(result.matchedFields.includes("organization"));
  assert.ok(result.matchedFields.includes("notificationNumber"));
  assert.ok(result.evidence.every((item) => item.source === "NCS" && item.independent && item.sourceUrl === exactReference.ncsReferenceUrl));
  assert.equal(result.officialSourceUrl, exactReference.applicationUrl);
});

test("organization, title, and multiple supporting fields produce STRONG_MATCH without an identifier", () => {
  const input = { ...baseInput, notificationNumber: "", advertisementNumber: "", jobId: "", recruitmentYear: "" };
  const reference = { ...exactReference, notificationNumber: "", advertisementNumber: "", jobId: "" };
  const result = matchNcsReferences(input, [reference], reference.ncsReferenceUrl, false, "2026-10-03T00:00:00.000Z");
  assert.equal(result.status, "STRONG_MATCH");
  assert.ok(result.matchedFields.includes("location"));
});

test("a partial reference is not promoted to an exact match", () => {
  const input = { ...baseInput, notificationNumber: "", advertisementNumber: "", jobId: "", location: "", recruitmentYear: "", applicationStartDate: "", applicationEndDate: "", applicationUrl: "" };
  const reference = { ...exactReference, notificationNumber: "", advertisementNumber: "", jobId: "", location: "", recruitmentYear: "", applicationStartDate: "", applicationEndDate: "", applicationUrl: "" };
  const result = matchNcsReferences(input, [reference], reference.ncsReferenceUrl, false, "2026-10-03T00:00:00.000Z");
  assert.equal(result.status, "PARTIAL_MATCH");
});

test("a similar title with a different organization and notification is NO_MATCH, not genuine", () => {
  const reference = { ...exactReference, organization: "Union Public Service Commission", notificationNumber: "99/2026", advertisementNumber: "99/2026" };
  const result = matchNcsReferences(baseInput, [reference], reference.ncsReferenceUrl, true, "2026-10-03T00:00:00.000Z");
  assert.equal(result.status, "NO_MATCH");
  assert.ok(result.mismatchedFields.includes("organization"));
  assert.ok(result.mismatchedFields.includes("notificationNumber"));
});

test("query-scoped structured results with no relevant reference return NOT_FOUND", () => {
  const result = matchNcsReferences(baseInput, [], "https://www.ncs.gov.in/job-listing?search=SSC", true, "2026-10-03T00:00:00.000Z");
  assert.equal(result.status, "NOT_FOUND");
  assert.equal(result.ncsReferenceUrl, "https://www.ncs.gov.in/job-listing?search=SSC");
  assert.equal(result.officialSourceUrl, null);
  assert.equal(result.confidence, 0);
});

test("a broad public listing without query-scoped results returns UNAVAILABLE, not NOT_FOUND", () => {
  const result = matchNcsReferences(baseInput, [], "https://www.ncs.gov.in/job-listing?isGovernmentJob=true", false, "2026-10-03T00:00:00.000Z");
  assert.equal(result.status, "UNAVAILABLE");
  assert.equal(result.ncsReferenceUrl, null);
});

test("explicit application URL disagreement is field-level evidence and never replaces the submitted URL", () => {
  const reference = { ...exactReference, applicationUrl: "https://ssc.gov.in/apply/official" };
  const result = matchNcsReferences(baseInput, [reference], reference.ncsReferenceUrl, false, "2026-10-03T00:00:00.000Z");
  assert.ok(result.mismatchedFields.includes("applicationUrl"));
  assert.equal(result.officialSourceUrl, reference.applicationUrl);
  assert.equal(result.ncsReferenceUrl, reference.ncsReferenceUrl);
});

test("private-sector opportunities are NOT_APPLICABLE and cause no NCS request", async () => {
  const { fetcher, requested } = fetcherFor(() => new Response("", { status: 500 }));
  const result = await verifyNcsReference({ ...baseInput, governmentJobClaim: false }, { fetcher, useCache: false });
  assert.equal(result.status, "NOT_APPLICABLE");
  assert.deepEqual(requested, []);
});

test("HTML shell, malformed content, and robots restrictions return UNAVAILABLE without fake results", async () => {
  const shell = fetcherFor(() => new Response("<html><body>Angular shell</body></html>", { headers: { "content-type": "text/html" } }));
  const shellResult = await verifyNcsReference(baseInput, { fetcher: shell.fetcher, useCache: false, minRequestIntervalMs: 0 });
  assert.equal(shellResult.status, "UNAVAILABLE");
  assert.equal(shellResult.ncsReferenceUrl, null);

  const blocked: typeof fetch = async (input) => new URL(String(input)).pathname === "/robots.txt"
    ? new Response("User-agent: *\nDisallow: /job-listing", { headers: { "content-type": "text/plain" } })
    : new Response(postingHtml(exactReference), { headers: { "content-type": "text/html" } });
  const blockedResult = await verifyNcsReference(baseInput, { fetcher: blocked, useCache: false, minRequestIntervalMs: 0 });
  assert.equal(blockedResult.status, "UNAVAILABLE");
});

test("official NCS 403 and 429 responses are unavailable", async () => {
  for (const status of [403, 429]) {
    const fetcher = fetcherFor((url) => url.pathname === "/job-listing" ? new Response("", { status }) : new Response("User-agent: *\nAllow: /job-listing", { headers: { "content-type": "text/plain" } }));
    const result = await verifyNcsReference({ ...baseInput, jobId: `status-${status}` }, { fetcher: fetcher.fetcher, useCache: false, minRequestIntervalMs: 0 });
    assert.equal(result.status, "UNAVAILABLE");
  }
});

test("timeouts are converted into UNAVAILABLE and do not escape the verifier", async () => {
  const fetcher: typeof fetch = async () => { const error = new Error("timeout"); error.name = "TimeoutError"; throw error; };
  const result = await verifyNcsReference({ ...baseInput, jobId: "timeout-case" }, { fetcher, useCache: false, minRequestIntervalMs: 0 });
  assert.equal(result.status, "UNAVAILABLE");
  assert.match(result.reason || "", /timed out/i);
});

test("unsafe NCS base URL configuration is rejected before any network request", async () => {
  const oldValue = process.env.NCS_BASE_URL;
  process.env.NCS_BASE_URL = "http://127.0.0.1:8080";
  let called = false;
  const fetcher: typeof fetch = async () => { called = true; return new Response("", { status: 200 }); };
  try {
    const result = await verifyNcsReference({ ...baseInput, jobId: "ssrf-case" }, { fetcher, useCache: false });
    assert.equal(result.status, "UNAVAILABLE");
    assert.equal(called, false);
  } finally {
    if (oldValue === undefined) delete process.env.NCS_BASE_URL;
    else process.env.NCS_BASE_URL = oldValue;
  }
});

test("concurrent duplicate checks share one official NCS request sequence", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async (input) => {
    calls += 1;
    const url = new URL(String(input));
    if (url.pathname === "/robots.txt") return new Response("User-agent: *\nAllow: /job-listing", { headers: { "content-type": "text/plain" } });
    return new Response(postingHtml(exactReference), { headers: { "content-type": "text/html" } });
  };
  const input = { ...baseInput, jobId: "dedupe-case" };
  const html = postingHtml({ ...exactReference, jobId: "dedupe-case" });
  const dedupeFetcher: typeof fetch = async (request) => {
    calls += 1;
    const url = new URL(String(request));
    return url.pathname === "/robots.txt"
      ? new Response("User-agent: *\nAllow: /job-listing", { headers: { "content-type": "text/plain" } })
      : new Response(html, { headers: { "content-type": "text/html" } });
  };
  const [first, second] = await Promise.all([
    verifyNcsReference(input, { fetcher: dedupeFetcher, useCache: false, minRequestIntervalMs: 0 }),
    verifyNcsReference(input, { fetcher: dedupeFetcher, useCache: false, minRequestIntervalMs: 0 }),
  ]);
  assert.equal(first.status, "EXACT_MATCH");
  assert.equal(second.status, "EXACT_MATCH");
  assert.equal(calls, 2);
});

test("an unavailable reference is briefly cached in-process to avoid repeated NCS requests", async () => {
  const jobId = `unavailable-cooldown-${Date.now()}`;
  let calls = 0;
  const fetcher: typeof fetch = async () => {
    calls += 1;
    return new Response("<html><body>Public app shell</body></html>", { headers: { "content-type": "text/html" } });
  };
  const input = { ...baseInput, jobId };
  const first = await verifyNcsReference(input, { fetcher, minRequestIntervalMs: 0 });
  const second = await verifyNcsReference(input, { fetcher, minRequestIntervalMs: 0 });
  assert.equal(first.status, "UNAVAILABLE");
  assert.equal(second.status, "UNAVAILABLE");
  assert.equal(calls, 1);
});

test("a structured NCS match is cached and reused when MongoDB cache storage is unavailable", async () => {
  const input = { ...baseInput, jobId: `successful-cache-${Date.now()}` };
  const html = postingHtml({ ...exactReference, jobId: input.jobId });
  let calls = 0;
  const fetcher: typeof fetch = async (request) => {
    calls += 1;
    const url = new URL(String(request));
    return url.pathname === "/robots.txt"
      ? new Response("User-agent: *\nAllow: /job-listing", { headers: { "content-type": "text/plain" } })
      : new Response(html, { headers: { "content-type": "text/html" } });
  };
  const first = await verifyNcsReference(input, { fetcher, minRequestIntervalMs: 0 });
  const second = await verifyNcsReference(input, { fetcher, minRequestIntervalMs: 0 });
  assert.equal(first.status, "EXACT_MATCH");
  assert.equal(second.status, "EXACT_MATCH");
  assert.equal(calls, 2);
});