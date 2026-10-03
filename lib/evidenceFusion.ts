export type EvidenceState = "PASS" | "REVIEW" | "NOT_VERIFIED" | "NOT_PROVIDED" | "NOT_APPLICABLE" | "HIGH_RISK" | "NOT_DETECTED";
export type RecruitmentSource = "company_website" | "company_email" | "college_placement_cell" | "hod_faculty" | "college_whatsapp_group" | "linkedin" | "job_portal" | "recruiter_directly" | "employee_referral" | "friend_known_contact" | "call_recording" | "video_recording" | "other" | "unknown";
export interface EvidenceItem {
  id: string;
  category: string;
  state: EvidenceState;
  weight: number;
  explanation: string;
  source: string;
}
type Input = Record<string, unknown> & { sourceType?: RecruitmentSource | string };
import { analyzePayGuard, type PayGuardResult } from "@/lib/payguard";
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const present = (value: unknown) => text(value).length > 0;

export const EVIDENCE_SCORING = {
  risk: { base: 0, payment: 55, credential: 75, domainMismatch: 38, urgency: 8, highRiskVerdict: 60 },
  confidence: { coverageWeight: 0.55, independentSignal: 12, sourceReported: 8, lowRiskMinimum: 65, lowRiskSupportMinimum: 3 },
  sourceConfidence: { unknown: 20, reported: 42, institutional: 56, corroboration: 12 },
};

export function fuseRecruitmentEvidence(
  input: Input,
  domain: { passed: boolean; message: string },
  email: { passed: boolean; message: string },
  payGuard: PayGuardResult = analyzePayGuard(input),
) {
  const sourceType = (text(input.sourceType) || "unknown") as RecruitmentSource;
  const labels: Record<string, string> = {
    company_website:"Company Website", company_email:"Company Email", college_placement_cell:"College Placement Cell",
    hod_faculty:"HOD / Faculty", college_whatsapp_group:"College WhatsApp Group", linkedin:"LinkedIn",
    job_portal:"Job Portal", recruiter_directly:"Recruiter Direct", employee_referral:"Employee Referral",
    friend_known_contact:"Friend / Known Contact", call_recording:"Recruitment Call Recording", video_recording:"Recruitment Video Recording", other:"Other", unknown:"Not provided",
  };
  const source = labels[sourceType] || labels.unknown;
  const recordingInput = sourceType === "call_recording" || sourceType === "video_recording";
  const opportunitySourceProvided = sourceType !== "unknown" && !recordingInput;
  const isOpportunityUrl = text(input.inputType) === "url";
  const institutional = ["college_placement_cell", "hod_faculty", "college_whatsapp_group"].includes(sourceType);
  const company = text(input.company), website = text(input.website), emailValue = text(input.email);
  const phone = text(input.phone), role = text(input.jobRole), salary = text(input.salary), education = text(input.education);
  const content = [text(input.rawText), text(input.description), text(input.applicationFee), text(input.additionalEvidenceText)].join(" ").toLowerCase();
  const paymentContent = content.replace(/(?:no|without|zero|free of)\s+(?:(?:any|a)\s+)?(?:application|registration|processing|interview|training|security deposit)?\s*fee(?:\s+(?:of\s+)?(?:₹|rs\.?\s*)?\d[\d,]*)?|no payment required/gi, "");
  const recordingSignals = input.recordingRiskSignals && typeof input.recordingRiskSignals === "object" ? input.recordingRiskSignals as Record<string, unknown> : {};
  const paymentRequest = payGuard.paymentRequest || recordingSignals.paymentRequest === true;
  const credentialTerms = ["otp", "upi pin", "cvv", "bank login", "password", "account pin", "debit card pin"];
  const credentialRequest = credentialTerms.filter((term) => {
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+");
    const requested = new RegExp(`(?:share|send|provide|reveal|give|enter|tell|reply with|submit|required)[^\\n]{0,45}\\b${escapedTerm}\\b|\\b${escapedTerm}\\b[^\\n]{0,45}(?:share|send|provide|reveal|give|enter|tell|reply with|submit|required)`, "i").test(content);
    const negated = new RegExp(`(?:never|do not|don't|dont|not|without|avoid)\\s+(?:(?:share|send|provide|reveal|give|enter|tell)\\s+)?(?:your\\s+)?${escapedTerm}`, "i").test(content);
    return requested && !negated;
  });
  if (recordingSignals.credentialRequest === true) credentialRequest.push("recording-derived credential request");
  const urgency = /pay immediately|respond immediately|within (one|1|two|2) hours|act now|limited time/.test(content) || recordingSignals.urgency === true;
  const feeContradiction = !!text(input.additionalEvidenceText) && /\bno\s+(?:registration|application|training|interview)?\s*fee\b|\bwithout\s+(?:any\s+)?fee\b/i.test(text(input.additionalEvidenceText)) && recordingSignals.paymentRequest === true;
  const mismatch = !!website && !!emailValue && !email.passed && !/(gmail|yahoo|outlook|hotmail)\./i.test(emailValue);
  const evidence: EvidenceItem[] = [];
  const addEvidence = (id: string, category: string, state: EvidenceState, weight: number, explanation: string, source = "submitted content") => evidence.push({ id, category, state, weight, explanation, source });
  const layers: Array<{layer:number;title:string;passed:boolean;score:number;message:string;state:EvidenceState}> = [];
  const addLayer = (layer:number,title:string,state:EvidenceState,message:string) => layers.push({layer,title,state,passed:state === "PASS",score:state === "PASS" ? 1 : 0,message});

  addEvidence("organization", "identity", company ? "REVIEW" : "NOT_PROVIDED", 0, company ? `Organization identified: ${company}; identity not independently matched.` : "Organization was not identified.");
  addEvidence("source", "provenance", opportunitySourceProvided ? "REVIEW" : "NOT_PROVIDED", 0, opportunitySourceProvided ? `Opportunity source reported as ${source}; this is context, not independent confirmation.` : recordingInput ? "Recording is the submitted evidence format; how the opportunity was received remains unknown." : "Opportunity source was not provided.");
  addEvidence("website", "organization", website ? domain.passed ? "PASS" : "REVIEW" : "NOT_PROVIDED", 0, website ? domain.message : "Public organization website not provided.");
  addEvidence("recruiter", "contact", emailValue || phone ? email.passed ? "PASS" : "REVIEW" : "NOT_PROVIDED", 0, emailValue ? email.message : phone ? "Phone was provided but is not independently confirmed." : "Recruiter email and phone were not provided.");
  addEvidence("domain-correlation", "identity", mismatch ? "HIGH_RISK" : website && emailValue ? email.passed ? "PASS" : "REVIEW" : "NOT_VERIFIED", mismatch ? EVIDENCE_SCORING.risk.domainMismatch : 0, mismatch ? "Recruiter email domain conflicts with the supplied organization website." : website && emailValue ? email.message : "Domain correlation cannot be assessed without both values.");
  addEvidence("role", "opportunity", role ? "REVIEW" : "NOT_PROVIDED", 0, role ? "Job role was extracted; role details have not been independently confirmed." : "Job role was not provided.");
  addEvidence("salary", "opportunity", salary ? "REVIEW" : "NOT_PROVIDED", 0, salary ? "Salary details were supplied but not independently confirmed." : "Salary was not provided.");
  const financialCritical = payGuard.severity === "CRITICAL";
  addEvidence("payment", "financial", financialCritical || payGuard.severity === "HIGH" ? "HIGH_RISK" : payGuard.severity === "REVIEW" ? "REVIEW" : content ? "NOT_DETECTED" : "NOT_VERIFIED", payGuard.riskContribution, paymentRequest ? `PayGuard ${payGuard.severity.toLowerCase()} financial risk: ${payGuard.verificationStatus}.` : content ? "No recruitment payment demand detected in the submitted text." : "Payment risk could not be assessed without message text.");
  if (payGuard.upiIds.length || payGuard.bankAccounts.length || payGuard.qr.detected) addEvidence("payment-destination", "financial-destination", "REVIEW", 0, `Payment destination evidence: ${payGuard.upiIds.length} UPI ID(s), ${payGuard.bankAccounts.length} contextual bank account(s), QR ${payGuard.qr.status}. Destination alone does not establish fraud.`);
  addEvidence("credentials", "personal-data", credentialRequest.length ? "HIGH_RISK" : content ? "NOT_DETECTED" : "NOT_VERIFIED", credentialRequest.length ? EVIDENCE_SCORING.risk.credential : 0, credentialRequest.length ? `Sensitive credential request detected: ${credentialRequest.join(", ")}.` : content ? "No OTP, PIN, CVV, password or bank-login request detected." : "Credential risk could not be assessed without message text.");
  addEvidence("urgency", "communication", urgency ? "REVIEW" : content ? "PASS" : "NOT_VERIFIED", urgency ? EVIDENCE_SCORING.risk.urgency : 0, urgency ? "Urgent pressure wording detected." : content ? "No strong urgency wording detected." : "Communication patterns could not be assessed.");
  addEvidence("confirmation", "independent-confirmation", institutional ? "REVIEW" : "NOT_PROVIDED", 0, institutional ? `Reported ${source} source should be independently confirmed through a known institutional channel.` : "Independent confirmation was not provided.");
  if (feeContradiction) addEvidence("cross-source-fee-conflict", "contradiction", "REVIEW", 20, "Previously analyzed opportunity details state that no fee is required, while this recording transcript contains a payment request.", "previous opportunity + timestamped recording");
  const repeatedEvidence = Array.isArray(input.repeatedEvidence) ? input.repeatedEvidence : [];
  if (repeatedEvidence.length) addEvidence("recording-repetition", "supporting-evidence", "PASS", 0, `Important statement repeated ${repeatedEvidence.length} time(s); repetition supports transcript context but does not multiply risk.`, "timestamped recording transcript");

  const positiveSignals: string[] = [];
  const negativeSignals: string[] = [];
  const missingSignals: string[] = [];
  if (company) positiveSignals.push("Organization name identified; independent identity confirmation is still needed.");
  if (role) positiveSignals.push("Opportunity role provided.");
  if (opportunitySourceProvided) positiveSignals.push(`Source reported as ${source}.`);
  if (domain.passed) positiveSignals.push(isOpportunityUrl ? "The supplied job URL is reachable; the posting itself was not independently confirmed." : "Supplied organization website is reachable.");
  if (emailValue && email.passed) positiveSignals.push("Recruiter email domain correlates with the organization or a recognized institutional domain.");
  if (content && !paymentRequest) positiveSignals.push("No recruitment payment demand detected in the submitted content.");
  if (content && !credentialRequest.length) positiveSignals.push("No sensitive credential request detected in the submitted content.");
  if (repeatedEvidence.length) positiveSignals.push("A relevant statement was repeated in timestamped transcript segments; repetition supports transcript context but does not add risk by itself.");
  if (paymentRequest) negativeSignals.push("Recruitment payment demand detected.");
  if (credentialRequest.length) negativeSignals.push(`Sensitive credential request: ${credentialRequest.join(", ")}.`);
  if (mismatch) negativeSignals.push("Recruiter email domain conflicts with the supplied organization website.");
  if (urgency) negativeSignals.push("Urgent pressure wording detected.");
  if (feeContradiction) negativeSignals.push("Contradictory evidence: previous opportunity details say no fee is required, while the recording transcript contains a payment request.");
  if (!website) missingSignals.push("Organization website not provided.");
  if (!emailValue) missingSignals.push("Recruiter email not provided.");
  if (!phone) missingSignals.push("Recruiter phone not provided.");
  if (!salary) missingSignals.push("Salary information not provided.");
  if (!role) missingSignals.push("Job role not provided.");
  if (!opportunitySourceProvided) missingSignals.push("Opportunity source not provided.");
  if (!website && company) missingSignals.push("Public job listing could not be independently matched because no company URL was supplied.");

  const coverageFields = [company, role, website, emailValue, phone, salary, education, opportunitySourceProvided ? sourceType : ""];
  const availableFields = coverageFields.filter(Boolean).length;
  const evidenceCoverage = Math.round(availableFields / coverageFields.length * 100);
  const positiveIndependent = [domain.passed && !isOpportunityUrl, emailValue && email.passed].filter(Boolean).length;
  const negativeRisk = evidence
    .filter((item) => (item.state === "HIGH_RISK" || item.state === "REVIEW") && item.weight > 0)
    .filter((item) => item.id !== "payment")
    .reduce((total, item) => total + item.weight, 0);
  const riskScore = Math.max(0, Math.min(100, negativeRisk + payGuard.riskContribution));
  const repeatSupport = repeatedEvidence.length ? Math.min(6, repeatedEvidence.length * 3) : 0;
  const verificationConfidence = Math.max(5, Math.min(95, Math.round(evidenceCoverage * EVIDENCE_SCORING.confidence.coverageWeight + positiveIndependent * EVIDENCE_SCORING.confidence.independentSignal + repeatSupport)));
  let sourceConfidence = !opportunitySourceProvided ? EVIDENCE_SCORING.sourceConfidence.unknown : institutional ? EVIDENCE_SCORING.sourceConfidence.institutional : EVIDENCE_SCORING.sourceConfidence.reported;
  if (emailValue && email.passed) sourceConfidence += EVIDENCE_SCORING.sourceConfidence.corroboration;
  if (mismatch) sourceConfidence -= 18;
  sourceConfidence = Math.max(10, Math.min(90, sourceConfidence));
  const materialRisk = financialCritical || payGuard.severity === "HIGH" || credentialRequest.length > 0 || mismatch || riskScore >= EVIDENCE_SCORING.risk.highRiskVerdict;
  const sufficientSupport = positiveIndependent + Number(opportunitySourceProvided) + Number(Boolean(company) && Boolean(role)) >= EVIDENCE_SCORING.confidence.lowRiskSupportMinimum;
  const unresolvedReview = urgency || (website && emailValue && !email.passed);
  const verdict = materialRisk ? "HIGH RISK" : unresolvedReview || verificationConfidence < EVIDENCE_SCORING.confidence.lowRiskMinimum || !sufficientSupport ? "REVIEW" : "LOW RISK";
  const recommendedAction = materialRisk
    ? "Do not pay or share sensitive information. Verify through an independently sourced official contact."
    : institutional
      ? "Confirm the opportunity through the college placement cell or faculty using a known channel, then contact the company through independently found details."
      : "Confirm the recruiter and opportunity through contact details found independently.";

  const stateFor = (id: string) => evidence.find((item) => item.id === id)?.state ?? "NOT_VERIFIED";
  addLayer(1,"Document / OCR Integrity",present(input.rawText)||present(input.description)?"PASS":"NOT_VERIFIED",present(input.inputMethod)?`Input method: ${text(input.inputMethod)}.`:"Input source was not recorded.");
  addLayer(2,"Organization Identity",company?"REVIEW":"NOT_PROVIDED",company?`Organization identified as ${company}; independent identity match not established.`:"Organization name not provided.");
  addLayer(3,"Organization Public Presence",website?(domain.passed?(isOpportunityUrl?"REVIEW":"PASS"):"REVIEW"):company?"NOT_VERIFIED":"NOT_PROVIDED",website?(isOpportunityUrl&&domain.passed?"Job URL is reachable, but this check did not independently confirm the specific posting.":domain.message):"Could not independently match a public job listing without a company website.");
  addLayer(4,"Recruitment Source Provenance",!opportunitySourceProvided?"NOT_PROVIDED":"REVIEW",!opportunitySourceProvided?"Recruitment source is not known from the recording format alone.":`Source reported as ${source}; confirm independently.`);
  addLayer(5,"Recruiter Identity / Contact",emailValue||phone?(email.passed?"PASS":"REVIEW"):"NOT_PROVIDED",emailValue?email.message:phone?"Phone provided but not independently confirmed.":"Recruiter contact not provided.");
  addLayer(6,"Website & Domain Correlation",stateFor("domain-correlation"),evidence.find((item)=>item.id==="domain-correlation")?.explanation||"");
  addLayer(7,"Opportunity / Job Consistency",company&&role?"REVIEW":company||role?"NOT_VERIFIED":"NOT_PROVIDED",company&&role?"Organization and role supplied; independent consistency check remains incomplete.":"Opportunity details are incomplete.");
  addLayer(8,"Communication Pattern Analysis",urgency?"REVIEW":content?"PASS":"NOT_VERIFIED",urgency?"Urgent pressure wording detected.":content?"No strong urgency wording detected.":"Message content unavailable.");
  addLayer(9,"Financial / Payment Risk",financialCritical||payGuard.severity==="HIGH"?"HIGH_RISK":payGuard.severity==="REVIEW"?"REVIEW":content?"NOT_DETECTED":"NOT_VERIFIED",paymentRequest?`PayGuard ${payGuard.severity.toLowerCase()} financial assessment. ${payGuard.paymentChannel.type} channel; QR ${payGuard.qr.status}.`:content?"No recruitment payment demand detected.":"Message content unavailable.");
  addLayer(10,"Credential / Personal-Data Risk",credentialRequest.length?"HIGH_RISK":content?"NOT_DETECTED":"NOT_VERIFIED",credentialRequest.length?`Sensitive request: ${credentialRequest.join(", ")}.`:content?"No sensitive credential request detected.":"Message content unavailable.");
  addLayer(11,"Independent / Institutional Confirmation",institutional?"REVIEW":"NOT_PROVIDED",institutional?`Confirm through a known ${source} contact.`:"No independent confirmation supplied.");
  addLayer(12,"AI Evidence-Fusion Assessment",verdict==="HIGH RISK"?"HIGH_RISK":verdict==="LOW RISK"?"PASS":"REVIEW",`Risk ${riskScore}%; verification confidence ${verificationConfidence}%; evidence coverage ${evidenceCoverage}%.`);
  const trustScore = Math.round((100 - riskScore) * verificationConfidence / 100);
  layers[11].score = trustScore;
  layers[11].passed = verdict === "LOW RISK";
  return {
    sourceType, sourceLabel: source, riskScore, verificationConfidence, sourceConfidence, evidenceCoverage, payGuard,
    trustScore, verdict, layers, evidence, positiveSignals, negativeSignals, missingSignals, recommendedAction,
    independentConfirmation: { status: "UNAVAILABLE", channel: institutional ? "institutional" : "company" },
  };
}
