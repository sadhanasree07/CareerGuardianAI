import { AlertTriangle, CircleHelp, ShieldCheck } from "lucide-react";
import type { GovernmentVerificationResult } from "@/lib/governmentRegistry";

type GovernmentRegistryPanelProps = {
  result?: GovernmentVerificationResult | null;
};

function statusStyle(status: string) {
  if (["VERIFIED", "PASS", "SAFE", "CONSISTENT", "EXACT_MATCH", "STRONG_MATCH"].includes(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (["SUSPICIOUS", "FAIL", "PERSONAL_OR_SUSPICIOUS", "INCONSISTENT"].includes(status)) {
    return "border-red-200 bg-red-50 text-red-800";
  }
  return "border-amber-200 bg-amber-50 text-amber-800";
}

function StatusValue({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusStyle(status)}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

export default function GovernmentRegistryPanel({ result }: GovernmentRegistryPanelProps) {
  if (!result) return null;

  const notApplicable = !result.isGovernmentJobClaim;
  const unavailable = result.verificationStatus === "UNAVAILABLE";
  const flags = result.redFlags || [];
  const positives = result.positiveSignals || [];
  const ncsReferenceUrl = safeExternalUrl(result.ncsReference.ncsReferenceUrl);
  const officialSourceUrl = safeExternalUrl(result.ncsReference.officialSourceUrl);

  return (
    <section aria-labelledby="government-registry-title" className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-teal-100 p-2 text-teal-800">
            <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <h2 id="government-registry-title" className="font-bold text-slate-900">Government registry cross-check</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              {notApplicable
                ? result.claimType === "PRIVATE" ? "This submission is classified as private-sector recruitment; NCS checking is not applicable." : "No explicit government recruitment claim was identified; NCS checking is not applicable."
                : result.recommendation}
            </p>
          </div>
        </div>
        <StatusValue status={result.verificationStatus} />
      </div>

      <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Official domain</p>
          <div className="mt-2"><StatusValue status={result.domainValidation.status} /></div>
          {result.domainValidation.urlChecked && <p className="mt-2 break-all text-xs text-slate-600">{result.domainValidation.urlChecked}</p>}
        </div>
        <div className="bg-white px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Notification match</p>
          <div className="mt-2"><StatusValue status={result.notificationMatch.status} /></div>
          {result.notificationNumber && <p className="mt-2 text-xs text-slate-600">Ref: {result.notificationNumber}</p>}
        </div>
        <div className="bg-white px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Recruitment details</p>
          <div className="mt-2"><StatusValue status={result.recruitmentConsistency.status} /></div>
        </div>
        <div className="bg-white px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Payment route</p>
          <div className="mt-2"><StatusValue status={result.paymentSafety.status} /></div>
        </div>
      </div>

      {!notApplicable && (
        <div className="space-y-4 px-5 py-4 sm:px-6">
          <section className="border-b border-slate-200 pb-4" aria-labelledby="ncs-reference-heading">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 id="ncs-reference-heading" className="text-sm font-bold text-slate-900">NCS Reference</h3>
              <StatusValue status={result.ncsReference.status} />
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {result.ncsReference.status === "NOT_FOUND"
                ? "No matching NCS reference was found. This does not establish fraud; additional independent verification is required."
                : result.ncsReference.status === "UNAVAILABLE"
                  ? "NCS reference unavailable. Other CareerGuardian verification evidence remains in effect."
                  : result.ncsReference.status === "NOT_APPLICABLE"
                    ? "NCS is not applicable to this submission."
                    : result.ncsReference.status === "NO_MATCH"
                      ? `An accessible NCS reference conflicts with submitted fields: ${result.ncsReference.mismatchedFields.join(", ") || "opportunity identity"}. Review the mismatch; it is not, by itself, proof of fraud.`
                      : result.ncsReference.status === "PARTIAL_MATCH"
                        ? "A partial NCS reference match was found, but important details could not be confirmed."
                        : `NCS reference match found (${result.ncsReference.status.replaceAll("_", " ")}); this is supporting evidence, not a guarantee of authenticity.`}
            </p>
            {result.ncsReference.reason && result.ncsReference.status === "UNAVAILABLE" && <p className="mt-1 text-xs text-slate-500">{result.ncsReference.reason}</p>}
            <dl className="mt-3 grid gap-3 sm:grid-cols-3">
              <div><dt className="text-xs font-medium uppercase text-slate-500">Organization</dt><dd className="mt-1 break-words text-sm text-slate-800">{result.ncsReference.organization || result.claimedOrganization || "NOT PROVIDED"}</dd></div>
              <div><dt className="text-xs font-medium uppercase text-slate-500">Job title</dt><dd className="mt-1 break-words text-sm text-slate-800">{result.ncsReference.jobTitle || "NOT PROVIDED"}</dd></div>
              <div><dt className="text-xs font-medium uppercase text-slate-500">Notification</dt><dd className="mt-1 break-words text-sm text-slate-800">{result.ncsReference.notificationNumber || "NOT PROVIDED"}</dd></div>
            </dl>
            {(result.ncsReference.matchedFields.length > 0 || result.ncsReference.mismatchedFields.length > 0 || result.ncsReference.unavailableFields.length > 0) && <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
              <p><span className="font-bold text-emerald-800">Matched:</span> {result.ncsReference.matchedFields.join(", ") || "None"}</p>
              <p><span className="font-bold text-amber-800">Mismatched:</span> {result.ncsReference.mismatchedFields.join(", ") || "None"}</p>
              <p><span className="font-bold text-slate-600">Unavailable:</span> {result.ncsReference.unavailableFields.join(", ") || "None"}</p>
            </div>}
            <div className="mt-3 flex flex-wrap gap-4 text-xs">
              {ncsReferenceUrl && <a href={ncsReferenceUrl} target="_blank" rel="noreferrer" className="break-all font-semibold text-cyan-800 underline">Open NCS reference</a>}
              {officialSourceUrl && <a href={officialSourceUrl} target="_blank" rel="noreferrer" className="break-all font-semibold text-cyan-800 underline">Open source URL linked by NCS</a>}
            </div>
          </section>

          <p className="text-sm text-slate-600">{result.domainValidation.reason}</p>

          {result.registryChecks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Registry sources</h3>
              <ul className="mt-2 divide-y divide-slate-100">
                {result.registryChecks.map((check) => (
                  <li key={check.source} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <span className="font-medium text-slate-700">{check.source}</span>
                    <span className="flex items-center gap-2">
                      <span className="max-w-xl text-right text-xs text-slate-500">{check.evidence}</span>
                      <StatusValue status={check.status} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {flags.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-red-900">
                <AlertTriangle aria-hidden="true" className="h-4 w-4" /> Evidence requiring caution
              </h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-800">
                {flags.map((flag) => <li key={flag}>{flag}</li>)}
              </ul>
            </div>
          )}

          {positives.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Supporting signals</h3>
              <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-slate-600">
                {positives.map((signal) => <li key={signal}>{signal}</li>)}
              </ul>
            </div>
          )}

          {(unavailable || result.evidenceQuality === "UNAVAILABLE") && (
            <p className="flex items-start gap-2 border-t border-slate-200 pt-3 text-xs text-slate-500">
              <CircleHelp aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              One or more official registry sources could not be reached or are not configured. This is an unavailable check, not evidence that the notice is fraudulent.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}