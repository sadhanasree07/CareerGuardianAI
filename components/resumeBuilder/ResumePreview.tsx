"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Download, Eye, Pencil, RotateCcw, Save } from "lucide-react";
import ResumeTemplate from "./ResumeTemplate";
import type { ResumeData, ResumeStyle } from "./resumeTypes";
import { downloadResumePdf } from "@/lib/resumePdf";

interface Props {
  data: ResumeData;
  onSave: () => Promise<void>;
  onReset: () => void;
  saveState: "idle" | "saving" | "saved" | "error";
  editor: ReactNode;
  style: ResumeStyle;
  onStyleChange: (style: ResumeStyle) => void;
}

export default function ResumePreview({ data, onSave, onReset, saveState, editor, style, onStyleChange }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState("");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const download = async () => {
    if (downloading) return;
    setDownloading(true); setDownloadMessage("");
    try {
      // Clone current state now so an export cannot read stale component state.
      const current = structuredClone(data);
      await document.fonts?.ready;
      const photo = await getPreviewPhoto();
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await downloadResumePdf(current, style, photo);
      setDownloadMessage("Resume PDF downloaded successfully.");
    } catch (error) {
      if (process.env.NODE_ENV !== "production") console.error("Resume PDF generation failed:", error);
      setDownloadMessage("Unable to generate the PDF. Please try again.");
    } finally { setDownloading(false); }
  };
  async function getPreviewPhoto(): Promise<string | undefined> {
    const photo = document.querySelector<HTMLImageElement>("#resume-preview .resume-photo:not(.resume-photo-placeholder)");
    if (!photo) return undefined;
    try {
      await photo.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 256; canvas.height = 256;
      const context = canvas.getContext("2d");
      if (!context) return undefined;
      context.beginPath(); context.arc(128, 128, 126, 0, Math.PI * 2); context.clip();
      const size = Math.min(photo.naturalWidth, photo.naturalHeight);
      const sx = (photo.naturalWidth - size) / 2; const sy = (photo.naturalHeight - size) / 2;
      context.drawImage(photo, sx, sy, size, size, 0, 0, 256, 256);
      return canvas.toDataURL("image/png");
    } catch (error) {
      if (process.env.NODE_ENV !== "production") console.warn("Profile photo could not be embedded in the resume PDF; using initials.", error);
      return undefined;
    }
  }
  const save = async () => { await onSave(); };
  return <div className="space-y-5">
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div><h1 className="font-semibold text-slate-900">{data.name.trim() || "Untitled resume"}</h1><p className="text-xs text-slate-500">{style === "ats-safe" ? "ATS Safe" : "Professional Navy"} · A4</p></div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={save} disabled={saveState === "saving"} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50"><Save size={16} />{saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : "Save"}</button>
        <button type="button" onClick={() => setMobileView("preview")} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium lg:hidden"><Eye size={16} />Preview</button>
        <button type="button" onClick={() => setMobileView("edit")} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium lg:hidden"><Pencil size={16} />Edit</button>
        <button type="button" onClick={download} disabled={downloading} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"><Download size={16} />{downloading ? "Generating PDF..." : "Download PDF"}</button>
        <button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"><RotateCcw size={16} />Reset</button>
      </div>
      <span aria-live="polite" className="w-full text-sm text-slate-600 sm:basis-full">{downloadMessage || (saveState === "saved" ? "Changes saved." : saveState === "error" ? "Could not save to your account; this browser draft is retained." : "")}</span>
    </div>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(320px,0.82fr)_minmax(560px,1.18fr)]">
      <section className={`${mobileView === "preview" ? "hidden" : "block"} rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:block`} aria-label="Resume editor">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Edit your resume</h2>
        <div className="max-h-[calc(100vh-12rem)] space-y-5 overflow-y-auto pr-1">{editor}</div>
      </section>
      <div className={`${mobileView === "edit" ? "hidden" : "block"} min-w-0 lg:sticky lg:top-6 lg:block`}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1 text-sm text-slate-500"><label className="flex items-center gap-2">Resume Style<select className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800" value={style} onChange={(event) => onStyleChange(event.target.value as ResumeStyle)}><option value="professional-navy">Professional Navy</option><option value="ats-safe">ATS Safe</option></select></label><span>Live preview · {style === "ats-safe" ? "single column" : "two columns"}</span></div>
        <div className="overflow-x-auto rounded-2xl bg-slate-200 p-3 shadow-inner sm:p-5">
          <div className="mx-auto w-full min-w-0 max-w-[794px] shadow-xl" id="resume-preview"><ResumeTemplate data={data} style={style} /></div>
        </div>
      </div>
    </div>
  </div>;
}
