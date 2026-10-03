export type ThreatNetStatus = "NOT_ENABLED" | "ACTIVE_ANALYZING" | "MATCH_FOUND" | "NO_MATCH" | "INSUFFICIENT_EVIDENCE" | "UNAVAILABLE";

export function getThreatNetStatus(input: {
  enabled: boolean;
  sufficientEvidence: boolean;
  serviceAvailable: boolean;
  matchedExistingCluster: boolean;
}): ThreatNetStatus {
  if (!input.enabled) return "NOT_ENABLED";
  if (!input.sufficientEvidence) return "INSUFFICIENT_EVIDENCE";
  if (!input.serviceAvailable) return "UNAVAILABLE";
  return input.matchedExistingCluster ? "MATCH_FOUND" : "NO_MATCH";
}