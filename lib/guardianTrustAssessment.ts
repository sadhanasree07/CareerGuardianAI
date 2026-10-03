export type MatchState = true | false | null;
export function buildGuardianTrustAssessment(input: {
  initialRisk: number; initialConfidence: number; initialSourceConfidence: number; initialCoverage: number; initialVerdict: string;
  websiteMatch: MatchState; emailMatch: MatchState; emailDomainMatch: MatchState; phoneMatch: MatchState; roleMatch: MatchState;
  hasIndependentWebsite: boolean; hasIndependentContact: boolean; hasRoleReference: boolean; hasOpportunityUrl: boolean;
  hasConfirmationSource: boolean; companyWebsiteReachable: boolean | null; opportunityUrlReachable: boolean | null;
}) {
  const conflicts: string[] = [];
  const supporting: string[] = [];
  const missing: string[] = [];
  const { websiteMatch, emailMatch, emailDomainMatch, phoneMatch, roleMatch } = input;
  if (websiteMatch === true) supporting.push("Claimed website hostname matches the user-supplied independently found reference hostname.");
  if (websiteMatch === false) conflicts.push("Claimed website hostname differs from the user-supplied independently found reference hostname.");
  if (emailMatch === true) supporting.push("Claimed recruiter email exactly matches the user-supplied independent reference email.");
  if (emailMatch === false) conflicts.push("Claimed recruiter email differs from the user-supplied independent reference email.");
  if (emailDomainMatch === true) supporting.push("Recruiter email domain matches the user-supplied reference website hostname.");
  if (emailDomainMatch === false) conflicts.push("Recruiter email domain differs from the user-supplied reference website hostname.");
  if (phoneMatch === true) supporting.push("Claimed phone number matches the user-supplied independent reference number.");
  if (phoneMatch === false) conflicts.push("Claimed phone number differs from the user-supplied independent reference number.");
  if (roleMatch === true) supporting.push("Role text exactly matches the user-supplied reference role.");
  if (roleMatch === false) conflicts.push("Role text differs from the user-supplied reference role.");
  if (!input.hasIndependentWebsite) missing.push("Independent company website not provided.");
  if (!input.hasIndependentContact) missing.push("Independent recruiter contact not provided.");
  if (!input.hasRoleReference && !input.hasOpportunityUrl) missing.push("Independent role reference or opportunity URL not provided.");
  if (!input.hasConfirmationSource) missing.push("No independent confirmation source was described.");

  const conflictRisk = Math.min(45, conflicts.length * 18);
  const riskScore = Math.max(input.initialRisk, Math.min(100, input.initialRisk + conflictRisk));
  const verdict = input.initialVerdict === "HIGH RISK" || riskScore >= 60 ? "HIGH RISK" : conflicts.length ? "REVIEW" : input.initialVerdict === "LOW RISK" && supporting.length >= 2 ? "LOW RISK" : "REVIEW";
  const verificationConfidence = Math.min(95, Math.max(input.initialConfidence, input.initialConfidence + Math.min(20, supporting.length * 5)));
  const trustScore = Math.round((100 - riskScore) * verificationConfidence / 100);
  const organizationStatus = websiteMatch === false || emailDomainMatch === false ? "CONFLICT" : input.companyWebsiteReachable && websiteMatch === true ? "PARTIALLY VERIFIED" : "NOT VERIFIED";
  const opportunityStatus = roleMatch === false || phoneMatch === false ? "CONFLICT" : roleMatch === true || emailMatch === true || phoneMatch === true ? "PARTIALLY VERIFIED" : "NOT VERIFIED";
  return {
    organizationStatus, opportunityStatus,
    claimedVsReference: {
      website: websiteMatch === null ? "NOT PROVIDED" : websiteMatch ? "MATCH" : "CONFLICT",
      recruiterEmail: emailMatch === null ? "NOT PROVIDED" : emailMatch ? "MATCH" : "CONFLICT",
      recruiterEmailDomain: emailDomainMatch === null ? "NOT PROVIDED" : emailDomainMatch ? "MATCH" : "CONFLICT",
      recruiterPhone: phoneMatch === null ? "NOT PROVIDED" : phoneMatch ? "MATCH" : "CONFLICT",
      jobTitle: roleMatch === null ? "NOT PROVIDED" : roleMatch ? "MATCH" : "CONFLICT",
    },
    checks: {
      companyWebsiteReachability: input.companyWebsiteReachable === null ? "NOT PROVIDED" : input.companyWebsiteReachable ? "REACHABLE" : "UNREACHABLE",
      opportunityUrlReachability: input.opportunityUrlReachable === null ? "NOT PROVIDED" : input.opportunityUrlReachable ? "REACHABLE" : "UNREACHABLE",
      companyIdentityRegistry: "NOT VERIFIED — no registry connector is configured",
      specificOpportunityPosting: "NOT VERIFIED — no independent job-posting search connector is configured",
      independentConfirmation: input.hasConfirmationSource ? "USER REPORTED — not independently contacted by CareerGuardian" : "NOT PROVIDED",
    },
    supportingEvidence: supporting, conflictingEvidence: conflicts, missingEvidence: missing,
    riskScore, verificationConfidence, sourceConfidence: input.initialSourceConfidence, evidenceCoverage: input.initialCoverage,
    trustScore, verdict,
    recommendedAction: verdict === "HIGH RISK"
      ? "Do not pay or share sensitive information. Resolve the conflicts through a contact sourced independently from the claimed recruiter."
      : conflicts.length
        ? "Pause before responding. Contact the organization using independently sourced details and ask it to confirm this exact opportunity."
        : "No authoritative company registry or posting match was available. Confirm the exact opportunity directly through a contact found independently.",
  };
}
