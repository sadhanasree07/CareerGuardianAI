"use client";

import { maskPaymentIdentifier } from "@/lib/documentProvenance";

type PaymentFraudDetection = {
  paymentRequested?: boolean;
  amount?: string | null;
  paymentReason?: string | null;
  upiIds?: string[];
  bankAccounts?: string[];
  ifscCodes?: string[];
  qrCodeMentioned?: boolean;
  qrStatus?: string;
  qrPayload?: string | null;
  qrPayeeName?: string | null;
  qrAmount?: string | null;
  qrCurrency?: string | null;
  qrTransactionReference?: string | null;
  paymentUrl?: string | null;
  payeeName?: string | null;
  claimedOrganization?: string | null;
  organizationMatch?: string;
  destinationVerification?: string;
  governmentRecruitmentClaim?: boolean;
  verificationStatus?: string;
  paymentContext?: string;
  destinationType?: string;
  riskScore?: number;
  verdict?: "SAFE" | "REVIEW" | "HIGH_RISK" | string;
  redFlags?: string[];
  explanation?: string;
  recommendation?: string;
};

function display(value: unknown, fallback = "Unknown") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function safePaymentUrl(value: string | null | undefined) {
  if (!value) return "Not extracted";
  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname}`;
  } catch {
    return "Payment URL extracted; details hidden";
  }
}

export default function PaymentFraudLayer({ result }: { result?: PaymentFraudDetection }) {
  if (!result) return null;
  const critical = result.verdict === "HIGH_RISK";
  const review = result.verdict === "REVIEW";
  const paymentApplicable = Boolean(result.paymentRequested || result.qrCodeMentioned || result.upiIds?.length || result.bankAccounts?.length);
  const tone = critical ? "border-red-200 bg-red-50 text-red-800" : review ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800";
  const bank = [...(result.bankAccounts || []), ...(result.ifscCodes || [])];
  return (
    <section aria-labelledby="payguard-title" className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="border-b border-slate-100 bg-slate-950 px-6 py-5 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">PayGuard AI — Recruitment Payment Risk Analysis</p>
        <h2 id="payguard-title" className="mt-2 text-2xl font-black text-white">Fraudulent Payment Detector</h2>
      </div>
      <div className="p-6 sm:p-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Payment Requested" value={result.paymentRequested ? "YES" : "NO"} />
          <Metric label="Requested Amount" value={display(result.amount, "Unknown")} />
          <Metric label="Payment Destination" value={display(result.destinationType, "NONE").replaceAll("_", " ")} />
          <Metric label="Payment Context" value={display(result.paymentContext, "UNKNOWN").replaceAll("_", " ")} />
          <Metric label="Payment Reason" value={display(result.paymentReason, "Not identified")} />
          <Metric label="Decoded UPI / VPA" value={result.upiIds?.length ? result.upiIds.map(maskPaymentIdentifier).join(", ") : "None extracted"} />
          <Metric label="QR Payee Name" value={display(result.qrPayeeName, "Not in decoded payload")} />
          <Metric label="QR Amount" value={display(result.qrAmount, "Not in decoded payload")} />
          <Metric label="Payment URL" value={display(result.paymentUrl, "Not extracted")} />
                    <Metric label="Payment URL" value={safePaymentUrl(result.paymentUrl)} />
                    <Metric label="QR Currency" value={display(result.qrCurrency, "Not in decoded payload")} />
                    <Metric label="Transaction Reference" value={display(result.qrTransactionReference, "Not in decoded payload")} />
          <Metric label="Claimed Organization" value={display(result.claimedOrganization, "Not identified")} />
          <Metric label="Payee / Organization" value={display(result.organizationMatch, "UNVERIFIED")} />
          <Metric label="Bank / IFSC" value={bank.length ? bank.join(" · ") : "None detected"} />
          <Metric label="QR Code" value={result.qrStatus === "UNAVAILABLE" ? "Scan unavailable" : result.qrStatus === "QR_DETECTED_BUT_NOT_DECODED" ? "Detected; not decoded" : result.qrCodeMentioned ? "Detected and decoded" : "Not detected"} />
          <Metric label="Destination Verification" value={result.destinationVerification === "GOVERNMENT_DOMAIN_MATCH" ? "Government domain match; authorization unverified" : display(result.destinationVerification, "UNVERIFIED").replaceAll("_", " ")} />
          <Metric label="Verification Status" value={display(result.verificationStatus, "UNKNOWN").replaceAll("_", " ")} />
        </div>
        {result.qrPayload && <p className="mt-3 break-all rounded-xl bg-slate-50 p-3 text-sm text-slate-600">QR payment ID: {maskPaymentIdentifier(result.qrPayload)}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">Risk Score: {Math.max(0, Math.min(100, result.riskScore || 0))}%</span>
          <span className={`rounded-full border px-4 py-2 text-sm font-black ${tone}`}>{display(result.verdict, "REVIEW").replaceAll("_", " ")}</span>
        </div>
        {result.explanation && <p className="mt-5 text-sm leading-6 text-slate-700">{result.explanation}</p>}
        {!paymentApplicable ? <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">NOT APPLICABLE · No recruitment payment request or QR payment destination was detected.</p>
          : result.redFlags?.length ? <div className="mt-5"><h3 className="font-bold text-slate-900">Red Flags</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-red-800">{result.redFlags.map((flag, index) => <li key={`${index}-${flag}`}>{flag}</li>)}</ul></div>
            : <p className="mt-5 text-sm text-slate-600">No recruitment payment red flags were identified in the submitted content.</p>}
        {result.recommendation && <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"><h3 className="font-bold text-slate-900">Recommendation</h3><p className="mt-1 text-sm leading-6 text-slate-700">{result.recommendation}</p></div>}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 break-words text-sm font-semibold text-slate-900">{value}</p></div>;
}
