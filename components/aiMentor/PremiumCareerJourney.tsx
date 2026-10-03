"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, LoaderCircle } from "lucide-react";
import CareerProfileSurvey, { type CareerProfile } from "@/components/aiMentor/CareerProfileSurvey";
import MentorHeader from "@/components/aiMentor/MentorHeader";
import SuggestedQuestions from "@/components/aiMentor/SuggestedQuestions";
import ChatBox from "@/components/aiMentor/ChatBox";
import MentorResponse from "@/components/aiMentor/MentorResponse";

type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type JourneyState = Record<string, any>;
type Job = Record<string, any>;

const taskStatuses: TaskStatus[] = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];
const questions = [
  "What should I do today?",
  "What skills am I missing?",
  "Prepare me for my dream company.",
  "Am I ready for my target role?",
  "Give me an interview question.",
  "What should I improve this week?",
];

function allTasks(roadmap: JourneyState) {
  return [
    ...(Array.isArray(roadmap?.phases) ? roadmap.phases.flatMap((phase: JourneyState) => Array.isArray(phase.tasks) ? phase.tasks : []) : []),
    ...(Array.isArray(roadmap?.dailyTasks) ? roadmap.dailyTasks : []),
  ];
}

function meter(label: string, completed: number, total: number) {
  const percent = total ? Math.round(completed / total * 100) : 0;
  return <div key={label}><div className="flex justify-between gap-3 text-sm"><span className="font-semibold text-slate-700">{label}</span><span className="text-slate-500">{completed} / {total}{label === "Today's Progress" || label.endsWith("Progress") ? ` · ${percent}%` : ""}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-cyan-700 transition-all" style={{ width: `${percent}%` }} /></div></div>;
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

export default function PremiumCareerJourney() {
  const [state, setState] = useState<JourneyState | null>(null);
  const [answer, setAnswer] = useState("");
  const [assistantUsed, setAssistantUsed] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const [section, setSection] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [savingTask, setSavingTask] = useState("");
  const [readinessLoading, setReadinessLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeVersionId, setResumeVersionId] = useState("");
  const [resumeMissing, setResumeMissing] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsUnavailable, setJobsUnavailable] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [targetingJobId, setTargetingJobId] = useState("");
  const [targetedResume, setTargetedResume] = useState<JourneyState | null>(null);
  const [application, setApplication] = useState<JourneyState | null>(null);
  const [applicationError, setApplicationError] = useState("");
  const [error, setError] = useState("");

  async function loadContext() {
    const response = await fetch("/api/mentor", { cache: "no-store", credentials: "same-origin" });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "Unable to load your career plan.");
    setState(result);
    setAssistantUsed(Boolean(result.careerAssistantInteractedAt));
    if (result.careerResume?._id) setResumeVersionId(String(result.careerResume._id));
    if (result.careerJourneyStage === "RESUME_REVIEWED" || result.careerJourneyStage === "MATCHING") setSection("matching");
    if (["TARGETED_RESUME_GENERATED", "TARGETED_RESUME"].includes(result.careerJourneyStage)) setSection("matching");
    if (result.careerJourneyStage === "READY_TO_APPLY") setSection("applications");
  }

  useEffect(() => {
    let active = true;
    fetch("/api/mentor", { cache: "no-store", credentials: "same-origin" })
      .then(async (response) => {
        let result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Unable to load your career plan.");
        const today = new Date().toISOString().slice(0, 10);
        if (result.careerProfile?.completedAt && result.careerRoadmap?.dailyPlanDate !== today) {
          try {
            const dailyResponse = await fetch("/api/mentor/daily", { method: "POST" });
            if (dailyResponse.ok) {
              const refreshed = await fetch("/api/mentor", { cache: "no-store", credentials: "same-origin" });
              if (refreshed.ok) result = await refreshed.json();
            } else if (active) setError("Today's career plan could not be refreshed; your saved roadmap is still available.");
          } catch {
            if (active) setError("Today's career plan could not be refreshed; your saved roadmap is still available.");
          }
        }
        if (active) {
          setState(result);
          setAssistantUsed(Boolean(result.careerAssistantInteractedAt));
          if (result.careerResume?._id) setResumeVersionId(String(result.careerResume._id));
          const savedTarget = result.targetedResumes?.[0];
          if (savedTarget) setTargetedResume({
            versionId: savedTarget.id,
            optimization: savedTarget.optimization,
            job: { _id: savedTarget.jobId, company: savedTarget.targetCompany, jobTitle: savedTarget.targetRole },
          });
          const activeApplication = (result.applications || []).find((item: JourneyState) => ["READY_TO_APPLY", "APPLICATION_STARTED"].includes(item.status));
          if (activeApplication) setApplication(activeApplication);
          const requestedStage = new URLSearchParams(window.location.search).get("stage");
          if (requestedStage === "matching" && ["RESUME_REVIEWED", "MATCHING", "TARGETED_RESUME_GENERATED", "TARGETED_RESUME", "READY_TO_APPLY"].includes(result.careerJourneyStage)) setSection("matching");
          else if (requestedStage === "applications" && result.careerJourneyStage === "READY_TO_APPLY") setSection("applications");
          else if (["TARGETED_RESUME_GENERATED", "TARGETED_RESUME"].includes(result.careerJourneyStage)) setSection("matching");
          else if (result.careerJourneyStage === "READY_TO_APPLY") setSection("applications");
          if (result.careerJourneyStage === "READY_FOR_JOB") setSection("ready");
        }
      })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Unable to load your career plan."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const profile = state?.careerProfile || {};
  const roadmap = state?.careerRoadmap || {};
  const phases = Array.isArray(roadmap.phases) ? roadmap.phases : [];
  const dailyTasks = Array.isArray(roadmap.dailyTasks) ? roadmap.dailyTasks : [];
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = dailyTasks.filter((task: JourneyState) => task.day === today);
  const taskList = useMemo(() => allTasks(roadmap), [roadmap]);
  const profileComplete = Boolean(profile.completedAt);
  const journeyReady = profileComplete && Boolean(state?.careerAnalysis) && phases.length === 5 && todayTasks.length === 6;
  const readiness = state?.jobReadinessCheck || null;
  const savedResume = state?.careerResume || null;
  const targetRole = String(profile.targetRole || "");
  const dreamCompany = String(profile.dreamCompany || "");

  async function submitProfile(careerProfile: CareerProfile) {
    const response = await fetch("/api/mentor/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ careerProfile }) });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "Unable to save your career profile.");
    await loadContext();
    setAssistantUsed(false);
    setAnswer("");
    setSection("assistant");
  }

  async function askQuestion(question: string) {
    const response = await fetch("/api/mentor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "AI Mentor could not answer.");
    setAnswer(result.answer);
    setAssistantUsed(true);
  }

  async function generateCareerAnalysis() {
    setAnalysisLoading(true); setError("");
    try {
      const response = await fetch("/api/mentor/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ generateAnalysis: true }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to analyze your career profile.");
      await loadContext();
      setSection("analysis");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to analyze your career profile."); }
    finally { setAnalysisLoading(false); }
  }

  async function updateTask(taskId: string, status: TaskStatus) {
    setSavingTask(taskId);
    try {
      const response = await fetch("/api/mentor/roadmap", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId, status }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to update task.");
      setState((current) => current ? { ...current, careerRoadmap: result.careerRoadmap } : current);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to update task."); }
    finally { setSavingTask(""); }
  }

  async function checkReadiness() {
    setReadinessLoading(true); setError("");
    try {
      const response = await fetch("/api/mentor/readiness", { method: "POST" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to run Job Readiness Check.");
      setState((current) => current ? { ...current, jobReadinessCheck: result.readiness, careerJourneyStage: result.journeyStage } : current);
      setSection("ready");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to run Job Readiness Check."); }
    finally { setReadinessLoading(false); }
  }

  async function generateResume() {
    setResumeLoading(true); setError("");
    try {
      const response = await fetch("/api/resume/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ careerFlow: true }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to generate your resume.");
      setResumeVersionId(result.versionId);
      setResumeMissing(result.informationRequired || []);
      await loadContext();
      setSection("ready");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to generate your resume."); }
    finally { setResumeLoading(false); }
  }

  async function loadJobs() {
    setJobsLoading(true); setJobsUnavailable(false); setError("");
    try {
      const response = await fetch("/api/jobs/recommendations?journey=premium", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Job matching is unavailable.");
      setJobs(result.jobs || []);
      setJobsUnavailable(Boolean(result.liveJobSourceUnavailable));
      setState((current) => current ? { ...current, careerJourneyStage: "MATCHING" } : current);
      setSection("matching");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Job matching is unavailable."); }
    finally { setJobsLoading(false); }
  }

  async function optimizeForJob(job: Job) {
    if (!resumeVersionId) return;
    setTargetingJobId(String(job._id)); setError("");
    try {
      const response = await fetch(`/api/jobs/${encodeURIComponent(String(job._id))}/optimize`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeVersionId }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to prepare a targeted resume.");
      setTargetedResume({ versionId: result.versionId, optimization: result.optimization, job });
      setState((current) => current ? { ...current, careerJourneyStage: "TARGETED_RESUME_GENERATED" } : current);
      setSection("matching");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to prepare a targeted resume."); }
    finally { setTargetingJobId(""); }
  }

  async function continueToApply(job: Job, versionId: string) {
    setApplicationError("");
    try {
      const response = await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId: String(job._id), resumeVersionId: versionId }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to prepare application.");
      setApplication(result.application);
      setState((current) => current ? { ...current, careerJourneyStage: "READY_TO_APPLY", applications: [result.application, ...(current.applications || []).filter((item: JourneyState) => String(item._id) !== String(result.application._id))] } : current);
      setSection("applications");
    } catch (reason) { setApplicationError(reason instanceof Error ? reason.message : "Unable to prepare application."); }
  }

  async function updateApplication(id: string, status: string) {
    const response = await fetch(`/api/applications/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "Unable to update application status.");
    setState((current) => current ? { ...current, applications: (current.applications || []).map((item: JourneyState) => String(item._id) === id ? result.application : item) } : current);
    setApplication(result.application);
  }

  async function applicationStarted(id: string) {
    try { await updateApplication(id, "APPLICATION_STARTED"); }
    catch (reason) { setApplicationError(reason instanceof Error ? reason.message : "Unable to record application start."); }
  }

  const completedToday = todayTasks.filter((task: JourneyState) => task.status === "COMPLETED").length;
  const completedWeek = taskList.filter((task: JourneyState) => task.completedAt && Date.now() - new Date(task.completedAt).getTime() <= 7 * 24 * 60 * 60 * 1000).length;
  const skillTasks = taskList.filter((task: JourneyState) => task.skill);
  const completedSkills = skillTasks.filter((task: JourneyState) => task.status === "COMPLETED").length;
  const completedCareer = taskList.filter((task: JourneyState) => task.status === "COMPLETED").length;

  if (loading) return <main className="min-h-[60vh] px-6 py-16 text-center text-slate-600">Loading your Personal Career Assistant...</main>;
  if (error && !state) return <main className="min-h-[60vh] px-6 py-16 text-center font-semibold text-red-700">{error}</main>;

  const nav = [
    ["profile", "Career Profile"], ["assistant", "Personal Assistant"], ["analysis", "Career Analysis"], ["roadmap", "Career Roadmap"],
    ["companion", "Daily Companion"], ["ready", "Ready for Job"], ["matching", "Job Matches"], ["dream", "Dream Company"], ["applications", "Applications"],
  ];

  return <main className="min-h-screen bg-slate-50">
    <section className="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-6">
      <MentorHeader />
      <nav aria-label="Career journey" className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-3">{nav.map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setSection(id)} className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold ${section === id ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-cyan-50"}`}>{label}</a>)}</nav>
      {error && <p role="alert" className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</p>}

      {!profileComplete ? <section id="profile" className="scroll-mt-6"><CareerProfileSurvey initialProfile={profile} companies={state?.companyOptions || []} roles={state?.roleOptions || []} onSubmit={submitProfile} /></section> : <>
        <section id="profile" className="scroll-mt-6 border-b border-slate-200 pb-7">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Career profile · SELF-REPORTED</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">{profile.targetRole} {dreamCompany ? `at ${dreamCompany}` : ""}</h2>
          <p className="mt-2 text-slate-600">{profile.areaOfInterest} · {profile.preferredIndustry} · {profile.preferredLocation}</p>
          <details className="mt-4"><summary className="cursor-pointer text-sm font-semibold text-cyan-800">Review or update profile</summary><CareerProfileSurvey initialProfile={profile} companies={state?.companyOptions || []} roles={state?.roleOptions || []} onSubmit={submitProfile} /></details>
        </section>

        <section id="assistant" className="scroll-mt-6 border-b border-slate-200 pb-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Personal career assistant</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Ask about your next move</h2>
          <div className="mt-5 grid gap-6 lg:grid-cols-3"><div className="space-y-3">{questions.map((question) => <button key={question} type="button" onClick={() => void askQuestion(question).catch((reason) => setError(reason.message))} className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:border-cyan-600">{question}</button>)}<SuggestedQuestions onSelect={(question) => { void askQuestion(question).catch((reason) => setError(reason.message)); }} /></div><div className="space-y-5 lg:col-span-2"><ChatBox key={chatKey} onResponse={(response) => { setAnswer(response); setAssistantUsed(true); setChatKey((key) => key + 1); }} /><MentorResponse answer={answer} /></div></div>
          {!state?.careerAnalysis && assistantUsed && <button type="button" onClick={() => void generateCareerAnalysis()} disabled={analysisLoading} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 font-bold text-white disabled:opacity-60">{analysisLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}{analysisLoading ? "Analyzing your career profile..." : "CONTINUE TO CAREER ANALYSIS"}</button>}
        </section>

        {state?.careerAnalysis && state?.careerRoadmap && <>
        <section id="analysis" className="scroll-mt-6 border-b border-slate-200 pb-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Career analysis · INFERRED FROM YOUR PROFILE</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Your strengths and next opportunities</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">{[["Strengths", state?.careerAnalysis?.strengths], ["Weak areas", state?.careerAnalysis?.weakAreas], ["Skill gaps", state?.careerAnalysis?.skillGaps], ["Skills to improve", state?.careerAnalysis?.skillsToImprove], ["Recommended skills", state?.careerAnalysis?.recommendedSkills], ["Recommended learning order", state?.careerAnalysis?.learningOrder], ["Recommended roles", state?.careerAnalysis?.recommendedRoles], ["Interview preparation", state?.careerAnalysis?.interviewPreparationNeeds], ["Career recommendations", state?.careerAnalysis?.careerRecommendations]].map(([title, items]) => <div key={String(title)} className="border-l-2 border-cyan-700 pl-4"><h3 className="font-bold text-slate-900">{title}</h3>{Array.isArray(items) && items.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{items.map((item: string, index: number) => <li key={`${title}-${index}`}>{item}</li>)}</ul> : <p className="mt-2 text-sm text-slate-500">NOT PROVIDED</p>}</div>)}</div>
          <p className="mt-5 text-xs text-slate-500">Stored account data: KNOWN · Survey responses: SELF-REPORTED · Recommendations: INFERRED · Unanswered facts: NOT PROVIDED.</p>
        </section>

        <section id="roadmap" className="scroll-mt-6 border-b border-slate-200 pb-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Personal career roadmap</p><h2 className="mt-2 text-2xl font-black text-slate-950">Five phases, tracked from your actions</h2>
          <div className="mt-5 space-y-5">{phases.map((phase: JourneyState) => <section key={phase.id} className="border-l-2 border-slate-300 pl-5"><h3 className="font-black text-slate-900">{phase.title}</h3><div className="mt-3 space-y-3">{(phase.tasks || []).map((task: JourneyState) => <div key={task.id} className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-2">{task.status === "COMPLETED" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />}<div><p className="font-semibold text-slate-800">{task.title}</p><p className="mt-1 text-sm text-slate-500">{task.description}</p>{task.skill && <p className="mt-1 text-xs text-cyan-800">Skill: {task.skill}</p>}</div></div><select aria-label={`Task status: ${task.title}`} value={task.status as TaskStatus} disabled={savingTask === task.id} onChange={(event) => void updateTask(task.id, event.target.value as TaskStatus)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option value="NOT_STARTED">NOT STARTED</option><option value="IN_PROGRESS">IN PROGRESS</option><option value="COMPLETED">COMPLETED</option></select></div>)}</div></section>)}</div>
        </section>

        <section id="companion" className="scroll-mt-6 border-b border-slate-200 pb-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Daily career companion</p><h2 className="mt-2 text-2xl font-black text-slate-950">TODAY&apos;S CAREER PLAN</h2>
          <p className="mt-3 text-slate-700"><strong>Today&apos;s Focus:</strong> {todayTasks.find((task: JourneyState) => task.status !== "COMPLETED")?.title || todayTasks[0]?.title || "No daily plan available."}</p>
          {!todayTasks.length && <p className="mt-2 text-sm font-semibold text-amber-800">A daily plan is unavailable. Refresh the page to request today&apos;s plan.</p>}
          <div className="mt-4 grid gap-4 md:grid-cols-2">{todayTasks.map((task: JourneyState) => <label key={task.id} className="flex items-start gap-3 border-b border-slate-200 py-3"><input type="checkbox" checked={task.status === "COMPLETED"} onChange={(event) => void updateTask(task.id, event.target.checked ? "COMPLETED" : "NOT_STARTED")} className="mt-1 h-4 w-4 accent-cyan-700" /><span><strong className="block text-sm text-slate-900">{task.title}</strong><span className="mt-1 block text-xs text-slate-600">{task.description}</span><span className="mt-1 block text-[11px] font-semibold text-cyan-800">{formatStatus(task.category || "TASK")}</span></span></label>)}</div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2">{meter("Today's Progress", completedToday, todayTasks.length)}{meter("Weekly Progress", completedWeek, taskList.length)}{meter("Skill Progress", completedSkills, skillTasks.length)}{meter("Career Progress", completedCareer, taskList.length)}</div>
        </section>

        <section id="ready" className="scroll-mt-6 border-b border-slate-200 pb-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Next stage</p><h2 className="mt-2 text-2xl font-black text-slate-950">Ready for Job</h2>
          {!journeyReady ? <p className="mt-3 text-sm text-slate-600">Complete Career Profile, Analysis, Roadmap, and Daily Companion first.</p> : !readiness ? <><p className="mt-2 text-slate-600">Run a readiness check before a resume can be generated.</p><button type="button" onClick={() => void checkReadiness()} disabled={readinessLoading} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 font-bold text-white disabled:opacity-60">{readinessLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}{readinessLoading ? "Checking readiness..." : "READY FOR JOB"}</button></> : <>
            <h3 className="mt-5 text-lg font-black text-slate-900">JOB READINESS</h3><dl className="mt-3 grid gap-3 sm:grid-cols-2">{[["Career Profile", readiness.careerProfile], ["Education", readiness.education], ["Skills", (readiness.skills || []).join(", ") || "NOT PROVIDED"], ["Skill Gaps", (readiness.skillGaps || []).join(", ") || "NOT PROVIDED"], ["Experience", Array.isArray(readiness.experience) ? `${readiness.experience.length} entries` : readiness.experience], ["Resume Information", readiness.resumeInformation], ["Interview Readiness", typeof readiness.interviewReadiness === "object" ? `${readiness.interviewReadiness.score}% score` : readiness.interviewReadiness]].map(([label, value]) => <div key={String(label)} className="border-b border-slate-200 py-2"><dt className="text-xs font-bold uppercase text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{String(value || "NOT PROVIDED")}</dd></div>)}</dl>
            {!!readiness.recommendedImprovements?.length && <div className="mt-5"><h4 className="font-bold text-slate-900">Recommended improvements</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{readiness.recommendedImprovements.map((item: string) => <li key={item}>{item}</li>)}</ul></div>}
            {!!resumeMissing.length && <p className="mt-4 text-sm font-bold text-amber-800">INFORMATION REQUIRED: {resumeMissing.join(", ")}</p>}
            {savedResume ? <Link href={`/resume-builder?versionId=${encodeURIComponent(String(savedResume._id || resumeVersionId))}`} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 font-bold text-white">REVIEW / EDIT RESUME <ArrowRight className="h-4 w-4" /></Link> : <button type="button" onClick={() => void generateResume()} disabled={resumeLoading} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 font-bold text-white disabled:opacity-60">{resumeLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}{resumeLoading ? "Generating factual resume..." : "GENERATE RESUME"}</button>}
          </>}
        </section>
        </>}

        {(state?.careerJourneyStage === "RESUME_REVIEWED" || state?.careerJourneyStage === "MATCHING" || ["TARGETED_RESUME_GENERATED", "TARGETED_RESUME", "READY_TO_APPLY"].includes(state?.careerJourneyStage)) && <section id="matching" className="scroll-mt-6 border-b border-slate-200 pb-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Job matching</p><h2 className="mt-2 text-2xl font-black text-slate-950">Real opportunities for {targetRole || "your target role"}</h2><p className="mt-2 text-sm text-slate-600">CareerGuardian compatibility estimate only; this is not an employer score or hiring decision.</p>
          {!jobs.length && <button type="button" onClick={() => void loadJobs()} disabled={jobsLoading} className="mt-4 rounded-lg bg-slate-900 px-4 py-3 font-bold text-white">{jobsLoading ? "Matching..." : "CONTINUE TO JOB MATCHING"}</button>}
          {jobsUnavailable && <p className="mt-5 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 font-semibold text-amber-900">LIVE JOB SOURCE UNAVAILABLE</p>}
          {!jobsLoading && jobs.length === 0 && !jobsUnavailable && state?.careerJourneyStage !== "RESUME_REVIEWED" && <p className="mt-5 text-sm text-slate-600">No matching opportunities are currently available.</p>}
          <div className="mt-5 grid gap-5 lg:grid-cols-2">{jobs.map((job) => <article key={job._id} className="border border-slate-200 bg-white p-5"><div className="flex justify-between gap-3"><div><p className="font-bold text-cyan-800">{job.company}</p><h3 className="mt-1 text-xl font-black text-slate-950">{job.jobTitle}</h3></div><strong className="text-2xl text-emerald-700">{job.matchScore}%</strong></div><p className="mt-2 text-sm text-slate-600">{job.location} · {job.employmentType}</p><p className="mt-2 text-xs text-slate-500">Source: {job.source}</p><p className="mt-3 text-sm text-slate-700">Requirements: {(job.skills || []).join(", ") || "NOT PROVIDED BY SOURCE"}</p>{job.description && <details className="mt-3"><summary className="cursor-pointer text-sm font-semibold text-slate-700">View source job description</summary><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{job.description}</p></details>}<div className="mt-3 grid gap-3 sm:grid-cols-2"><div><h4 className="text-xs font-bold uppercase text-emerald-800">Matching skills</h4><p className="mt-1 text-sm text-slate-700">{(job.matchedSkills || []).join(", ") || "None identified"}</p></div><div><h4 className="text-xs font-bold uppercase text-amber-800">Missing skills</h4><p className="mt-1 text-sm text-slate-700">{(job.missingSkills || []).join(", ") || "None listed"}</p></div></div><p className="mt-3 text-xs text-slate-500">Why: {(job.matchedReasons || []).join("; ")}</p>{job.applicationUrlAvailable ? <p className="mt-4 break-all text-xs text-cyan-800">Official application URL: {job.jobUrl}</p> : <p className="mt-4 text-sm font-semibold text-amber-800">Official application URL unavailable.</p>}
            {!targetedResume ? <button type="button" onClick={() => void optimizeForJob(job)} disabled={Boolean(targetingJobId)} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{targetingJobId === String(job._id) ? "Preparing targeted resume..." : "OPTIMIZE RESUME FOR THIS JOB"}</button> : targetedResume.job?._id === job._id && <Link href={`/resume-builder?versionId=${encodeURIComponent(targetedResume.versionId)}`} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-bold text-white">REVIEW TARGETED RESUME <ArrowRight className="h-4 w-4" /></Link>}
          </article>)}</div>
          {targetedResume?.optimization && <section className="mt-6 border-y border-cyan-200 bg-cyan-50 px-5 py-4"><h3 className="font-black text-slate-900">Targeted resume recommendation</h3><div className="mt-3 grid gap-4 sm:grid-cols-2">{[["Matching Skills", targetedResume.optimization.matchingSkills], ["Missing Skills", targetedResume.optimization.missingSkills], ["Recommended Keywords", targetedResume.optimization.recommendedKeywords], ["Relevant Projects", targetedResume.optimization.relevantProjects?.map((item: JourneyState) => item.title)], ["Relevant Experience", targetedResume.optimization.relevantExperience?.map((item: JourneyState) => item.role || item.organization)], ["Resume Improvements", targetedResume.optimization.resumeImprovements]].map(([title, items]) => <div key={String(title)}><h4 className="text-xs font-bold uppercase text-slate-600">{title}</h4><p className="mt-1 text-sm text-slate-800">{Array.isArray(items) && items.length ? items.join("; ") : "NOT PROVIDED"}</p></div>)}</div></section>}
          {state?.careerJourneyStage === "TARGETED_RESUME" && targetedResume && <div className="mt-5"><button type="button" onClick={() => void continueToApply(targetedResume.job, targetedResume.versionId)} className="inline-flex items-center gap-2 rounded-lg bg-cyan-800 px-5 py-3 font-bold text-white">CONTINUE TO APPLY <ArrowRight className="h-4 w-4" /></button></div>}
        </section>}

        <section id="dream" className="scroll-mt-6 border-b border-slate-200 py-7"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">DREAM COMPANY</p><h2 className="mt-2 text-2xl font-black text-slate-950">{dreamCompany || "NOT PROVIDED"}</h2><p className="mt-2 text-slate-600">Target Role: {targetRole || "NOT PROVIDED"}</p><p className="mt-4 text-sm text-slate-600">{jobsUnavailable ? "LIVE JOB SOURCE UNAVAILABLE" : jobs.some((job) => String(job.company).toLowerCase() === dreamCompany.toLowerCase()) ? "Relevant opportunities are listed in Job Matches." : "No relevant live opportunities found in the available job source."}</p></section>

        <section id="applications" className="scroll-mt-6 py-7"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Application tracker</p><h2 className="mt-2 text-2xl font-black text-slate-950">Your applications</h2>{applicationError && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{applicationError}</p>}{application && <div className="mt-5 border border-cyan-200 bg-cyan-50 p-5"><p className="font-bold text-slate-900">{application.company} · {application.role}</p><p className="mt-1 text-sm text-slate-600">Source: {application.source}</p><a href={application.applicationUrl} target="_blank" rel="noreferrer" onClick={() => void applicationStarted(String(application._id))} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 font-bold text-white">OPEN OFFICIAL APPLICATION <ArrowRight className="h-4 w-4" /></a><p className="mt-2 text-xs text-slate-500">CareerGuardian does not submit applications. Confirm only after applying on the official platform.</p><button type="button" onClick={() => void updateApplication(String(application._id), "APPLIED").catch((reason) => setApplicationError(reason.message))} className="mt-4 block rounded-lg border border-cyan-800 px-4 py-2 text-sm font-bold text-cyan-900">MARK AS APPLIED</button></div>}
          <div className="mt-5 space-y-3">{(state?.applications || []).map((item: JourneyState) => <article key={item._id} className="flex flex-col gap-3 border-b border-slate-200 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-bold text-slate-900">{item.company} · {item.role}</h3><p className="mt-1 text-sm text-slate-600">{item.source} · {formatStatus(item.status)}</p></div><div className="flex flex-wrap items-center gap-3"><a href={item.applicationUrl} target="_blank" rel="noreferrer" onClick={() => void applicationStarted(String(item._id))} className="text-sm font-semibold text-cyan-800 underline">Official application</a><select aria-label={`Application status for ${item.company} ${item.role}`} value={item.status} onChange={(event) => void updateApplication(String(item._id), event.target.value).catch((reason) => setApplicationError(reason.message))} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"><option value="SAVED">SAVED</option><option value="READY_TO_APPLY">READY TO APPLY</option><option value="APPLICATION_STARTED">APPLICATION STARTED</option><option value="APPLIED">APPLIED</option><option value="INTERVIEW">INTERVIEW</option><option value="REJECTED">REJECTED</option><option value="OFFER">OFFER</option></select>{item.status !== "APPLIED" && <button type="button" onClick={() => void updateApplication(String(item._id), "APPLIED").catch((reason) => setApplicationError(reason.message))} className="text-sm font-bold text-slate-800">Mark as applied</button>}</div></article>)}</div>{!(state?.applications || []).length && !application && <p className="mt-4 text-sm text-slate-600">No applications tracked yet. Applications are never marked APPLIED automatically.</p>}</section>
      </>}
    </section>
  </main>;
}