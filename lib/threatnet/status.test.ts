import assert from "node:assert/strict";
import test from "node:test";
import { getThreatNetStatus } from "./status.ts";

test("ThreatNet distinguishes a configuration-disabled state", () => {
  assert.equal(getThreatNetStatus({ enabled: false, sufficientEvidence: true, serviceAvailable: true, matchedExistingCluster: false }), "NOT_ENABLED");
});

test("ThreatNet distinguishes insufficient text from a no-match analysis", () => {
  assert.equal(getThreatNetStatus({ enabled: true, sufficientEvidence: false, serviceAvailable: true, matchedExistingCluster: false }), "INSUFFICIENT_EVIDENCE");
  assert.equal(getThreatNetStatus({ enabled: true, sufficientEvidence: true, serviceAvailable: true, matchedExistingCluster: false }), "NO_MATCH");
});

test("ThreatNet reports service failure separately from a no-match", () => {
  assert.equal(getThreatNetStatus({ enabled: true, sufficientEvidence: true, serviceAvailable: false, matchedExistingCluster: false }), "UNAVAILABLE");
});

test("ThreatNet marks only an existing-cluster comparison as a match", () => {
  assert.equal(getThreatNetStatus({ enabled: true, sufficientEvidence: true, serviceAvailable: true, matchedExistingCluster: true }), "MATCH_FOUND");
});