import { Activity, ShieldAlert } from "lucide-react";

type ThreatResult = {
  enabled: boolean;
  status: string;
  reason?: string;
  matched: boolean;
  clusterId: string | null;
  similarityScore: number;
  reportCount: number;
  reportsLast24Hours: number;
  reportsLast72Hours: number;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  threatLevel: string;
  evidence: string[];
};

export default function ThreatNetPanel({ result }: { result?: ThreatResult | null }) {
  if (!result) return null;
  const matched = result.status === "MATCH_FOUND" || result.matched;
  const status = result.status || (result.enabled ? matched ? "MATCH_FOUND" : "NO_MATCH" : "NOT_ENABLED");

  return (
    <details open={matched} className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-slate-800">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-bold">
        {matched ? <ShieldAlert aria-hidden="true" className="h-4 w-4 text-red-700" /> : <Activity aria-hidden="true" className="h-4 w-4 text-amber-800" />}
        ThreatNet · Threat Intelligence
        <span className="ml-auto rounded-md border border-amber-200 bg-white px-2 py-1 text-[11px] font-bold text-amber-900">{status.replaceAll("_", " ")}</span>
      </summary>

      {status === "NOT_ENABLED" ? <p className="mt-3 text-sm">NOT ENABLED · {result.reason || "ThreatNet is disabled by configuration."}</p>
        : status === "INSUFFICIENT_EVIDENCE" ? <p className="mt-3 text-sm">NO EVIDENCE · {result.reason || "Insufficient text or comparable identifiers for threat matching."}</p>
          : status === "UNAVAILABLE" ? <p className="mt-3 text-sm">SERVICE UNAVAILABLE · {result.reason || "ThreatNet could not reach its analysis database."}</p>
            : status === "ACTIVE_ANALYZING" ? <p className="mt-3 text-sm">ACTIVE — ANALYZING</p>
              : matched ? <>
                <p className="mt-3 text-sm">Potential cluster match detected. Community reports are supporting evidence and do not determine the result alone.</p>
                <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                  <Metric label="Report count" value={String(result.reportCount)} />
                  <Metric label="Similarity" value={`${result.similarityScore}%`} />
                  <Metric label="Reports · 24 hours" value={String(result.reportsLast24Hours)} />
                  <Metric label="Reports · 72 hours" value={String(result.reportsLast72Hours)} />
                  <Metric label="First seen" value={result.firstSeenAt ? new Date(result.firstSeenAt).toLocaleString() : "Not available"} />
                  <Metric label="Last seen" value={result.lastSeenAt ? new Date(result.lastSeenAt).toLocaleString() : "Not available"} />
                </dl>
                {!!result.evidence.length && <ul className="mt-3 list-inside list-disc text-xs text-slate-600">{result.evidence.map((item) => <li key={item}>{item}</li>)}</ul>}
              </> : <p className="mt-3 text-sm">ACTIVE · No matching threat cluster found. No ThreatNet risk penalty was applied.</p>}
    </details>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-amber-100 bg-white p-2"><dt className="text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-800">{value}</dd></div>;
}
