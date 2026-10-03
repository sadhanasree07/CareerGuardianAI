"use client";

import { useState } from "react";
import type { ResumeData, ResumeEducation, ResumeExperience, ResumeProject } from "./resumeTypes";

interface Props { data: ResumeData; onChange: (data: ResumeData) => void; }
const fieldClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function TextField({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  const trimmed = value.trim();
  const invalidEmail = type === "email" && trimmed.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  let validUrl = false;
  if (type === "url" && trimmed.length > 0) {
    try { const parsed = new URL(trimmed); validUrl = (parsed.protocol === "https:" || parsed.protocol === "http:") && !!parsed.hostname; }
    catch { validUrl = false; }
  }
  const invalidUrl = type === "url" && trimmed.length > 0 && !validUrl;
  const invalid = invalidEmail || invalidUrl;
  return <label className="block text-sm font-medium text-slate-700">{label}<input aria-invalid={invalid || undefined} className={`${fieldClass} ${invalid ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />{invalid && <span className="mt-1 block text-xs font-normal text-red-600">{invalidEmail ? "Enter a valid email address." : "Use a full URL beginning with https:// or http://."}</span>}</label>;
}

function TextArea({ label, value, onChange, placeholder = "", improve }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; improve?: "summary" | "description" }) {
  const [improving, setImproving] = useState(false);
  const [message, setMessage] = useState("");
  async function improveText() {
    if (!improve || !value.trim() || improving) return;
    setImproving(true); setMessage("");
    try {
      const response = await fetch("/api/resume/improve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: value, type: improve }) });
      const result = await response.json();
      if (!response.ok || !result.success || typeof result.data?.text !== "string") throw new Error(result.message || "Unable to improve text.");
      onChange(result.data.text); setMessage("Wording updated. Review it for accuracy.");
    } catch (error) {
      console.error("Resume wording improvement failed:", error);
      setMessage(error instanceof Error ? error.message : "Unable to improve text right now.");
    } finally { setImproving(false); }
  }
  return <label className="block text-sm font-medium text-slate-700">{label}{improve && <button type="button" disabled={!value.trim() || improving} onClick={improveText} className="ml-2 rounded border px-2 py-1 text-xs font-medium text-blue-700 disabled:opacity-50">{improving ? "Improving..." : "Improve with AI"}</button>}<textarea className={`${fieldClass} min-h-24 resize-y`} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />{message && <span className="mt-1 block text-xs font-normal text-slate-600">{message}</span>}</label>;
}

function Repeatable<T>({ title, items, create, render, onChange }: { title: string; items: T[]; create: () => T; render: (item: T, update: (value: T) => void) => React.ReactNode; onChange: (items: T[]) => void }) {
  return <section className="border-t border-slate-200 pt-5">
    <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-slate-900">{title}</h3><button type="button" className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50" onClick={() => onChange([...items, create()])}>Add</button></div>
    <div className="space-y-4">{items.map((item, index) => <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4" key={`${title}-${index}`}>
      <div className="flex justify-end gap-2">
        <button type="button" aria-label={`Move ${title} item up`} disabled={index === 0} className="rounded border px-2 py-1 text-sm disabled:opacity-40" onClick={() => { const next = [...items]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next); }}>↑</button>
        <button type="button" aria-label={`Move ${title} item down`} disabled={index === items.length - 1} className="rounded border px-2 py-1 text-sm disabled:opacity-40" onClick={() => { const next = [...items]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; onChange(next); }}>↓</button>
        <button type="button" className="rounded border border-red-200 px-2 py-1 text-sm text-red-700" onClick={() => onChange(items.filter((_, current) => current !== index))}>Delete</button>
      </div>
      {render(item, (value) => onChange(items.map((current, currentIndex) => currentIndex === index ? value : current)))}
    </div>)}</div>
  </section>;
}

export default function ResumeForm({ data, onChange }: Props) {
  const set = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => onChange({ ...data, [key]: value });
  const listField = (title: string, key: "technicalSkills" | "developmentSkills" | "softSkills" | "certifications" | "achievements" | "languages" | "references") => <Repeatable<string> title={title} items={data[key]} create={() => ""} onChange={(items) => set(key, items)} render={(item, update) => <TextField label={title.slice(0, -1) || title} value={item} onChange={update} />} />;
  const patchItem = <T extends object>(item: T, update: (value: T) => void, field: keyof T, value: string) => update({ ...item, [field]: value });

  return <div className="space-y-5">
    <section><h2 className="mb-3 font-semibold text-slate-900">Personal information</h2><div className="grid gap-3 sm:grid-cols-2">
      <TextField label="Full name" value={data.name} onChange={(value) => set("name", value)} />
      <TextField label="Professional title" value={data.title} onChange={(value) => set("title", value)} placeholder="e.g. Product Designer" />
      <TextField label="Email" type="email" value={data.email} onChange={(value) => set("email", value)} />
      <TextField label="Phone" value={data.phone} onChange={(value) => set("phone", value)} />
      <TextField label="Location" value={data.location} onChange={(value) => set("location", value)} />
      <TextField label="LinkedIn URL" type="url" value={data.linkedin} onChange={(value) => set("linkedin", value)} />
      <TextField label="GitHub URL" type="url" value={data.github} onChange={(value) => set("github", value)} />
      <TextField label="Portfolio URL" type="url" value={data.portfolio} onChange={(value) => set("portfolio", value)} />
      <TextField label="Profile photo URL (optional)" type="url" value={data.photoUrl} onChange={(value) => set("photoUrl", value)} />
    </div></section>
    <TextArea label="Professional summary" value={data.professionalSummary} onChange={(value) => set("professionalSummary", value)} placeholder="Summarize your experience, strengths, and the work you want to do. Use only details that are true for you." improve="summary" />
    <Repeatable<ResumeEducation> title="Education" items={data.education} create={() => ({ degree: "", institution: "", location: "", startDate: "", endDate: "", grade: "" })} onChange={(items) => set("education", items)} render={(item, update) => <div className="grid gap-3 sm:grid-cols-2">
      <TextField label="Degree" value={item.degree} onChange={(value) => patchItem(item, update, "degree", value)} /><TextField label="Institution" value={item.institution} onChange={(value) => patchItem(item, update, "institution", value)} />
      <TextField label="Location" value={item.location} onChange={(value) => patchItem(item, update, "location", value)} /><TextField label="Grade / CGPA" value={item.grade} onChange={(value) => patchItem(item, update, "grade", value)} />
      <TextField label="Start date" value={item.startDate} onChange={(value) => patchItem(item, update, "startDate", value)} /><TextField label="End date" value={item.endDate} onChange={(value) => patchItem(item, update, "endDate", value)} />
    </div>} />
    {listField("Technical skills", "technicalSkills")}{listField("Development", "developmentSkills")}{listField("Soft skills", "softSkills")}
    <Repeatable<ResumeProject> title="Projects" items={data.projects} create={() => ({ title: "", description: "", technologies: "", role: "", link: "" })} onChange={(items) => set("projects", items)} render={(item, update) => <div className="space-y-3">
      <TextField label="Project title" value={item.title} onChange={(value) => patchItem(item, update, "title", value)} />{!item.description.trim() && <p className="text-xs text-amber-800">Add a factual description and technologies used to strengthen this project. Nothing will be inferred from the title alone.</p>}<TextArea label="Description" value={item.description} onChange={(value) => patchItem(item, update, "description", value)} improve="description" /><div className="grid gap-3 sm:grid-cols-2"><TextField label="Technologies" value={item.technologies} onChange={(value) => patchItem(item, update, "technologies", value)} /><TextField label="Role" value={item.role} onChange={(value) => patchItem(item, update, "role", value)} /><TextField label="Project link" type="url" value={item.link} onChange={(value) => patchItem(item, update, "link", value)} /></div>
    </div>} />
    <Repeatable<ResumeExperience> title="Experience / internships" items={data.experience} create={() => ({ type: "experience", organization: "", role: "", location: "", startDate: "", endDate: "", description: "" })} onChange={(items) => set("experience", items)} render={(item, update) => <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">Entry type<select className={fieldClass} value={item.type} onChange={(event) => patchItem(item, update, "type", event.target.value as ResumeExperience["type"])}><option value="experience">Work experience</option><option value="internship">Internship</option></select></label>
      <div className="grid gap-3 sm:grid-cols-2"><TextField label="Organization" value={item.organization} onChange={(value) => patchItem(item, update, "organization", value)} /><TextField label="Role" value={item.role} onChange={(value) => patchItem(item, update, "role", value)} /><TextField label="Location" value={item.location} onChange={(value) => patchItem(item, update, "location", value)} /><TextField label="Start date" value={item.startDate} onChange={(value) => patchItem(item, update, "startDate", value)} /><TextField label="End date" value={item.endDate} onChange={(value) => patchItem(item, update, "endDate", value)} /></div>
      <TextArea label="Description" value={item.description} onChange={(value) => patchItem(item, update, "description", value)} improve="description" />
      {item.type === "internship" && !item.description.trim() && <p className="text-xs text-amber-800">Add internship responsibilities to strengthen this section. Company names are shown without invented duties.</p>}
    </div>} />
    {listField("Certifications", "certifications")}{listField("Achievements", "achievements")}{listField("Languages", "languages")}{listField("References", "references")}
  </div>;
}
