"use client";

import { Download, Headphones, Repeat2 } from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";
import { buildRecordingTranscript, formatTimestamp } from "@/lib/recordingEvidence";

export default function RecordingEvidencePanel({ recording, caseId }: { recording: any; caseId: string }) {
  const { t } = useLanguage();
  function downloadTranscript() {
    const content = [
      "CareerGuardian AI — Recording Transcript",
      `Case ID: ${caseId}`,
      `Date: ${new Date().toLocaleString()}`,
      `Input Type: ${recording.mediaType || "audio"}`,
      `Language: ${recording.transcriptLanguage || "unknown"}`,
      `Selected application language: ${recording.selectedApplicationLanguage || "en"}`,
      "",
      recording.transcriptSegments?.length ? buildRecordingTranscript(recording.transcriptSegments) : recording.rawTranscript || "Transcript unavailable.",
      "",
      t("verify.recording.disclaimer", "Machine-generated transcription. Check important statements against the original recording."),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "CareerGuardian_Recording_Transcript.txt"; anchor.click(); URL.revokeObjectURL(url);
  }
  const riskCount = Object.values(recording.recordingRiskSignals || {}).filter(Boolean).length;
  return (
    <section className="mt-10 rounded-3xl border border-violet-200 bg-white p-6 shadow-lg sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3"><span className="rounded-xl bg-violet-50 p-3 text-violet-700"><Headphones className="h-6 w-6" /></span><div><h2 className="text-xl font-bold text-slate-900">{t("verify.recording.title", "Call / Audio / Video")}</h2><p className="text-sm text-slate-600">{recording.recordingSummary || "Transcript available for verification."}</p></div></div>
        <button type="button" onClick={downloadTranscript} className="inline-flex items-center gap-2 rounded-xl border border-violet-200 px-4 py-2.5 font-semibold text-violet-800 hover:bg-violet-50"><Download className="h-4 w-4" />{t("verify.recording.download", "Download transcript")}</button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[["Recording analyzed", "YES"], [t("verify.recording.duration", "Recording duration"), recording.duration ? `${Math.floor(recording.duration / 60)}:${String(Math.floor(recording.duration % 60)).padStart(2, "0")}` : "—"], [t("verify.recording.keyEvidence", "Key evidence"), recording.keyEvidence?.length || 0], ["Risk indicators", riskCount]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-900">{value}</p></div>)}
      </div>
      {recording.keyEvidence?.length > 0 && <div className="mt-6"><h3 className="font-bold text-slate-900">{t("verify.recording.keyEvidence", "Key evidence")}</h3><div className="mt-3 grid gap-3 md:grid-cols-2">{recording.keyEvidence.map((item: any, index: number) => <article key={`${item.segmentId}-${index}`} className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold text-violet-800">{formatTimestamp(item.startTime)} · {item.category}</p><blockquote className="mt-2 text-slate-800">“{item.text}”</blockquote>{item.repeatCount > 1 && <p className="mt-2 inline-flex items-center gap-1 text-sm text-amber-800"><Repeat2 className="h-4 w-4" />Repeated {item.repeatCount} times; also at {item.subsequentOccurrences.map(formatTimestamp).join(", ")}</p>}</article>)}</div></div>}
      <details className="mt-6 rounded-xl border border-slate-200 p-4" open><summary className="cursor-pointer font-bold text-slate-900">{t("verify.recording.transcript", "Timestamped transcript")}</summary>
        {recording.transcriptSegments?.length ? <div className="mt-3 max-h-96 space-y-2 overflow-y-auto">{recording.transcriptSegments.map((segment: any) => <p key={segment.id} className="grid grid-cols-[4.5rem_1fr] gap-2 text-sm leading-6"><span className="font-mono font-semibold text-violet-700">{formatTimestamp(segment.startTime)}</span><span><span className="font-semibold text-slate-500">{segment.speaker}: </span>{segment.text}</span></p>)}</div> : <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{recording.rawTranscript || "No transcript returned."}<span className="mt-2 block text-xs text-amber-700">Timestamp segments were not supplied by the transcription provider.</span></p>}
      </details>
      <p className="mt-3 text-xs text-slate-500">{t("verify.recording.disclaimer", "Machine-generated transcription. Check important statements against the original recording.")}</p>
    </section>
  );
}
