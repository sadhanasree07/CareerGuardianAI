"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ResumeForm from "@/components/resumeBuilder/ResumeForm";
import ResumePreview from "@/components/resumeBuilder/ResumePreview";
import ResumeInsightsPanel from "@/components/resumeBuilder/ResumeInsightsPanel";
import { emptyResume, normalizeResume, type ResumeData, type ResumeStyle } from "@/components/resumeBuilder/resumeTypes";
import { mapProfileToResume, resumeHasSourceContent } from "@/lib/mapProfileToResume";

const STORAGE_KEY = "career-guardian-resume-draft-v1";
const SOURCE_KEY = "career-guardian-resume-source-v1";
const STYLE_KEY = "career-guardian-resume-style-v1";
type SourceData = { profile: Record<string, unknown> | null; careerDNA: Record<string, unknown> | null };
type ResumeField = keyof ResumeData;
type SourceChange = { field: ResumeField; before: unknown; after: unknown; safe: boolean };

async function fetchSources(): Promise<SourceData> {
  const [profileResponse, dnaResponse] = await Promise.all([fetch("/api/profile"), fetch("/api/career-dna/latest")]);
  const [profileResult, dnaResult] = await Promise.all([profileResponse.json(), dnaResponse.json()]);
  return {
    profile: profileResult.success ? profileResult.user as Record<string, unknown> : null,
    careerDNA: dnaResult.success ? dnaResult.data as Record<string, unknown> : null,
  };
}

function retainAvailableSources(latest: SourceData, previous: SourceData): SourceData {
  return {
    profile: latest.profile || previous.profile,
    careerDNA: latest.careerDNA || previous.careerDNA,
  };
}

function readStoredResume(storageKey = STORAGE_KEY, sourceKey = SOURCE_KEY): { resume: ResumeData | null; source: ResumeData | null } {
  try {
    const stored = localStorage.getItem(storageKey);
    const source = localStorage.getItem(sourceKey);
    return { resume: stored ? normalizeResume(JSON.parse(stored)) : null, source: source ? normalizeResume(JSON.parse(source)) : null };
  } catch (error) {
    console.error("Unable to restore resume draft:", error);
    return { resume: null, source: null };
  }
}

function hasManualEdits(current: ResumeData, imported: ResumeData | null): boolean {
  if (!imported) return resumeHasSourceContent(current);
  return (Object.keys(current) as (keyof ResumeData)[]).some((field) => JSON.stringify(current[field]) !== JSON.stringify(imported[field]));
}

function displaySourceValue(value: unknown): string {
  if (typeof value === "string") return value || "(empty)";
  const serialized = JSON.stringify(value);
  return !serialized || serialized === "[]" ? "(empty)" : serialized;
}

export default function ResumeBuilderPage() {
  const [sources, setSources] = useState<SourceData>({ profile: null, careerDNA: null });
  const [resumeData, setResumeData] = useState<ResumeData>(emptyResume);
  const [sourceSnapshot, setSourceSnapshot] = useState<ResumeData | null>(null);
  const [generatedFromSources, setGeneratedFromSources] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sourceChanges, setSourceChanges] = useState<SourceChange[]>([]);
  const [selectedSyncFields, setSelectedSyncFields] = useState<ResumeField[]>([]);
  const [syncPanelOpen, setSyncPanelOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [ready, setReady] = useState(false);
  const [resumeStyle, setResumeStyle] = useState<ResumeStyle>("professional-navy");
  const [journeyVersionId, setJourneyVersionId] = useState("");
  const [journeyJobId, setJourneyJobId] = useState("");
  const [continueLoading, setContinueLoading] = useState(false);
  const [continueError, setContinueError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const versionId = new URLSearchParams(window.location.search).get("versionId") || "";
      const storageKey = versionId ? `${STORAGE_KEY}-${versionId}` : STORAGE_KEY;
      const sourceKey = versionId ? `${SOURCE_KEY}-${versionId}` : SOURCE_KEY;
      setJourneyVersionId(versionId);
      const stored = readStoredResume(storageKey, sourceKey);
      try { const storedStyle = localStorage.getItem(STYLE_KEY); if (storedStyle === "ats-safe" || storedStyle === "professional-navy") setResumeStyle(storedStyle); }
      catch (error) { console.error("Unable to restore resume style:", error); }
      try {
        const [latestSources, savedResponse] = await Promise.all([
          fetchSources(), fetch(versionId ? `/api/resume/latest?versionId=${encodeURIComponent(versionId)}` : "/api/resume/latest"),
        ]);
        const savedResult = await savedResponse.json();
        if (!active) return;
        setJourneyJobId(versionId ? String(savedResult.data?.jobId || "") : "");
        setSources(latestSources);
        const mapped = mapProfileToResume(latestSources.profile, latestSources.careerDNA);
        const saved = savedResult.success ? normalizeResume(savedResult.data?.resume ?? savedResult.data) : null;
        if (stored.resume) {
          setResumeData(stored.resume);
          setSourceSnapshot(stored.source);
          setGeneratedFromSources(!!stored.source);
        } else if (saved) {
          setResumeData(saved);
          setGeneratedFromSources(resumeHasSourceContent(saved) && resumeHasSourceContent(mapped));
          setSourceSnapshot(mapped);
        } else {
          setResumeData(mapped);
          setGeneratedFromSources(resumeHasSourceContent(mapped));
          setSourceSnapshot(mapped);
          if (resumeHasSourceContent(mapped)) {
            localStorage.setItem(storageKey, JSON.stringify(mapped));
            localStorage.setItem(sourceKey, JSON.stringify(mapped));
          } else {
            localStorage.removeItem(storageKey);
            localStorage.removeItem(sourceKey);
          }
        }
      } catch (error) {
        if (!active) return;
        console.error("Unable to load resume profile sources:", error);
        if (stored.resume) setResumeData(stored.resume);
        else setResumeData(emptyResume);
      } finally { if (active) setReady(true); }
    }
    void load();
    return () => { active = false; };
  }, []);

  const changeData = useCallback((next: ResumeData) => {
    setResumeData(next);
    setSaveState("idle");
    const versionId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("versionId") : null;
    const storageKey = versionId ? `${STORAGE_KEY}-${versionId}` : STORAGE_KEY;
    try { localStorage.setItem(storageKey, JSON.stringify(next)); }
    catch (error) { console.error("Unable to store local resume draft:", error); }
  }, []);

  async function generateFromSources() {
    if (!sources.profile && !sources.careerDNA) return;
    if (hasManualEdits(resumeData, sourceSnapshot) && !window.confirm("Regenerate resume from Career DNA? This may update fields using your latest profile and Career DNA data. Your manual edits will be replaced.")) return;
    setGenerating(true);
    try {
      const latest = await fetchSources();
      if (!latest.profile && !latest.careerDNA && !sources.profile && !sources.careerDNA) throw new Error("No profile or Career DNA data is available.");
      const current = retainAvailableSources(latest, sources);
      const mapped = mapProfileToResume(current.profile, current.careerDNA);
      setSources(current);
      setSourceSnapshot(mapped);
      setGeneratedFromSources(resumeHasSourceContent(mapped));
      changeData(mapped);
      localStorage.setItem(SOURCE_KEY, JSON.stringify(mapped));
    } catch (error) {
      console.error("Resume generation from profile failed:", error);
      window.alert("Unable to load your latest profile and Career DNA. Please try again.");
    } finally { setGenerating(false); }
  }

  async function inspectSourceUpdates() {
    setSyncing(true);
    try {
      const latest = await fetchSources();
      if (!latest.profile && !latest.careerDNA && !sources.profile && !sources.careerDNA) throw new Error("No profile or Career DNA data is available.");
      const current = retainAvailableSources(latest, sources);
      const mapped = mapProfileToResume(current.profile, current.careerDNA);
      setSources(current);
      const previous = sourceSnapshot ?? emptyResume;
      const changes = (Object.keys(mapped) as ResumeField[])
        .filter((field) => JSON.stringify(previous[field]) !== JSON.stringify(mapped[field]))
        .map((field) => ({ field, before: previous[field], after: mapped[field], safe: JSON.stringify(resumeData[field]) === JSON.stringify(previous[field]) }));
      setSourceChanges(changes);
      setSelectedSyncFields(changes.filter((change) => change.safe).map((change) => change.field));
      setSyncPanelOpen(true);
      if (!changes.length) setSyncPanelOpen(true);
    } catch (error) {
      console.error("Career DNA sync check failed:", error);
      window.alert("Unable to check for profile updates right now.");
    } finally { setSyncing(false); }
  }

  function applySourceUpdates() {
    const mapped = mapProfileToResume(sources.profile, sources.careerDNA);
    const next = { ...resumeData };
    for (const field of selectedSyncFields) (next as unknown as Record<ResumeField, unknown>)[field] = mapped[field];
    changeData(next);
    setSourceSnapshot(mapped);
    localStorage.setItem(SOURCE_KEY, JSON.stringify(mapped));
    setGeneratedFromSources(resumeHasSourceContent(mapped));
    setSyncPanelOpen(false);
  }

  async function saveResume() {
    setSaveState("saving");
    try {
      const storageKey = journeyVersionId ? `${STORAGE_KEY}-${journeyVersionId}` : STORAGE_KEY;
      localStorage.setItem(storageKey, JSON.stringify(resumeData));
      const response = await fetch("/api/resume/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume: resumeData, ...(journeyVersionId ? { versionId: journeyVersionId } : {}) }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Resume save failed.");
      setSaveState("saved");
    } catch (error) {
      if (process.env.NODE_ENV !== "production") console.error("Resume save failed:", error);
      setSaveState("error");
    }
  }

  async function continueToApply() {
    if (!journeyJobId || !journeyVersionId || continueLoading) return;
    setContinueLoading(true);
    setContinueError("");
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: journeyJobId, resumeVersionId: journeyVersionId }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to prepare this application.");
      window.location.href = `/ai-mentor?stage=applications&jobId=${encodeURIComponent(journeyJobId)}`;
    } catch (error) {
      setContinueError(error instanceof Error ? error.message : "Unable to prepare this application.");
    } finally {
      setContinueLoading(false);
    }
  }

  async function resetResume() {
    if (!window.confirm("Clear the current resume draft?")) return;
    changeData(emptyResume); setSourceSnapshot(null); setGeneratedFromSources(false);
    localStorage.removeItem(SOURCE_KEY);
    setSaveState("saving");
    try {
      const response = await fetch("/api/resume/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume: emptyResume, ...(journeyVersionId ? { versionId: journeyVersionId } : {}) }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Resume reset could not be saved.");
      setSaveState("saved");
    } catch (error) {
      if (process.env.NODE_ENV !== "production") console.error("Resume reset save failed:", error);
      setSaveState("error");
    }
  }

  const profileImported = !!sources.profile;
  const dnaImported = !!sources.careerDNA;
  const mappedSource = useMemo(() => mapProfileToResume(sources.profile, sources.careerDNA), [sources]);
  const profileNeedsDetails = !mappedSource.technicalSkills.length && !mappedSource.developmentSkills.length && !mappedSource.education.length && !mappedSource.projects.length && !mappedSource.experience.length;
  const importedSections = [
    ["Profile", profileImported && !!(mappedSource.name || mappedSource.email)],
    ["Career DNA", dnaImported], ["Skills", mappedSource.technicalSkills.length + mappedSource.developmentSkills.length > 0], ["Education", mappedSource.education.length > 0],
    ["Projects", mappedSource.projects.length > 0], ["Experience", mappedSource.experience.length > 0],
  ] as const;
  const editor = <ResumeForm data={resumeData} onChange={changeData} />;
  const changeStyle = (style: ResumeStyle) => { setResumeStyle(style); try { localStorage.setItem(STYLE_KEY, style); } catch (error) { console.error("Unable to save resume style:", error); } };
  return <main className="min-h-screen bg-slate-100 px-3 py-5 sm:px-6 sm:py-8">
    <div className="mx-auto max-w-[1600px] space-y-5">
      <header className="flex flex-col gap-1"><p className="text-sm font-semibold uppercase tracking-wide text-blue-700">CareerGuardian AI</p><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Resume Builder</h1><p className="text-sm text-slate-600">Your profile and Career DNA, shaped into an editable resume with Professional Navy and ATS Safe export styles.</p></header>
      {ready && (profileNeedsDetails || (!resumeHasSourceContent(resumeData) && !profileImported && !dnaImported)) && <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"><h2 className="font-semibold">Your Career Profile is incomplete.</h2><p className="mt-1">Add profile details or complete Career DNA to populate this resume. The editor remains available for manual updates.</p><div className="mt-3 flex flex-wrap gap-3"><Link href="/profile" className="rounded-lg bg-white px-3 py-2 font-medium text-blue-700">Complete Profile</Link><Link href="/career-dna" className="rounded-lg bg-white px-3 py-2 font-medium text-blue-700">Open Career DNA</Link><Link href="/profile" className="rounded-lg bg-white px-3 py-2 font-medium text-blue-700">Add Skills or Education</Link></div></section>}
      {ready && <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-slate-900">{generatedFromSources ? "Resume generated from your profile and Career DNA" : "Career profile data"}</h2><p className="text-sm text-slate-600">Imported facts remain editable. Sync checks preserve fields you changed manually.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={inspectSourceUpdates} disabled={syncing} className="rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50">{syncing ? "Checking..." : "Sync Career DNA"}</button><button type="button" onClick={generateFromSources} disabled={generating || (!profileImported && !dnaImported)} className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{generating ? "Generating..." : generatedFromSources ? "Regenerate from Career DNA" : "Generate from Career DNA"}</button></div></div>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs">{importedSections.map(([label, present]) => <li key={label} className={present ? "text-emerald-700" : "text-slate-400"}>{present ? "✓" : "–"} {label}{present ? " imported" : " unavailable"}</li>)}</ul>
      </section>}
      {syncPanelOpen && <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">Career DNA updates available</h2><p className="mt-1 text-sm text-slate-600">Select fields to update. Manually edited fields are unchecked and preserved.</p></div><button type="button" onClick={() => setSyncPanelOpen(false)} className="rounded border px-2 py-1 text-sm">Close</button></div>
        {!sourceChanges.length ? <p className="mt-4 text-sm text-slate-700">Your resume sources are up to date.</p> : <div className="mt-3 space-y-2">{sourceChanges.map((change) => <label key={change.field} className="flex items-start gap-2 rounded-lg bg-white p-3 text-sm"><input type="checkbox" checked={selectedSyncFields.includes(change.field)} disabled={!change.safe} onChange={(event) => setSelectedSyncFields((current) => event.target.checked ? [...current, change.field] : current.filter((field) => field !== change.field))} /><span className="min-w-0"><strong>{change.field}</strong>{!change.safe && <span className="ml-2 text-amber-700">Manual edit preserved</span>}<span className="mt-1 block break-words text-slate-600">{displaySourceValue(change.before)} → {displaySourceValue(change.after)}</span></span></label>)}</div>}
        {!!sourceChanges.length && <button type="button" onClick={applySourceUpdates} disabled={!selectedSyncFields.length} className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Update selected fields</button>}
      </section>}
      {journeyVersionId && ready && (!resumeData.name || !resumeData.email || !resumeData.education.length || !(resumeData.technicalSkills.length + resumeData.developmentSkills.length)) && <section className="border-y border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-950"><h2 className="font-black">INFORMATION REQUIRED</h2><p className="mt-1">Complete the missing name, email, education, or skills directly in the editor. No experience, projects, certificates, or achievements have been invented.</p></section>}
      {!ready ? <div className="rounded-xl bg-white p-8 text-center text-slate-600">Loading your profile and Career DNA...</div> : <><ResumePreview data={resumeData} onSave={saveResume} onReset={resetResume} saveState={saveState} editor={editor} style={resumeStyle} onStyleChange={changeStyle} /><ResumeInsightsPanel data={resumeData} />{journeyVersionId && saveState === "saved" && <section className="flex flex-col gap-3 border-y border-cyan-200 bg-cyan-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-slate-900">Resume reviewed and saved</h2><p className="text-sm text-slate-600">Your master resume remains unchanged.</p>{continueError && <p role="alert" className="mt-1 text-sm font-semibold text-red-700">{continueError}</p>}</div>{journeyJobId ? <button type="button" onClick={() => void continueToApply()} disabled={continueLoading} className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-60">{continueLoading ? "Preparing application..." : "CONTINUE TO APPLY"}</button> : <Link href="/ai-mentor?stage=matching" className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-3 font-bold text-white">CONTINUE TO JOB MATCHING</Link>}</section>}</>}
    </div>
  </main>;
}
