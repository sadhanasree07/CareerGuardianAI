"use client";

import { useState } from "react";
import { Building2, LoaderCircle, SearchCheck } from "lucide-react";

type Props = {
  initialVerification: any;
  opportunity: any;
  onComplete: (result: any) => void;
};

const inputClass = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";

export default function GuardianTrustCheck({ initialVerification, opportunity, onComplete }: Props) {
  const verdict = String(initialVerification?.verdict || "").toUpperCase();
  const risk = Number(initialVerification?.riskScore || 0);
  const shouldOffer = verdict === "REVIEW" && risk < 60;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState<any>(null);
  const [form, setForm] = useState({ independentWebsite: "", independentEmail: "", independentPhone: "", independentRole: "", opportunityUrl: "", confirmationSource: "" });
  if (!shouldOffer) return null;

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const field = (key: keyof typeof form, label: string, placeholder: string, type = "text") => (
    <label className="block text-sm font-medium text-slate-700">{label}<input className={inputClass} type={type} value={form[key]} placeholder={placeholder} onChange={(event) => update(key, event.target.value)} /></label>
  );

  async function runCheck(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setError("");
    try {
      const response = await fetch("/api/verify/trust-check", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: opportunity?.company,
          claimedWebsite: opportunity?.website,
          claimedEmail: opportunity?.email,
          claimedPhone: opportunity?.phone,
          claimedRole: opportunity?.jobRole,
          ...form,
          verificationId: initialVerification?.verificationId,
          initialRisk: initialVerification?.riskScore,
          initialConfidence: initialVerification?.verificationConfidence,
          initialSourceConfidence: initialVerification?.sourceConfidence,
          initialCoverage: initialVerification?.evidenceCoverage,
          initialVerdict: initialVerification?.verdict,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not run the cross-check.");
      setOutcome(result); onComplete(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not run the cross-check.");
    } finally { setPending(false); }
  }

  return (
    <section className="mt-8 rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="guardian-check-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="rounded-2xl bg-cyan-50 p-3 text-cyan-800"><Building2 className="h-6 w-6" /></span>
          <div><p className="text-xs font-bold uppercase tracking-wider text-cyan-800">Second-stage check · Optional</p><h2 id="guardian-check-title" className="mt-1 text-xl font-bold text-slate-900">Guardian Company &amp; Opportunity Trust Check</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Compare the submitted details with a reference you found independently. CareerGuardian checks reachability and exact matches; it does not authenticate the reference, confirm company registration, or search all job postings.</p></div>
        </div>
        {!open && !outcome && <button onClick={() => setOpen(true)} className="shrink-0 rounded-xl bg-cyan-800 px-4 py-2.5 font-semibold text-white hover:bg-cyan-900">Add independent references</button>}
      </div>

      {open && !outcome && <form className="mt-6" onSubmit={runCheck}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-semibold text-slate-900">Organization trust</h3><p className="mt-1 text-sm text-slate-600">Use a website or contact you located separately from this message.</p><div className="mt-4 space-y-4">{field("independentWebsite", "Independently found company website", "https://company.example")}{field("independentEmail", "Reference email address", "recruiter@company.example", "email")}{field("independentPhone", "Reference phone number", "+91 …")}</div></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-semibold text-slate-900">Opportunity authenticity</h3><p className="mt-1 text-sm text-slate-600">Compare role and posting details with your separate reference.</p><div className="mt-4 space-y-4">{field("independentRole", "Role title in the independent reference", "e.g. Software Engineer")}{field("opportunityUrl", "Specific opportunity URL, if available", "https://company.example/careers/role")}{field("confirmationSource", "Where you found or confirmed the reference", "Company careers page, known placement contact…")}</div></div>
        </div>
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm leading-5 text-amber-900">Only enter contact details you found independently. A match is a comparison, not proof that a person, website, or posting is official. Do not include passwords, OTPs, or other sensitive information.</p>
        {error && <p role="alert" className="mt-4 text-sm font-medium text-red-700">{error}</p>}
        <div className="mt-5 flex flex-wrap gap-3"><button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-cyan-800 px-5 py-3 font-semibold text-white disabled:opacity-60">{pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <SearchCheck className="h-4 w-4" />}{pending ? "Comparing supplied details…" : "Run Guardian Trust Check"}</button><button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">Cancel</button></div>
      </form>}

      {outcome && <div className="mt-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Organization trust", outcome.organizationStatus], ["Opportunity authenticity", outcome.opportunityStatus], ["Updated verdict", outcome.verdict], ["Updated risk", `${outcome.riskScore}%`]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 font-bold text-slate-900">{value}</p></div>)}</div>
        {outcome.aiExplanation && <p className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-slate-700">{outcome.aiExplanation}</p>}
        <div className="mt-4 grid gap-4 md:grid-cols-3">{[["Supporting comparisons", outcome.supportingEvidence], ["Conflicts to resolve", outcome.conflictingEvidence], ["Still not verified", outcome.missingEvidence]].map(([title, items]) => <div key={String(title)} className="rounded-xl border border-slate-200 p-4"><h3 className="font-semibold text-slate-900">{title}</h3>{(items as string[]).length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{(items as string[]).map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-2 text-sm text-slate-500">None recorded.</p>}</div>)}</div>
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700"><p><strong>Company identity:</strong> {outcome.checks.companyIdentityRegistry}</p><p><strong>Specific job posting:</strong> {outcome.checks.specificOpportunityPosting}</p><p><strong>Reference provenance:</strong> {outcome.provenance.referenceDetails}</p><p><strong>Next step:</strong> {outcome.recommendedAction}</p></div>
        {!outcome.saved && <p className="mt-3 text-xs text-slate-500">This result is available in this session. Sign in to attach it to a saved verification report.</p>}
      </div>}
    </section>
  );
}
