import assert from "node:assert/strict";
import test from "node:test";
import { aggregateScamRisk } from "./risk.ts";

function link(overrides: Record<string, unknown> = {}) {
  return {
    isShortened: false,
    redirectChain: [],
    phishingSignals: [],
    domainAnalysis: {
      organizationDomainStatus: "VERIFIED" as "VERIFIED" | "MISMATCH" | "UNKNOWN",
      domainMatch: true,
      domainStatus: "OFFICIAL_MATCH",
      isLookalike: false,
      isTyposquatting: false,
      differenceType: [],
      similarityScore: 100,
      ...((overrides.domainAnalysis || {}) as Record<string, unknown>),
    },
    ...overrides,
  } as Parameters<typeof aggregateScamRisk>[1][number];
}

test("an exact official domain remains low risk", () => {
  assert.equal(aggregateScamRisk(0, [link()]), 0);
});

test("a highly similar manipulated lookalike domain is high risk", () => {
  const lookalike = link({
    domainAnalysis: {
      organizationDomainStatus: "MISMATCH",
      domainMatch: false,
      domainStatus: "TYPOSQUATTING_DETECTED",
      isLookalike: true,
      isTyposquatting: true,
      differenceType: ["hyphen_manipulation", "misleading_keyword"],
      similarityScore: 90,
    },
  });
  assert.ok(aggregateScamRisk(34, [lookalike]) >= 85);
});

test("an unrelated known-organization domain is not automatically 100 percent", () => {
  const unrelated = link({
    domainAnalysis: {
      organizationDomainStatus: "MISMATCH",
      domainMatch: false,
      domainStatus: "SUSPICIOUS_DOMAIN",
      isLookalike: false,
      isTyposquatting: false,
      differenceType: ["different_registrable_domain"],
      similarityScore: 20,
    },
  });
  const risk = aggregateScamRisk(0, [unrelated]);
  assert.ok(risk >= 20 && risk < 100);
});

test("a personal payment destination can raise risk to critical", () => {
  assert.equal(aggregateScamRisk(0, [link()], { personalPayment: true }), 90);
});

test("an unverified unknown domain is moderate, not a verdict of certainty", () => {
  const unknown = link({
    domainAnalysis: {
      organizationDomainStatus: "UNKNOWN",
      domainMatch: false,
      domainStatus: "UNKNOWN_ORGANIZATION",
      isLookalike: false,
      isTyposquatting: false,
      differenceType: [],
      similarityScore: 0,
    },
  });
  assert.equal(aggregateScamRisk(0, [unknown]), 30);
});