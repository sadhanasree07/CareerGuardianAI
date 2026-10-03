import assert from "node:assert/strict";
import test from "node:test";
import { compareDomains, fetchPublicPageSafely } from "./linkSentinel/index.ts";
import { inspectWebsiteAuthenticity } from "./websiteAuthenticity.ts";

test("website authenticity is not applicable when no URL was submitted", async () => {
  const result = await inspectWebsiteAuthenticity({ claimedOrganization: "Infosys" });
  assert.equal(result.status, "NOT_APPLICABLE");
  assert.equal(result.infrastructureRelationship, "UNKNOWN");
  assert.equal(result.evidenceCoverage.observed, 0);
  assert.equal(result.redFlags.length, 0);
});

test("safe website fetch blocks private IPv4 destinations", async () => {
  await assert.rejects(
    fetchPublicPageSafely("http://127.0.0.1/"),
    /Private IP blocked/,
  );
});

test("safe website fetch blocks private IPv6 destinations", async () => {
  await assert.rejects(
    fetchPublicPageSafely("http://[::1]/"),
    /Private IP blocked/,
  );
});

test("safe website fetch does not probe arbitrary remote ports", async () => {
  await assert.rejects(
    fetchPublicPageSafely("https://example.com:8443/"),
    /Non-standard ports are not allowed/,
  );
});

test("URL parser does not treat an organization name inside another root domain as a match", async () => {
  const submittedHost = new URL("https://infosys-careers-india.com").hostname;
  const comparison = compareDomains(submittedHost, "Infosys");
  assert.equal(comparison.rootDomain, "infosys-careers-india.com");
  assert.equal(comparison.domainMatch, false);
  assert.equal(comparison.isLookalike, true);
});
