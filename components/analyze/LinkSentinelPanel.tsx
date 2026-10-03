import { Link2, ShieldAlert } from "lucide-react";
import type { LinkSentinelEntry } from "@/lib/linkSentinel";

type LinkSentinelResult = {
  enabled: boolean;
  status: string;
  reason?: string;
  urlsAnalyzed: LinkSentinelEntry[];
};

export default function LinkSentinelPanel({ result }: { result?: LinkSentinelResult | null }) {
  if (!result) return null;
  const suspicious = result.urlsAnalyzed.some((link) => link.domainAnalysis.isLookalike || link.domainAnalysis.isTyposquatting || link.riskLevel === "HIGH" || link.riskLevel === "CRITICAL");
  const notApplicable = result.status === "NOT_APPLICABLE" || (!result.urlsAnalyzed.length && result.status !== "NOT_ENABLED" && result.status !== "UNAVAILABLE");
  const disabled = result.status === "NOT_ENABLED" || result.status === "DISABLED" || !result.enabled;

  return (
    <details open={suspicious} className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-slate-800">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-bold">
        {suspicious ? <ShieldAlert aria-hidden="true" className="h-4 w-4 text-red-700" /> : <Link2 aria-hidden="true" className="h-4 w-4 text-cyan-800" />}
        Official Domain / Link Sentinel
        <span className={`ml-auto rounded-md border px-2 py-1 text-[11px] font-bold ${suspicious ? "border-red-200 bg-red-50 text-red-800" : "border-cyan-200 bg-white text-cyan-900"}`}>
          {suspicious ? "SUSPICIOUS LINK" : notApplicable ? "NOT APPLICABLE" : disabled ? "NOT ENABLED" : result.status === "UNAVAILABLE" ? "UNAVAILABLE" : "ACTIVE"}
        </span>
      </summary>

      {notApplicable ? <p className="mt-3 text-sm">No URL was found in the supplied evidence. Link Sentinel is not applicable.</p>
        : disabled ? <p className="mt-3 text-sm">Link Sentinel is disabled by configuration.</p>
          : result.status === "UNAVAILABLE" ? <p className="mt-3 text-sm">UNABLE TO RESOLVE · {result.reason || "URL analysis could not complete."}</p>
            : <>
              <p className="mt-3 text-sm">ACTIVE · {result.urlsAnalyzed.length} URL(s) analyzed.</p>
              <div className="mt-3 space-y-2">
                {result.urlsAnalyzed.map((link, index) => (
                  <details key={`${link.normalizedUrl}-${index}`} open={link.domainAnalysis.isLookalike || link.domainAnalysis.isTyposquatting} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                    <summary className="cursor-pointer font-semibold">{link.domainAnalysis.domainStatus.replaceAll("_", " ")} · {link.domainAnalysis.hostname || "Invalid URL"}</summary>
                    <div className="mt-3 space-y-2 break-words text-xs text-slate-700">
                      <p><span className="font-semibold">Claimed organization:</span> {link.domainAnalysis.claimedOrganization}</p>
                      <p><span className="font-semibold">Official domain:</span> {link.domainAnalysis.matchedOfficialDomain || link.domainAnalysis.officialWebsite || "Not found in verified-domain registry"}</p>
                      <p><span className="font-semibold">Submitted URL:</span> {link.originalUrl}</p>
                      {link.resolvedUrl && link.resolvedUrl !== link.normalizedUrl && <p><span className="font-semibold">Resolved URL:</span> {link.resolvedUrl}</p>}
                      <p><span className="font-semibold">Exact domain match:</span> {link.domainAnalysis.domainMatch ? "Yes" : "No"}</p>
                      {link.domainAnalysis.isTyposquatting && <p className="font-bold text-red-800">TYPOSQUATTING DETECTED · Similarity {link.domainAnalysis.similarityScore}%</p>}
                      {!link.domainAnalysis.isTyposquatting && <p><span className="font-semibold">Similarity:</span> {link.domainAnalysis.similarityScore}%</p>}
                      {!!link.domainAnalysis.differences.length && link.domainAnalysis.differences.map((difference, differenceIndex) => (
                        <p key={differenceIndex}><span className="font-semibold">Difference:</span> {difference.explanation}</p>
                      ))}
                      {link.isShortened && <p>Shortened URL detected. The resolved destination, when available, is analyzed.</p>}
                      {link.redirectChain.length > 1 && <p><span className="font-semibold">Redirect chain:</span> {link.redirectChain.join(" → ")}</p>}
                      {!!link.phishingSignals.length && <p><span className="font-semibold">Signals:</span> {link.phishingSignals.join(", ")}</p>}
                      {!!link.evidence.length && <p className="text-slate-500">{link.evidence.join(" ")}</p>}
                    </div>
                  </details>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-4 text-slate-500">An unrecognized company domain alone is not fraud. Government-domain rules apply only when a known government organization is claimed.</p>
            </>}
    </details>
  );
}
