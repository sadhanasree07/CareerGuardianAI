"use client";

import { useState } from "react";
import { LoaderCircle, Plus, X } from "lucide-react";

export interface CareerProfile {
  areaOfInterest: string;
  dreamCompany: string;
  targetRole: string;
  preferredIndustry: string;
  education: string;
  skills: string[];
  weakSkills: string[];
  skillsToImprove: string[];
  preferredLocation: string;
  workPreference: string;
  experienceLevel: string;
  careerGoal: string;
  salaryExpectation: string;
  preferredDomain: string;
  shortTermGoal: string;
  longTermGoal: string;
}

interface Props {
  initialProfile: Partial<CareerProfile>;
  companies?: string[];
  roles?: string[];
  onSubmit: (profile: CareerProfile) => Promise<void>;
}

const fieldClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";
const interestOptions = ["Software Engineering", "Data & AI", "Cybersecurity", "Design", "Product Management", "Finance", "Healthcare", "Education", "Research", "Other"];
const industryOptions = ["Technology", "Finance", "Healthcare", "Education", "Manufacturing", "Consulting", "Government", "Media", "Other"];
const skillSuggestions = ["JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", "Java", "C++", "Communication", "Data Analysis", "Cloud", "Testing"];
const initialProfile: CareerProfile = {
  areaOfInterest: "", dreamCompany: "", targetRole: "", preferredIndustry: "", education: "", skills: [], weakSkills: [], skillsToImprove: [],
  preferredLocation: "", workPreference: "", experienceLevel: "", careerGoal: "", salaryExpectation: "", preferredDomain: "", shortTermGoal: "", longTermGoal: "",
};

function MultiValueField({ label, values, suggestions, onChange }: { label: string; values: string[]; suggestions: string[]; onChange: (values: string[]) => void }) {
  const [pending, setPending] = useState("");
  const add = (value: string) => {
    const next = value.trim();
    if (next && !values.some((item) => item.toLowerCase() === next.toLowerCase())) onChange([...values, next]);
    setPending("");
  };
  return <fieldset className="min-w-0">
    <legend className="text-sm font-semibold text-slate-700">{label}</legend>
    <div className="mt-2 flex flex-wrap gap-2">{suggestions.map((option) => {
      const selected = values.includes(option);
      return <button key={option} type="button" aria-pressed={selected} onClick={() => onChange(selected ? values.filter((item) => item !== option) : [...values, option])} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${selected ? "border-cyan-700 bg-cyan-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-cyan-600"}`}>{option}</button>;
    })}</div>
    <div className="mt-2 flex gap-2"><input className={fieldClass} value={pending} onChange={(event) => setPending(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(pending); } }} placeholder="Add another" /><button type="button" aria-label={`Add ${label}`} onClick={() => add(pending)} className="mt-1 grid aspect-square w-11 shrink-0 place-items-center rounded-lg bg-slate-900 text-white"><Plus className="h-4 w-4" /></button></div>
    {values.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{values.map((value) => <span key={value} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800">{value}<button type="button" aria-label={`Remove ${value}`} onClick={() => onChange(values.filter((item) => item !== value))}><X className="h-3 w-3" /></button></span>)}</div>}
    {!values.length && <button type="button" onClick={() => onChange(["NOT PROVIDED"])} className="mt-2 text-xs font-medium text-cyan-800 underline">I have no items to add</button>}
  </fieldset>;
}

export default function CareerProfileSurvey({ initialProfile: savedProfile, companies = [], roles = [], onSubmit }: Props) {
  const [profile, setProfile] = useState<CareerProfile>({ ...initialProfile, ...savedProfile });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const update = (field: keyof CareerProfile, value: string | string[]) => setProfile((current) => ({ ...current, [field]: value }));
  const textField = (field: keyof CareerProfile, label: string, placeholder = "") => <label className="block text-sm font-semibold text-slate-700">{label}<input className={fieldClass} value={String(profile[field] || "")} onChange={(event) => update(field, event.target.value)} placeholder={placeholder} /></label>;
  const selectField = (field: keyof CareerProfile, label: string, values: string[]) => <label className="block text-sm font-semibold text-slate-700">{label}<select className={fieldClass} value={String(profile[field] || "")} onChange={(event) => update(field, event.target.value)}><option value="">Choose an option</option>{values.map((value) => <option key={value} value={value}>{value}</option>)}<option value="NOT PROVIDED">Not provided</option></select></label>;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try { await onSubmit(profile); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save your profile."); }
    finally { setSubmitting(false); }
  }

  return <form onSubmit={submit} className="space-y-6 border-y border-slate-200 py-7">
    <header><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Career profile</p><h2 className="mt-2 text-2xl font-black text-slate-950">Build your career profile</h2><p className="mt-2 text-sm text-slate-600">Existing profile details are prefilled. Add missing answers or choose “Not provided”; your recommendations will not assume facts you haven’t supplied.</p></header>
    <div className="grid gap-5 md:grid-cols-2">
      {selectField("areaOfInterest", "Area of interest", interestOptions)}
      <label className="block text-sm font-semibold text-slate-700">Dream company<input className={fieldClass} list="dream-company-suggestions" value={profile.dreamCompany} onChange={(event) => update("dreamCompany", event.target.value)} placeholder="Search or enter any company" /><datalist id="dream-company-suggestions">{companies.map((company) => <option key={company} value={company} />)}</datalist></label>
      <label className="block text-sm font-semibold text-slate-700">Dream job / target role<input className={fieldClass} list="target-role-suggestions" value={profile.targetRole} onChange={(event) => update("targetRole", event.target.value)} placeholder="Search or enter a role" /><datalist id="target-role-suggestions">{roles.map((role) => <option key={role} value={role} />)}</datalist></label>
      {selectField("preferredIndustry", "Preferred industry", industryOptions)}
      {textField("education", "Education", "Degree, institution, current year")}
      <div className="md:col-span-2 grid gap-5 md:grid-cols-3">
        <MultiValueField label="Current skills" values={profile.skills} suggestions={skillSuggestions} onChange={(values) => update("skills", values)} />
        <MultiValueField label="Weak skills" values={profile.weakSkills} suggestions={skillSuggestions} onChange={(values) => update("weakSkills", values)} />
        <MultiValueField label="Skills to improve" values={profile.skillsToImprove} suggestions={skillSuggestions} onChange={(values) => update("skillsToImprove", values)} />
      </div>
      {textField("preferredLocation", "Preferred location", "City, region, country, or remote")}
      {selectField("workPreference", "Work preference", ["On-site", "Hybrid", "Remote", "Flexible"])}
      {selectField("experienceLevel", "Experience level", ["Student", "Entry level", "1-3 years", "3-5 years", "5+ years", "Career changer"])}
      {textField("careerGoal", "Career goal")}
      {textField("salaryExpectation", "Expected salary", "Amount and currency or NOT PROVIDED")}
      <label className="block text-sm font-semibold text-slate-700">Preferred technology / domain<input className={fieldClass} list="preferred-domain-options" value={profile.preferredDomain} onChange={(event) => update("preferredDomain", event.target.value)} placeholder="Choose or enter a domain" /><datalist id="preferred-domain-options">{["Frontend", "Backend", "Full Stack", "Data Science", "Artificial Intelligence", "Cloud", "Cybersecurity", "Mobile", "Embedded Systems", "VLSI", "Product Design", "NOT PROVIDED"].map((domain) => <option key={domain} value={domain} />)}</datalist></label>
      {textField("shortTermGoal", "Short-term goal", "What do you want to achieve in the next 3-6 months?")}
      {textField("longTermGoal", "Long-term goal", "What do you want to achieve in the next 2-5 years?")}
    </div>
    {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
    <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 font-bold text-white disabled:opacity-60">{submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}{submitting ? "Saving profile and building your plan..." : "Save profile and continue"}</button>
  </form>;
}