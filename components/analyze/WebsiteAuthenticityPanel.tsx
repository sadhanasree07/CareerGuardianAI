import { Globe, ShieldAlert, ShieldCheck } from "lucide-react";
import type { WebsiteAuthenticityResult } from "@/lib/websiteAuthenticity.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAuthenticityResult(value: unknown): value is WebsiteAuthenticityResult {
  return isRecord(value)
    && typeof value.status === "string"
    && isRecord(value.domain)
    && isRecord(value.dns)
    && isRecord(value.ip)
    && isRecord(value.asn)
    && isRecord(value.hosting)
    && isRecord(value.nameservers)
    && isRecord(value.tls)
    && isRecord(value.registration)
    && isRecord(value.ownership)
    && isRecord(value.assets)
    && isRecord(value.contentSimilarity)
    && typeof value.infrastructureRelationship === "string"
    && Array.isArray(value.redirectChain)
    && Array.isArray(value.positiveSignals)
    && Array.isArray(value.redFlags)
    && Array.isArray(value.unavailableSignals)
    && isRecord(value.evidenceCoverage);
}

function display(value: unknown) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Unavailable";
  if (typeof value === "boolean") return value ? "Valid / matched" : "Invalid / mismatch";
  if (typeof value === "number") return String(value);
  return typeof value === "string" && value ? value : "Unavailable";
}

function statusTone(status: string) {
  if (status === "MATCH" || status === "STRONG_MATCH" || status === "CDN_SHARED_INFRASTRUCTURE") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (status === "MISMATCH" || status === "SUSPICIOUS") return "border-red-200 bg-red-50 text-red-800";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

export default function WebsiteAuthenticityPanel({ result: value }: { result: unknown }) {
  if (!isAuthenticityResult(value)) return null;
  const result = value;
  const status = result.status;
  const rows: Array<[string, unknown, unknown, string]> = [
    ["Domain", result.domain.submittedDomain, result.domain.referenceDomain, result.domain.status],
    ["DNS records", `A ${result.dns.a.join(", ") || "—"}; AAAA ${result.dns.aaaa.join(", ") || "—"}; CNAME ${result.dns.cname.join(", ") || "—"}; MX ${result.dns.mx.join(", ") || "—"}`, `A ${result.dns.reference.a.join(", ") || "—"}; AAAA ${result.dns.reference.aaaa.join(", ") || "—"}; CNAME ${result.dns.reference.cname.join(", ") || "—"}; MX ${result.dns.reference.mx.join(", ") || "—"}`, result.dns.status],
    ["IP addresses", result.ip.submitted, result.ip.reference, result.ip.relationship],
    ["ASN", `${result.asn.submitted || "—"} ${result.asn.submittedOrganization || ""}`, `${result.asn.reference || "—"} ${result.asn.referenceOrganization || ""}`, result.asn.relationship],
    ["Hosting provider", result.hosting.submittedProvider, result.hosting.referenceProvider, result.hosting.relationship],
    ["Nameservers", result.nameservers.submitted, result.nameservers.reference, result.nameservers.relationship],
    ["TLS certificate", result.tls.issuer, result.tls.subject, result.tls.status],
    ["Domain registration", result.registration.createdAt ? `${result.registration.createdAt}${result.registration.domainAgeDays !== null ? ` · ${result.registration.domainAgeDays} days old` : ""}` : null, result.registration.registrar, result.registration.status],
    ["Organization identity", result.claimedOrganization, result.ownership.organizationMatch, result.ownership.organizationMatch],
    ["Contact domain", result.ownership.contactDomainMatch, result.ownership.contradictions.find((item) => item.includes("Contact")) || "No verified contradiction", result.ownership.contactDomainMatch],
    ["Official links", result.ownership.officialLinksMatch, null, result.ownership.officialLinksMatch],
    ["Asset origins", result.assets.officialAssetOrigins, result.assets.suspiciousAssetOrigins, result.assets.status],
    ["Content resemblance", result.contentSimilarity.similarityScore === null ? null : `${result.contentSimilarity.similarityScore}%`, "Supporting evidence only", result.contentSimilarity.similarityScore === null ? "UNAVAILABLE" : "PARTIAL_MATCH"],
  ];
  const Icon = status === "MATCH" || status === "PARTIAL_MATCH" ? ShieldCheck : ShieldAlert;

  return (
    <section aria-labelledby="website-authenticity-title" className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 bg-slate-950 p-5 text-white sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-cyan-300/15 p-3 text-cyan-200"><Globe aria-hidden="true" className="h-6 w-6" /></div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">Main Layer 1</p>
            <h2 id="website-authenticity-title" className="text-xl font-black sm:text-2xl">Website Authenticity &amp; Infrastructure Fingerprint</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-300">Compares the submitted website with the organization&apos;s verified digital identity and infrastructure.</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold ${statusTone(status)}`}>
          <Icon aria-hidden="true" className="h-4 w-4" />{status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <dl className="grid gap-3 sm:grid-cols-2">
          <Metric label="Submitted Website" value={result.finalUrl || result.submittedUrl} />
          <Metric label="Verified Reference Website" value={result.referenceUrl} />
          <Metric label="Redirect Chain" value={result.redirectChain.length ? result.redirectChain.join(" → ") : "No redirect recorded"} />
          <Metric label="Infrastructure Relationship" value={result.infrastructureRelationship.replaceAll("_", " ")} />
          <Metric label="Evidence Coverage / Confidence" value={`${result.evidenceCoverage.observed}/${result.evidenceCoverage.total} observed · ${result.confidence}% confidence`} />
        </dl>

        <h3 className="mb-3 mt-6 font-bold text-slate-900">Infrastructure comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><th className="py-2 pr-3">Signal</th><th className="py-2 pr-3">Submitted</th><th className="py-2 pr-3">Reference</th><th className="py-2">Status</th></tr></thead>
            <tbody>
              {rows.map(([label, observed, reference, rowStatus]) => (
                <tr key={label} className="border-b border-slate-100 align-top last:border-0">
                  <th className="py-3 pr-3 font-semibold text-slate-800">{label}</th>
                  <td className="max-w-[220px] break-words py-3 pr-3 text-slate-600">{display(observed)}</td>
                  <td className="max-w-[220px] break-words py-3 pr-3 text-slate-600">{display(reference)}</td>
                  <td className="py-3 font-semibold text-slate-700">{display(rowStatus).replaceAll("_", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          A website can be cloned. Infrastructure correlation provides additional evidence, but shared IPs or CDNs do not prove ownership, and different IPs do not prove fraud. Unknown or unavailable checks do not increase risk.
        </p>

        {result.positiveSignals.length > 0 && <SignalList title="Supporting signals" items={result.positiveSignals} />}
        {result.redFlags.length > 0 && <SignalList title="Red flags" items={result.redFlags} risk />}
        {result.unavailableSignals.length > 0 && <SignalList title="Unknown / unavailable" items={result.unavailableSignals} />}

        {result.evidence.length > 0 && (
          <details className="mt-5 rounded-xl border border-slate-200 p-4">
            <summary className="cursor-pointer font-bold text-slate-900">Evidence sources and observed signals</summary>
            <ul className="mt-3 space-y-2">
              {result.evidence.map((item) => (
                <li key={item.signal} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-slate-800">{item.signal.replaceAll("-", " ")} · {item.status.replaceAll("_", " ")}</p>
                  <p className="mt-1 break-words text-slate-600">
                    Observed: {display(item.observedValue)} · Reference: {display(item.referenceValue)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Source: {item.source.replaceAll("_", " ")} · collected {new Date(item.timestamp).toLocaleString()} · source confidence {item.confidence}%
                  </p>
                </li>
              ))}
            </ul>
          </details>
        )}

        <p className="mt-5 border-t border-slate-100 pt-4 text-sm font-medium text-slate-800">
          Next action: Independently confirm the opportunity through the organization&apos;s verified official website or a known official contact before sending money, credentials, or identity documents.
        </p>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: unknown }) {
  return <div className="min-w-0 rounded-lg border border-slate-200 p-3">
    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
    <dd className="mt-1 break-words text-sm font-bold text-slate-900">{display(value)}</dd>
  </div>;
}

function SignalList({ title, items, risk = false }: { title: string; items: string[]; risk?: boolean }) {
  return <div className={`mt-5 rounded-xl p-4 ${risk ? "bg-red-50" : "bg-slate-50"}`}>
    <h3 className={`font-bold ${risk ? "text-red-800" : "text-slate-900"}`}>{title}</h3>
    <ul className={`mt-2 list-disc space-y-1 pl-5 text-sm ${risk ? "text-red-800" : "text-slate-700"}`}>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  </div>;
}
