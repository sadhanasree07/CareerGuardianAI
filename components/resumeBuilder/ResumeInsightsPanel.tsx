"use client";

import { useMemo, useState } from "react";
import type { ResumeData } from "./resumeTypes";

const STOP_WORDS = new Set("about above after again against all also any are because been before being between both but can could did does doing down during each few for from further had has have having here how into itself just more most other our out over same she should some such than that the their them then there these they this those through too under until very was were what when where which while who will with would your using build develop create work role team product".split(" "));

function resumeText(data: ResumeData): string {
  return [data.name, data.title, data.email, data.phone, data.location, data.professionalSummary,
    ...data.technicalSkills, ...data.developmentSkills, ...data.softSkills, ...data.education.flatMap(Object.values),
    ...data.projects.flatMap(Object.values), ...data.experience.flatMap(Object.values),
    ...data.certifications, ...data.achievements, ...data.languages].join(" ").toLowerCase();
}

function validUrl(value: string): boolean {
  if (!value.trim()) return true;
  try { const parsed = new URL(value); return (parsed.protocol === "https:" || parsed.protocol === "http:") && !!parsed.hostname; }
  catch { return false; }
}

export default function ResumeInsightsPanel({ data }: { data: ResumeData }) {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const suppliedLinks = [data.linkedin, data.github, data.portfolio, ...data.projects.map((project) => project.link)].filter(Boolean);
  const linksValid = suppliedLinks.every(validUrl);
  const checks = [
    ["Name", !!data.name.trim()],
    ["Email", !!data.email.trim()],
    ["Phone", !!data.phone.trim()],
    ["Professional title", !!data.title.trim()],
    ["Professional summary", !!data.professionalSummary.trim()],
    ["Skills", data.technicalSkills.length + data.developmentSkills.length > 0],
    ["Education", data.education.some((item) => item.degree || item.institution)],
    ["Projects", data.projects.some((item) => item.title || item.description)],
    ["Project descriptions", data.projects.length > 0 && data.projects.every((item) => !!item.description.trim())],
    ["Experience or internship", data.experience.some((item) => item.role || item.organization || item.description)],
    ["Internship descriptions", data.experience.filter((item) => item.type === "internship").length > 0 && data.experience.filter((item) => item.type === "internship").every((item) => !!item.description.trim())],
    ["Certifications", data.certifications.length > 0],
    ["LinkedIn URL", !!data.linkedin],
    ["Links valid when supplied", linksValid],
  ] as const;
  const keywords = useMemo(() => {
    const text = `${jobTitle} ${jobDescription}`.toLowerCase();
    return [...new Set(text.match(/[a-z][a-z+#.-]{2,}/g) || [])].filter((word) => !STOP_WORDS.has(word));
  }, [jobTitle, jobDescription]);
  const current = useMemo(() => resumeText(data), [data]);
  const matched = keywords.filter((word) => current.includes(word));
  const missing = keywords.filter((word) => !current.includes(word));
  const relevantProjects = data.projects.filter((item) => keywords.some((word) => JSON.stringify(item).toLowerCase().includes(word)));
  const relevantExperience = data.experience.filter((item) => keywords.some((word) => JSON.stringify(item).toLowerCase().includes(word)));
  const hasSource = jobTitle.trim() || jobDescription.trim();

  return <section className="grid gap-5 xl:grid-cols-2">
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Resume check</h2><p className="mt-1 text-sm text-slate-600">Actionable content checks; this is not an ATS score or selection prediction.</p>
      <ul className="mt-4 space-y-2">{checks.map(([label, ready]) => <li key={label} className="flex items-center gap-2 text-sm"><span aria-hidden="true" className={ready ? "text-emerald-700" : "text-amber-700"}>{ready ? "✓" : "!"}</span><span>{label}</span><span className="ml-auto text-xs text-slate-500">{ready ? "Ready" : "Needs attention"}</span></li>)}</ul>
      {(data.professionalSummary.length > 700 || data.projects.some((item) => item.description.length > 1000) || data.experience.some((item) => item.description.length > 1200)) && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Some sections are long. Review the live preview and page flow before downloading.</p>}
    </div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Target job (optional)</h2><p className="mt-1 text-sm text-slate-600">Compare role language with what your resume already supports. Unsupported terms will not be added.</p>
      <label className="mt-4 block text-sm font-medium">Job title<input value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} className="mt-1 w-full rounded-lg border p-2.5" placeholder="e.g. Frontend Developer" /></label>
      <label className="mt-3 block text-sm font-medium">Job description<textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} className="mt-1 min-h-24 w-full rounded-lg border p-2.5" placeholder="Paste job requirements to compare keywords." /></label>
      <button type="button" onClick={() => setShowAnalysis(true)} disabled={!hasSource} className="mt-3 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 disabled:opacity-50">Tailor Resume</button>
      {showAnalysis && hasSource && <div className="mt-4 grid gap-3 sm:grid-cols-2"><div><h3 className="text-sm font-semibold text-emerald-800">Relevant terms already present</h3><p className="mt-1 break-words text-sm text-slate-700">{matched.length ? matched.join(", ") : "No direct matches found yet."}</p><h3 className="mt-3 text-sm font-semibold text-slate-800">Projects to emphasize</h3><p className="mt-1 break-words text-sm text-slate-700">{relevantProjects.length ? relevantProjects.map((item) => item.title).filter(Boolean).join(", ") : "No projects directly match the supplied terms."}</p><h3 className="mt-3 text-sm font-semibold text-slate-800">Experience to emphasize</h3><p className="mt-1 break-words text-sm text-slate-700">{relevantExperience.length ? relevantExperience.map((item) => [item.role, item.organization].filter(Boolean).join(" at ")).join(", ") : "No experience directly matches the supplied terms."}</p></div><div><h3 className="text-sm font-semibold text-amber-800">Terms not present in this resume</h3><p className="mt-1 break-words text-sm text-slate-700">{missing.length ? missing.join(", ") : "No unmatched terms."}</p><p className="mt-2 text-xs text-slate-500">Only add a term if it accurately describes your skills or experience. This comparison does not predict ATS results.</p></div></div>}
    </div>
  </section>;
}
