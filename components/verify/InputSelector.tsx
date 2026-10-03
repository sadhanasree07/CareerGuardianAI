"use client";

import { AudioLines, BriefcaseBusiness, Link2, MessageSquareText, Type } from "lucide-react";

interface InputSelectorProps {
  selected: string;
  onSelect: (type: string) => void;
  recordingTitle?: string;
  recordingDescription?: string;
}

const options = [
  { id: "whatsapp", title: "WhatsApp", subtitle: "Screenshot or pasted chat", method: "Screenshot or Text", icon: MessageSquareText },
  { id: "job", title: "Job Offer / Recruitment Document", subtitle: "Image, PDF or pasted recruitment text", method: "Image, PDF or Text", icon: BriefcaseBusiness },
  { id: "url", title: "Job URL", subtitle: "Paste an opportunity link", method: "URL", icon: Link2 },
  { id: "text", title: "Text / Chat History", subtitle: "Paste recruiter messages or conversation history", method: "Text", icon: Type },
  { id: "recording", title: "Call / Audio / Video", subtitle: "Analyze a recruitment recording", method: "Audio or Video", icon: AudioLines },
];

export default function InputSelector({ selected, onSelect, recordingTitle, recordingDescription }: InputSelectorProps) {
  const translatedOptions = options.map((option) => option.id === "recording" ? { ...option, title: recordingTitle || option.title, subtitle: recordingDescription || option.subtitle } : option);
  return (
    <section className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
      <h2 className="text-2xl font-bold text-slate-900">Choose Recruitment Source</h2>
      <p className="mt-2 text-slate-600">Choose the format you have. Messages can be pasted directly.</p>
      <div className="mt-6 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {translatedOptions.map(({ id, title, subtitle, method, icon: Icon }) => {
          const active = selected === id;
          return (
            <button key={id} type="button" aria-pressed={active} onClick={() => onSelect(id)}
              className={`flex h-full min-h-56 flex-col rounded-2xl border-2 p-5 text-left transition focus-visible:outline-offset-2 ${active ? "border-blue-600 bg-blue-50 shadow-md" : "border-slate-200 hover:border-cyan-400"}`}>
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                <Icon className="h-6 w-6" />
              </span>
              <span className="mt-4 flex min-h-12 items-start font-bold leading-6 text-slate-900">{title}</span>
              <span className="mt-1 flex-1 text-sm leading-5 text-slate-500">{subtitle}</span>
              <span className="mt-4 inline-flex self-start rounded-full bg-white px-3 py-1 text-xs font-semibold leading-5 text-blue-700 ring-1 ring-blue-100">Input: {method}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
