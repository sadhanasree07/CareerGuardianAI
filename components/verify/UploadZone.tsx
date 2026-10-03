"use client";

import { useRef } from "react";
import { CloudUpload, FileText, Upload } from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";

interface UploadZoneProps {
  selected: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  inputMethod: "file" | "text";
  onInputMethodChange: (method: "file" | "text") => void;
  text: string;
  onTextChange: (text: string) => void;
  onUrlChange: (url: string) => void;
  url: string;
  combinePrevious?: boolean;
  onCombinePreviousChange?: (value: boolean) => void;
}

const textModes: Record<string, { title: string; placeholder: string; helper: string; button: string }> = {
  whatsapp: {
    title: "Paste WhatsApp conversation",
    placeholder: "Paste the WhatsApp conversation here...\n\n[12:41 PM] Recruiter:\nCongratulations! You have been shortlisted...",
    helper: "You can paste the complete conversation. CareerGuardian AI will analyze message context, requests, links, payment language, urgency and recruitment signals.",
    button: "Analyze WhatsApp Chat",
  },
  job: {
    title: "Paste Job / Recruitment Message",
    placeholder: "Paste the complete job offer, internship message, recruitment notice or placement message here...",
    helper: "Include the company name, recruiter message, role, salary, location, payment requests, contact information and any other available details.",
    button: "Verify Job Opportunity",
  },
  text: {
    title: "Paste Conversation or Message History",
    placeholder: "Paste the complete conversation or message history here...",
    helper: "Supports WhatsApp, SMS, Telegram, email, recruiter messages, job posts and copied conversation history.",
    button: "Analyze Conversation",
  },
};

export default function UploadZone({ selected, file, onFileChange, inputMethod, onInputMethodChange, text, onTextChange, onUrlChange, url, combinePrevious = false, onCombinePreviousChange }: UploadZoneProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const acceptsBoth = selected === "whatsapp" || selected === "job";
  const canPaste = selected === "text" || selected === "whatsapp" || selected === "job";
  const acceptsPdf = selected === "job";
  const effectiveMethod = selected === "text" ? "text" : canPaste ? inputMethod : "file";
  const mode = textModes[selected === "job" ? "job" : selected === "whatsapp" ? "whatsapp" : "text"];
  const acceptType = selected === "whatsapp" ? "image/*" : ".pdf,application/pdf,image/*";

  if (selected === "recording") {
    return (
      <section className="mt-8 rounded-3xl bg-white p-6 shadow-lg sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">{t("verify.recording.upload", "Upload Recording")}</h2>
        <p className="mt-2 text-slate-600">{t("verify.recording.helper", "Upload a permitted recruitment-related recording. Speech will be transcribed and important statements will be shown as evidence.")}</p>
        <p className="mt-3 text-sm text-slate-500">{t("verify.recording.formats", "Supported: MP3, WAV, M4A, OGG, WEBM, MP4, MOV · Up to 25 MB and 15 minutes")}</p>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{t("verify.recording.consent", "Only upload a recording you are permitted to share. It is processed for transcription and is not stored by the transcription endpoint.")}</div>
        <label className="mt-4 flex items-start gap-3 text-sm text-slate-700"><input type="checkbox" checked={combinePrevious} onChange={(event) => onCombinePreviousChange?.(event.target.checked)} className="mt-1" /><span>Compare with the previously analyzed opportunity on this device (optional).</span></label>
        <button type="button" onClick={() => inputRef.current?.click()} className="mt-6 w-full rounded-3xl border-2 border-dashed border-blue-300 bg-blue-50 p-10 text-center transition hover:border-blue-600 hover:bg-blue-100">
          <CloudUpload className="mx-auto h-14 w-14 text-blue-600" />
          <span className="mt-4 block text-xl font-bold">{t("verify.recording.upload", "Upload Recording")}</span>
          <span className="mt-2 block text-slate-500">MP3 · WAV · M4A · OGG · WEBM · MP4 · MOV</span>
          <span className="mx-auto mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"><Upload className="h-5 w-5" /> {t("verify.recording.browse", "Browse file")}</span>
        </button>
        <input ref={inputRef} type="file" accept=".mp3,.wav,.m4a,.ogg,.webm,.mp4,.mov,audio/*,video/*" className="hidden" onChange={(event) => onFileChange(event.target.files?.[0] || null)} />
        {file && <div className="mt-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4"><FileText className="h-8 w-8 text-green-600" /><div><p className="font-bold text-slate-800">{file.name}</p><p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p></div></div>}
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-lg sm:p-8">
      {selected === "url" ? (
        <>
          <h2 className="text-2xl font-bold text-slate-900">Paste Job Opportunity URL</h2>
          <p className="mt-2 text-slate-600">We’ll use the link as context in the recruitment verification.</p>
          <input type="url" value={url} onChange={(event) => onUrlChange(event.target.value)} placeholder="https://company.example/careers/job"
            className="mt-6 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500" />
        </>
      ) : (
        <>
          {acceptsBoth && (
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
              <button type="button" onClick={() => onInputMethodChange("file")} className={`flex min-h-10 items-center justify-center rounded-lg px-3 py-2 text-center text-sm font-semibold leading-5 ${effectiveMethod === "file" ? "bg-white text-blue-700 shadow" : "text-slate-600"}`}>
                {selected === "whatsapp" ? "Upload Screenshot" : selected === "job" ? "Upload Image/PDF" : "Upload File"}
              </button>
              <button type="button" onClick={() => onInputMethodChange("text")} className={`flex min-h-10 items-center justify-center rounded-lg px-3 py-2 text-center text-sm font-semibold leading-5 ${effectiveMethod === "text" ? "bg-white text-blue-700 shadow" : "text-slate-600"}`}>
                {selected === "whatsapp" ? "Paste Conversation" : "Paste Text"}
              </button>
            </div>
          )}
          {effectiveMethod === "text" && canPaste ? (
            <>
              <h2 className="text-2xl font-bold text-slate-900">{mode.title}</h2>
              <textarea rows={12} maxLength={30000} value={text} onChange={(event) => onTextChange(event.target.value)}
                placeholder={mode.placeholder} className="mt-5 w-full resize-y rounded-2xl border border-slate-300 p-4 leading-7 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              <p className="mt-3 text-sm leading-6 text-slate-500">{mode.helper}</p>
              {text.trim() && (
                <div className="mt-5 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-cyan-900">TEXT READY FOR ANALYSIS</p>
                    <p className="text-sm text-slate-600">Character count: {text.length.toLocaleString()} / 30,000</p>
                  </div>
                  <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm text-slate-700">{text}</p>
                  <button type="button" onClick={() => onTextChange("")} className="mt-3 text-sm font-semibold text-blue-700 underline">Clear</button>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-900">{selected === "whatsapp" ? "Upload WhatsApp Screenshot" : "Upload Job Offer / Recruitment Document"}</h2>
              <p className="mt-2 text-slate-600">Upload a recruitment notification, offer, internship poster or screenshot.</p>
              <button type="button" onClick={() => inputRef.current?.click()} className="mt-6 w-full cursor-pointer rounded-3xl border-2 border-dashed border-blue-300 bg-blue-50 p-10 text-center transition hover:border-blue-600 hover:bg-blue-100">
                <CloudUpload className="mx-auto h-14 w-14 text-blue-600" />
                <span className="mt-4 block text-xl font-bold">Choose {acceptsPdf ? "an image or PDF" : "an image"}</span>
                <span className="mt-2 block text-slate-500">Image optimization and OCR will run as before.</span>
                <span className="mx-auto mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"><Upload className="h-5 w-5" /> Browse file</span>
              </button>
              <input ref={inputRef} type="file" accept={acceptType} className="hidden" onChange={(event) => onFileChange(event.target.files?.[0] || null)} />
              {file && <div className="mt-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4"><FileText className="h-8 w-8 text-green-600" /><div><p className="font-bold text-slate-800">{file.name}</p><p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p></div></div>}
            </>
          )}
        </>
      )}
    </section>
  );
}
