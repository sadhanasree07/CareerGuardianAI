export type PayGuardSeverity = "LOW" | "REVIEW" | "HIGH" | "CRITICAL";

export interface PayGuardResult {
  organizationName: string;
  governmentRecruitmentClaim: boolean;
  payeeMatchesOrganization: boolean;
  paymentRequest: boolean;
  paymentPurpose: string[];
  amount: string[];
  upiIds: Array<{ value: string; classification: "PERSONAL_OR_UNKNOWN" | "OFFICIAL_CONTEXT"; confidence: number }>;
  bankAccounts: Array<{ masked: string; ifsc?: string; beneficiary?: string }>;
  ifscCodes: string[];
  paymentChannel: { type: "OFFICIAL_PORTAL" | "UPI" | "BANK_TRANSFER" | "QR" | "UNKNOWN"; officialEvidence: boolean; status: "SUPPORTED" | "UNVERIFIED" | "NONE" };
  qr: { detected: boolean; status: "DECODED" | "QR_DETECTED_BUT_NOT_DECODED" | "NOT_DETECTED" | "UNAVAILABLE" };
  qrEvidence: { upiId?: string; payeeName?: string; amount?: string; currency?: string; transactionReference?: string; paymentUrl?: string };
  severity: PayGuardSeverity;
  riskContribution: number;
  verificationStatus: string;
  criticalRedFlags: string[];
  positiveSignals: string[];
  safetyAdvisory: string | null;
}

export interface PaymentFraudDetection {
  paymentRequested: boolean;
  amount: string | null;
  paymentReason: string | null;
  upiIds: string[];
  bankAccounts: string[];
  ifscCodes: string[];
  qrCodeMentioned: boolean;
  qrStatus: "DECODED" | "QR_DETECTED_BUT_NOT_DECODED" | "NOT_DETECTED" | "UNAVAILABLE";
  qrPayload: string | null;
  qrPayeeName: string | null;
  qrAmount: string | null;
  qrCurrency: string | null;
  qrTransactionReference: string | null;
  paymentUrl: string | null;
  governmentRecruitmentClaim: boolean;
  paymentContext: "NONE" | "OFFICIAL_PORTAL" | "RECRUITMENT_PAYMENT" | "PERSONAL_PAYMENT" | "UNKNOWN";
  destinationType: "GOVERNMENT_DOMAIN" | "MERCHANT" | "PERSONAL_UPI" | "PERSONAL_BANK" | "UNKNOWN" | "NONE";
  destinationVerification: "GOVERNMENT_DOMAIN_MATCH" | "UNVERIFIED" | "NOT_APPLICABLE";
  claimedOrganization: string | null;
  payeeName: string | null;
  organizationMatch: "MATCH" | "MISMATCH" | "UNVERIFIED" | "NOT_APPLICABLE";
  verificationStatus: string;
  riskScore: number;
  verdict: "SAFE" | "REVIEW" | "HIGH_RISK";
  redFlags: string[];
  explanation: string;
  recommendation: string;
}

const PURPOSE = /(?:registration|application|security\s+deposit|refundable\s+deposit|interview(?:\s+slot)?|document\s+verification|background\s+verification|medical\s+examination|training|processing|onboarding|laptop|equipment|uniform|\bID\s+card|gate\s+pass|joining|placement|certificate\s+verification|courier|dispatch|account\s+activation)\s+(?:fee|deposit|charge|payment|cost)|(?:fee|deposit|charge)\s+(?:for\s+)?(?:registration|application|interview|training|onboarding|joining|placement|document|background|medical|laptop|equipment|verification)|(?:confirm|secure|guarantee|reserve)\s+(?:your\s+)?(?:selection|job|interview|interview\s+slot|joining)|pay\s+(?:₹|rs\.?\s*)?\d|transfer\s+(?:the\s+)?amount|send\s+(?:the\s+)?payment\s+screenshot|scan\s+this\s+QR|pay\s+before\s+(?:joining|the\s+interview)/i;
const JOB = /\b(job|recruit(?:ment|er|ing)|interview|selection|joining|onboarding|offer letter|internship|placement|vacancy|candidate|applicant|hiring)\b/i;
const JOB_PROMISE = /(?:pay|payment|transfer|send|deposit).{0,90}(?:secure|confirm|guarantee|reserve|release|activate|obtain).{0,50}(?:job|selection|interview|offer|joining|employee)|(?:secure|confirm|guarantee|reserve).{0,45}(?:job|selection|interview|offer|joining)/i;
const NO_FEE = /\b(?:no|without|zero|free of)\s+(?:(?:any|a)\s+)?(?:application|registration|processing|interview|training|security)?\s*fee\b|\bno payment required\b/i;
const OFFICIAL_PORTAL = /(?:official|government|govt|company|corporate)\s+(?:recruitment\s+)?(?:application\s+)?portal|(?:apply|payment|application)\s+(?:at|through|via)\s+(?:the\s+)?official\s+(?:website|portal)|bharatkosh/i;
const AMOUNT = /(?:₹|INR\s*|Rs\.?\s*)\s*\d[\d,]*(?:\.\d{1,2})?/gi;
const UPI = /\b[a-z0-9][a-z0-9._-]{1,80}@[a-z][a-z0-9.-]{1,30}\b/gi;
const IFSC = /\b[A-Z]{4}0[A-Z0-9]{6}\b/gi;
const ACCOUNT_CONTEXT = /\b(?:account|a\/c|beneficiar(?:y|ies)|NEFT|IMPS|RTGS|bank transfer|transfer to)\b/i;
const ACCOUNT_NUMBER = /\b(?:\d[ -]?){9,18}\b/g;
const QR_URI = /upi:\/\/pay\?[^\s"'<>]+/i;

function maskAccount(value: string) {
  const digits = value.replace(/\D/g, "");
  return `XXXXXX${digits.slice(-4)}`;
}

export function analyzePayGuard(input: Record<string, unknown>): PayGuardResult {
  const pieces = [input.rawText, input.description, input.applicationFee, input.transcript, input.cleanTranscript, input.text]
    .filter((value): value is string => typeof value === "string");
  if (typeof input.sourceUrl === "string") pieces.push(input.sourceUrl);
  const decodedPayloads = Array.isArray(input.decodedQrPayloads) ? input.decodedQrPayloads.filter((value): value is string => typeof value === "string").slice(0, 10) : [];
  pieces.push(...decodedPayloads);
  const text = pieces.join("\n").slice(0, 120000);
  const hasJob = JOB.test(text) || Boolean(input.jobRole) || Boolean(input.company);
  const hasPayment = PURPOSE.test(text) && !/\bno\s+(?:(?:application|registration|processing|interview|training|security)\s+)?(?:payment|fee)\s+(?:is\s+)?required\b|\bno payment is required\b/i.test(text) && !NO_FEE.test(text) && !/bank details?.{0,50}(?:salary|payroll)\s+(?:processing|credit)/i.test(text);
  const upiIds = [...new Set(text.match(UPI) || [])].map((value) => ({
    value,
    classification: "PERSONAL_OR_UNKNOWN" as const,
    confidence: 55,
  }));
  const ifscs = [...new Set(text.match(IFSC) || [])];
  const accountNumbers = ACCOUNT_CONTEXT.test(text) ? [...new Set(text.match(ACCOUNT_NUMBER) || [])]
    .filter((value) => value.replace(/\D/g, "").length >= 9 && value.replace(/\D/g, "").length <= 18) : [];
  const accounts = accountNumbers.map((value) => {
    const near = text.slice(Math.max(0, text.indexOf(value) - 100), text.indexOf(value) + value.length + 100);
    const beneficiary = near.match(/(?:beneficiar(?:y|ies)|account\s+holder|payee)\s*(?:name)?\s*[:=-]\s*([A-Za-z][A-Za-z .'-]{1,50})/i)?.[1]?.trim();
    return { masked: maskAccount(value), ...(ifscs[0] ? { ifsc: ifscs[0] } : {}), ...(beneficiary ? { beneficiary } : {}) };
  });
  const uri = [...decodedPayloads, ...(text.match(new RegExp(QR_URI.source, "gi")) || [])].find((value) => /^upi:\/\/pay\?/i.test(value));
  const qrMention = decodedPayloads.length > 0 || /\b(?:QR\s*(?:code)?|scan\s+(?:this|the)\s+(?:code|QR))\b/i.test(text);
  let qrParams: URLSearchParams | null = null;
  try { if (uri) qrParams = new URL(uri).searchParams; } catch { qrParams = null; }
  const decodedUpi = qrParams?.get("pa") || null;
  const decodedPayee = qrParams?.get("pn") || undefined;
  const decodedAmount = qrParams?.get("am") || undefined;
  const decodedCurrency = qrParams?.get("cu") || undefined;
  const decodedTransactionReference = qrParams?.get("tr") || undefined;
  const decodedUrl = decodedPayloads.find((value) => /^https?:\/\//i.test(value)) || qrParams?.get("url") || undefined;
  const allUpi = [...new Set([...upiIds.map((id) => id.value), ...(decodedUpi ? [decodedUpi] : [])])];
  const purposeLabels = [...new Set((text.match(/registration fee|application fee|security deposit|refundable deposit|interview (?:fee|slot)|document verification fee|background verification fee|medical examination fee|training fee|processing fee|onboarding fee|laptop fee|equipment fee|uniform fee|ID card fee|gate pass fee|joining fee|placement fee|certificate verification fee|courier fee|dispatch fee|account activation fee/gi) || []).map((item) => item.toLowerCase()))];
  const officialContext = OFFICIAL_PORTAL.test(text) || (typeof input.sourceUrl === "string" && /^https:\/\/(?:[a-z0-9-]+\.)*(?:gov\.in|nic\.in)(?:\/|$)/i.test(input.sourceUrl));
  const claimedOrganization = [input.company, input.organization, input.department].find((value): value is string => typeof value === "string" && Boolean(value.trim())) || "";
  const organizationWords = claimedOrganization.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length >= 5 && !/^(government|govt|recruitment|department|ministry|official|india|state|central|public|authority|service|services|commission|organization|organisation|board)$/.test(word));
  const organizationMatchesPayee = Boolean(organizationWords.length && decodedPayee && organizationWords.some((word) => decodedPayee.toLowerCase().includes(word)));
  const governmentClaim = /\b(?:government|govt\.?|public\s+service|civil\s+service|state\s+department|central\s+department|ministry|public\s+sector|government\s+recruitment)\b/i.test(`${claimedOrganization} ${text}`);
  const payeeMismatch = Boolean(claimedOrganization && decodedPayee && !organizationMatchesPayee);
  const suspiciousDestination = allUpi.length > 0 || accounts.length > 0 || qrMention;
  const governmentPersonalPayment = governmentClaim && hasPayment && Boolean(decodedUpi || accounts.length) && (payeeMismatch || /personal\s+(?:account|upi)|individual\s+(?:account|upi)|personal\s+bank/i.test(text));
  const criticalJobPayment = hasJob && hasPayment && JOB_PROMISE.test(text) && suspiciousDestination && (!governmentClaim || governmentPersonalPayment);
  const explicitScamDemand = hasJob && hasPayment && !officialContext && (!governmentClaim || governmentPersonalPayment) && /(?:refundable\s+)?security\s+deposit|pay.{0,60}(?:confirm|secure|guarantee).{0,40}(?:job|selection|interview)/i.test(text);
  const legitimateFee = hasPayment && officialContext && !criticalJobPayment && !explicitScamDemand;
  const urgent = /pay (?:immediately|today|within \d+ hours)|urgent.{0,35}payment|payment.{0,35}deadline|before (?:midnight|\d{1,2}\s*(?:am|pm))/i.test(text);
  const criticalRedFlags = [
    ...(criticalJobPayment ? ["Recruitment payment requested to secure a job/interview through a personal or unverified destination."] : []),
    ...(governmentPersonalPayment ? ["Government recruitment payment is directed to an organization-mismatched or explicitly personal destination."] : []),
    ...(explicitScamDemand ? ["Recruitment selection or interview linked to a security deposit/payment."] : []),
    ...(urgent && hasPayment ? ["Payment deadline or urgency pressure accompanies the recruitment demand."] : []),
  ];
  const severity: PayGuardSeverity = criticalJobPayment || explicitScamDemand || governmentPersonalPayment ? "CRITICAL" : hasPayment && !legitimateFee && suspiciousDestination ? "HIGH" : hasPayment ? "REVIEW" : "LOW";
  const riskContribution = severity === "CRITICAL" ? 75 : severity === "HIGH" ? 45 : severity === "REVIEW" ? 15 : 0;
  const channelType: PayGuardResult["paymentChannel"]["type"] = decodedUpi || upiIds.length ? "UPI" : accounts.length ? "BANK_TRANSFER" : qrMention ? "QR" : officialContext ? "OFFICIAL_PORTAL" : "UNKNOWN";
  return {
    organizationName: claimedOrganization,
    governmentRecruitmentClaim: governmentClaim,
    payeeMatchesOrganization: organizationMatchesPayee,
    paymentRequest: hasPayment,
    paymentPurpose: purposeLabels,
    amount: [...new Set(text.match(AMOUNT) || [])].slice(0, 8),
    upiIds,
    bankAccounts: accounts,
    ifscCodes: ifscs,
    paymentChannel: { type: channelType, officialEvidence: officialContext, status: hasPayment && officialContext ? "SUPPORTED" : hasPayment ? "UNVERIFIED" : "NONE" },
    qr: { detected: Boolean(uri || qrMention || input.qrScanStatus === "QR_DETECTED_BUT_NOT_DECODED"), status: decodedPayloads.length || uri ? "DECODED" : qrMention || input.qrScanStatus === "QR_DETECTED_BUT_NOT_DECODED" ? "QR_DETECTED_BUT_NOT_DECODED" : input.qrScanStatus === "UNAVAILABLE" ? "UNAVAILABLE" : "NOT_DETECTED" },
    qrEvidence: { ...(decodedUpi ? { upiId: decodedUpi } : {}), ...(decodedPayee ? { payeeName: decodedPayee } : {}), ...(decodedAmount ? { amount: decodedAmount } : {}), ...(decodedCurrency ? { currency: decodedCurrency } : {}), ...(decodedTransactionReference ? { transactionReference: decodedTransactionReference } : {}), ...(decodedUrl ? { paymentUrl: decodedUrl } : {}) },
    severity,
    riskContribution,
    verificationStatus: !text ? "UNKNOWN" : !hasPayment ? "NO_PAYMENT_DETECTED" : legitimateFee ? "OFFICIAL_CHANNEL_CONTEXT_REVIEW" : severity === "REVIEW" ? "REVIEW" : "FINANCIAL_RISK_DETECTED",
    criticalRedFlags,
    positiveSignals: [...(legitimateFee ? ["Fee wording is linked to an identified official application portal; verify that portal independently."] : []), ...(decodedUpi && !hasPayment ? ["UPI QR payload detected without a recruitment payment demand."] : [])],
    safetyAdvisory: severity === "HIGH" || severity === "CRITICAL" ? "Do not transfer money until the payment request is independently verified through the organization's official recruitment channel." : null,
  };
}

export function toPaymentFraudDetection(result: PayGuardResult): PaymentFraudDetection {
  const paymentContext: PaymentFraudDetection["paymentContext"] = !result.paymentRequest
    ? "NONE"
    : result.severity === "CRITICAL" || result.severity === "HIGH"
      ? "RECRUITMENT_PAYMENT"
      : result.paymentChannel.officialEvidence ? "OFFICIAL_PORTAL" : result.severity === "REVIEW" ? "RECRUITMENT_PAYMENT" : "UNKNOWN";
  const destinationType: PaymentFraudDetection["destinationType"] = !result.paymentRequest && !result.upiIds.length && !result.bankAccounts.length && !result.qr.detected
    ? "NONE"
    : "UNKNOWN";
  const upiFromQr = result.qrEvidence.upiId;
  const payeeName = result.qrEvidence.payeeName || null;
  const claimedOrganization = typeof result.organizationName === "string" && result.organizationName ? result.organizationName : null;
  const organizationWords = claimedOrganization?.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length >= 5 && !/^(government|govt|recruitment|department|ministry|official|india|state|central|public|authority|service|services|commission|organization|organisation|board)$/.test(word)) || [];
  const organizationMatch: PaymentFraudDetection["organizationMatch"] = !result.paymentRequest ? "NOT_APPLICABLE" : !claimedOrganization || !payeeName || !organizationWords.length ? "UNVERIFIED" : organizationWords.some((word) => payeeName.toLowerCase().includes(word)) ? "MATCH" : "MISMATCH";
  const paymentUrlHost = result.qrEvidence.paymentUrl ? (() => { try { return new URL(result.qrEvidence.paymentUrl).hostname; } catch { return ""; } })() : "";
  const governmentDomainMatch = /(?:^|\.)(?:gov\.in|nic\.in)$/.test(paymentUrlHost);
  const destinationVerification: PaymentFraudDetection["destinationVerification"] = governmentDomainMatch ? "GOVERNMENT_DOMAIN_MATCH" : result.paymentRequest || result.upiIds.length || result.bankAccounts.length || result.qr.detected ? "UNVERIFIED" : "NOT_APPLICABLE";
  const finalDestinationType: PaymentFraudDetection["destinationType"] = governmentDomainMatch ? "GOVERNMENT_DOMAIN" : destinationType;
  const verdict: PaymentFraudDetection["verdict"] = result.severity === "HIGH" || result.severity === "CRITICAL" ? "HIGH_RISK" : result.severity === "REVIEW" ? "REVIEW" : "SAFE";
  const redFlags = [...result.criticalRedFlags];
  if (result.paymentRequest && result.upiIds.length && !redFlags.length) redFlags.push("Recruitment payment request includes a UPI destination whose beneficiary is not independently verified.");
  const explanation = !result.paymentRequest
    ? result.qr.detected ? "A QR reference was detected, but no recruitment payment request was found." : "No recruitment-related payment request was detected in the submitted content."
    : result.paymentChannel.officialEvidence && verdict !== "HIGH_RISK"
      ? "A recruitment-related fee appears connected to an official portal context. Independently confirm the portal before paying."
      : verdict === "HIGH_RISK"
        ? "The content links a recruitment payment to a personal or unverified destination, or conditions selection/interview/joining on payment."
        : "A possible recruitment payment was detected, but its purpose or destination needs independent verification.";
  const recommendation = verdict === "HIGH_RISK"
    ? result.safetyAdvisory || "Do not pay. Verify the opportunity using contact details obtained independently."
    : verdict === "REVIEW"
      ? "Verify the payment purpose and destination using an independently sourced official recruitment channel before paying."
      : "No payment fraud action is indicated by this content. Independently verify any payment portal before submitting a fee.";
  return {
    paymentRequested: result.paymentRequest,
    amount: result.amount[0] || (result.qrEvidence.amount ? `₹${result.qrEvidence.amount}` : null),
    paymentReason: result.paymentPurpose[0] || null,
    upiIds: [...new Set([...result.upiIds.map((item) => item.value), ...(upiFromQr ? [upiFromQr] : [])])],
    bankAccounts: result.bankAccounts.map((item) => item.masked),
    ifscCodes: result.ifscCodes,
    qrCodeMentioned: result.qr.detected,
    qrStatus: result.qr.status,
    qrPayload: result.qrEvidence.upiId || null,
    qrPayeeName: result.qrEvidence.payeeName || null,
    qrAmount: result.qrEvidence.amount || null,
    qrCurrency: result.qrEvidence.currency || null,
    qrTransactionReference: result.qrEvidence.transactionReference || null,
    paymentUrl: result.qrEvidence.paymentUrl || null,
    paymentContext,
    destinationType: finalDestinationType,
    destinationVerification,
    governmentRecruitmentClaim: result.governmentRecruitmentClaim,
    claimedOrganization,
    payeeName,
    organizationMatch,
    verificationStatus: result.verificationStatus,
    riskScore: result.riskContribution,
    verdict,
    redFlags,
    explanation,
    recommendation,
  };
}
