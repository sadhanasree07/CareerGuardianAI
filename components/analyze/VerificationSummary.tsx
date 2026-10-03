import { Activity, ShieldCheck } from "lucide-react";

type VerificationSummaryProps = {
  verification: Record<string, any>;
  extracted: Record<string, any>;
};

function statusTone(status: string) {
  if (status === "CRITICAL RISK" || status === "HIGH RISK") return "border-red-200 bg-red-50 text-red-800";
  if (status === "REVIEW REQUIRED") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function percent(value: unknown) {
  return typeof value === "number" ? `${Math.max(0, Math.min(100, Math.round(value)))}%` : "Not available";
}

export default function VerificationSummary({ verification, extracted }: VerificationSummaryProps) {
  const riskStatus = typeof verification.riskStatus === "string"
    ? verification.riskStatus
    : typeof verification.riskScore === "number" && verification.riskScore >= 70
      ? "HIGH RISK"
      : verification.verdict === "LOW RISK" ? "LOW RISK" : "REVIEW REQUIRED";
  const organization = extracted.company || verification.company || "Not identified";
  const notification = extracted.notificationNumber || verification.notificationNumber || "Not identified";
  const sourceType = verification.sourceLabel || verification.sourceType || "Not provided";
  const claimType = verification.governmentVerification?.claimType;
  const recruitmentType = claimType === "GOVERNMENT"
    ? "Government recruitment"
    : claimType === "PSU_GOVERNMENT_LINKED"
      ? "PSU / government-linked recruitment"
      : claimType === "PRIVATE"
        ? "Private-sector recruitment"
        : claimType === "UNKNOWN"
          ? "Government claim unknown"
          : extracted.inputType === "recording" ? "Recruitment recording" : "Not verified";
  const officialStatus = verification.governmentVerification?.verificationStatus === "VERIFIED"
    ? "VERIFIED"
    : verification.governmentVerification?.verificationStatus === "UNAVAILABLE"
      ? "NOT VERIFIED · source unavailable"
      : verification.governmentVerification?.verificationStatus || "NOT VERIFIED";

  return (
    <section aria-labelledby="verification-summary-title" className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Recruitment Verification</p>
          <h2 id="verification-summary-title" className="mt-1 text-xl font-bold text-slate-900">{organization}</h2>
          <p className="mt-1 text-sm text-slate-600">Notification / Advertisement: {notification}</p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold ${statusTone(riskStatus)}`}>
          <ShieldCheck aria-hidden="true" className="h-4 w-4" />{riskStatus}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Risk Score" value={percent(verification.riskScore)} prominent />
        <Metric label="Verification Confidence" value={percent(verification.verificationConfidence)} />
        <Metric label="Evidence Coverage" value={percent(verification.evidenceCoverage)} />
        <Metric label="Recruitment Type" value={String(recruitmentType)} />
        <Metric label="Source Type" value={String(sourceType)} />
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <Activity aria-hidden="true" className="h-4 w-4 text-blue-700" />
        <span>Official Source Status:</span>
        <span className="font-semibold">{officialStatus}</span>
      </div>

      <details className="mt-3 border-t border-slate-100 pt-3">
        <summary className="cursor-pointer text-xs font-semibold text-slate-600">Risk evidence category contributions</summary>
        {verification.riskAssessment?.categoryContributions && (
          <dl className="mt-3 grid gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(verification.riskAssessment.categoryContributions as Record<string, number>).map(([category, points]) => (
              <div key={category} className="flex justify-between gap-3 text-xs"><dt className="text-slate-500">{category.replaceAll(/([A-Z])/g, " $1")} ({verification.riskAssessment.categoryWeights?.[category] ?? 0}%)</dt><dd className="font-semibold text-slate-700">{points.toFixed(1)} pts</dd></div>
            ))}
          </dl>
        )}
        {verification.riskAssessment?.criticalOverride && <p className="mt-2 text-xs font-medium text-red-700">Critical evidence: {verification.riskAssessment.criticalOverride}</p>}
      </details>
    </section>
  );
}

function Metric({ label, value, prominent = false }: { label: string; value: string; prominent?: boolean }) {
  return <div className="min-w-0 rounded-lg border border-slate-200 p-3">
    <dt className="text-[11px] font-semibold text-slate-500">{label}</dt>
    <dd className={`${prominent ? "text-2xl" : "text-sm"} mt-1 break-words font-bold text-slate-900`}>{value}</dd>
  </div>;
}
