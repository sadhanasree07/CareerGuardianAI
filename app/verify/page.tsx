"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Trophy } from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";

import InputSelector from "@/components/verify/InputSelector";
import UploadZone from "@/components/verify/UploadZone";
import AIThinking from "@/components/verify/AIThinking";
import ExtractedInfo from "@/components/analyze/ExtractedInfo";
import TrustEngine from "@/components/analyze/TrustEngine";
import RecordingEvidencePanel from "@/components/analyze/RecordingEvidencePanel";
import PaymentFraudLayer from "@/components/analyze/PaymentFraudLayer";
import GovernmentRegistryPanel from "@/components/analyze/GovernmentRegistryPanel";
import DocumentProvenancePanel from "@/components/analyze/DocumentProvenancePanel";
import VerificationSummary from "@/components/analyze/VerificationSummary";
import LinkSentinelPanel from "@/components/analyze/LinkSentinelPanel";
import ThreatNetPanel from "@/components/analyze/ThreatNetPanel";
import { extractDocumentFacts, type DocumentProvenance } from "@/lib/documentProvenance";
import { inspectUploadedDocument, renderPdfPagesForOcr } from "@/lib/documentProvenanceClient";

async function decodeUploadedQrCodes(file: File): Promise<{ payloads: string[]; status: "DECODED" | "QR_DETECTED_BUT_NOT_DECODED" | "NOT_DETECTED" | "UNAVAILABLE" }> {
  const Detector = (window as Window & { BarcodeDetector?: new (options?: { formats?: string[] }) => { detect: (source: ImageBitmap | HTMLCanvasElement) => Promise<Array<{ rawValue?: string; format?: string }>> } }).BarcodeDetector;
  if (!file.type.startsWith("image/") && file.type !== "application/pdf") return { payloads: [], status: "UNAVAILABLE" };
  if (!Detector) return { payloads: [], status: "UNAVAILABLE" };
  let detector: { detect: (source: ImageBitmap | HTMLCanvasElement) => Promise<Array<{ rawValue?: string; format?: string }>> };
  try { detector = new Detector({ formats: ["qr_code"] }); }
  catch { return { payloads: [], status: "UNAVAILABLE" }; }
  const payloads = new Set<string>();
  let qrDetected = false;
  try {
    if (file.type.startsWith("image/")) {
      const bitmap = await createImageBitmap(file);
      try { for (const item of await detector.detect(bitmap)) { qrDetected = true; if (item.rawValue) payloads.add(item.rawValue.slice(0, 2000)); } }
      finally { bitmap.close(); }
    } else {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const pdfDocument = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      for (let pageNumber = 1; pageNumber <= Math.min(pdfDocument.numPages, 12); pageNumber += 1) {
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = globalThis.document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d");
        if (!context) continue;
        await page.render({ canvasContext: context, viewport, canvas }).promise;
        for (const item of await detector.detect(canvas)) { qrDetected = true; if (item.rawValue) payloads.add(item.rawValue.slice(0, 2000)); }
      }
    }
  } catch {
    return { payloads: [], status: "UNAVAILABLE" };
  }
  const values = [...payloads].slice(0, 10);
  return { payloads: values, status: values.length ? "DECODED" : qrDetected ? "QR_DETECTED_BUT_NOT_DECODED" : "NOT_DETECTED" };
}

async function prepareRecordingAudio(file: File): Promise<{ audioFile: File; mediaType: "audio" | "video"; duration: number }> {
  const isVideo = /\.(mp4|mov|mkv)$/i.test(file.name) || file.type.startsWith("video/");
  const url = URL.createObjectURL(file);
  const element = document.createElement(isVideo ? "video" : "audio") as HTMLVideoElement | HTMLAudioElement;
  element.preload = "metadata";
  element.src = url;
  element.style.position = "fixed"; element.style.left = "-10000px"; element.style.width = "1px"; element.style.height = "1px";
  document.body.appendChild(element);
  let captureStream: MediaStream | null = null;
  let activeRecorder: MediaRecorder | null = null;
  try {
    await new Promise<void>((resolve, reject) => {
      element.onloadedmetadata = () => resolve();
      element.onerror = () => reject(new Error("This recording format could not be opened by your browser."));
    });
    const duration = Number.isFinite(element.duration) ? element.duration : 0;
    if (!duration) throw new Error("Recording duration could not be read.");
    if (!isVideo) return { audioFile: file, mediaType: "audio", duration };
    if (duration > 15 * 60) throw new Error("Recording is longer than 15 minutes. Choose a shorter recording.");
    const captureElement = element as HTMLVideoElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream };
    captureStream = captureElement.captureStream?.() || captureElement.mozCaptureStream?.() || null;
    if (!captureStream?.getAudioTracks().length) throw new Error("No speech/audio track could be extracted from this recording.");
    const audioStream = new MediaStream(captureStream.getAudioTracks());
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
    if (!MediaRecorder.isTypeSupported(mimeType)) throw new Error("This browser cannot extract the audio track. Try Chrome or upload an audio file.");
    const recorder = new MediaRecorder(audioStream, { mimeType });
    activeRecorder = recorder;
    const chunks: BlobPart[] = [];
    const recorded = new Promise<Blob>((resolve, reject) => {
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onerror = () => reject(new Error("Audio could not be extracted from this video."));
      recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    });
    const playbackEnded = new Promise<void>((resolve, reject) => {
      element.onended = () => resolve();
      element.onerror = () => reject(new Error("Video playback stopped before the audio was extracted."));
    });
    recorder.start(1000);
    try { await element.play(); await playbackEnded; }
    catch (error) { if (recorder.state !== "inactive") recorder.stop(); await recorded.catch(() => new Blob()); throw error; }
    if (recorder.state !== "inactive") recorder.stop();
    const blob = await recorded;
    if (!blob.size) throw new Error("No speech/audio track could be extracted from this recording.");
    return { audioFile: new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webm`, { type: "audio/webm" }), mediaType: "video", duration };
  } finally {
    if (activeRecorder?.state !== "inactive") activeRecorder?.stop();
    captureStream?.getTracks().forEach((track) => track.stop());
    element.pause(); element.removeAttribute("src"); element.load(); URL.revokeObjectURL(url);
    element.remove();
  }
}

export default function VerifyPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [selected, setSelected] = useState("job");
  const [sourceType, setSourceType] = useState("unknown");

  const [file, setFile] = useState<File | null>(null);
  const [inputMethod, setInputMethod] = useState<"file" | "text">("file");
  const [pastedText, setPastedText] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  const [started, setStarted] = useState(false);

  const [thinking, setThinking] = useState(false);

  const [engineStarted, setEngineStarted] =
    useState(false);

  const [currentStep, setCurrentStep] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<any>(null);

  const [verification, setVerification] =
    useState<any>(null);
  const [recording, setRecording] = useState<any>(null);
  const [recordingProgress, setRecordingProgress] = useState("");
  const [combinePrevious, setCombinePrevious] = useState(false);

  async function startVerification() {
    if (selected === "recording" && !file) {
      alert("Please upload an audio or video recording.");
      return;
    }
    const textMode = selected === "url" || selected === "text" || (["whatsapp", "job"].includes(selected) && inputMethod === "text");
    if (textMode && selected !== "url" && !pastedText.trim()) {
      alert("Please paste the message before continuing.");
      return;
    }
    if (selected === "url" && !jobUrl.trim()) {
      alert("Please paste the recruitment link before continuing.");
      return;
    }
    if (!textMode && !file) {
      alert(selected === "whatsapp" ? "Please upload a WhatsApp screenshot." : "Please upload a recruitment document.");
      return;
    }

    try {
      setLoading(true);
      setStarted(true);
      setThinking(true);
      if (selected === "recording") setRecording(null);
      const inputType = selected;
      let previousContext: any = null;
      if (selected === "recording" && combinePrevious) {
        try { previousContext = JSON.parse(localStorage.getItem("verifiedRecruitment") || "null"); } catch { previousContext = null; }
        if (!previousContext) throw new Error("There is no previously analyzed opportunity on this device to compare.");
      }
      let recordingResult: any = null;
      let recordingText = "";
      let decodedQrPayloads: string[] = [];
      let qrScanStatus: "DECODED" | "QR_DETECTED_BUT_NOT_DECODED" | "NOT_DETECTED" | "UNAVAILABLE" = "UNAVAILABLE";
      let documentProvenance: DocumentProvenance | null = null;
      let localPdfText = "";
      let renderedPdfPages: string[] = [];
      if (selected === "recording" && file) {
        if (file.size > 25 * 1024 * 1024) throw new Error("Recording is too large to process. Choose a supported recording under 25 MB.");
        setRecordingProgress(t("verify.recording.processing", "Extracting audio from the recording…"));
        const media = await prepareRecordingAudio(file);
        if (media.duration > 15 * 60) throw new Error("Recording is longer than 15 minutes. Choose a shorter recording.");
        setRecordingProgress(t("verify.recording.transcribing", "Transcribing recording…"));
        const formData = new FormData();
        formData.append("audio", media.audioFile);
        formData.append("selectedApplicationLanguage", language);
        const transcribeResponse = await fetch("/api/transcribe", { method: "POST", body: formData });
        const transcribed = await transcribeResponse.json();
        if (!transcribeResponse.ok || !transcribed.success) throw new Error(transcribed.message || "Transcription failed.");
        recordingResult = { ...transcribed, mediaType: media.mediaType, duration: transcribed.duration || media.duration };
        recordingText = transcribed.transcriptSegments?.length
          ? transcribed.transcriptSegments.map((segment: any) => `[${Math.floor(segment.startTime / 60).toString().padStart(2, "0")}:${Math.floor(segment.startTime % 60).toString().padStart(2, "0")}] ${segment.text}`).join("\n")
          : transcribed.rawTranscript;
        setRecording(recordingResult);
      }
      const inputMethodValue = selected === "recording" ? recordingResult.mediaType : selected === "url" ? "url" : textMode ? "text" : "ocr";
      if (file && selected !== "recording") {
        const qrScan = await decodeUploadedQrCodes(file);
        decodedQrPayloads = qrScan.payloads;
        qrScanStatus = qrScan.status;
        const inspected = await inspectUploadedDocument(file, qrScan.status);
        documentProvenance = inspected.provenance;
        localPdfText = inspected.extractedText;
        if (!localPdfText && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))) {
          try { renderedPdfPages = await renderPdfPagesForOcr(file); }
          catch { renderedPdfPages = []; }
        }
      }
      const extractPayload: Record<string, unknown> = { inputType, inputMethod: inputMethodValue };
      if (selected === "url") extractPayload.url = jobUrl;
      else if (selected === "recording") { extractPayload.text = recordingText; extractPayload.inputMethod = "text"; }
      else if (textMode) extractPayload.text = pastedText;
      else if (file) {
        if (localPdfText) {
          extractPayload.extractedDocumentText = localPdfText;
        } else if (renderedPdfPages.length) {
          extractPayload.ocrImages = renderedPdfPages;
        } else {
          if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
            throw new Error("This PDF could not be read or rendered locally. Try a text-based PDF or upload clear page images.");
          }
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
            reader.onerror = () => reject(new Error("Could not read the selected file."));
            reader.readAsDataURL(file);
          });
          extractPayload.image = base64;
          extractPayload.mimeType = file.type;
        }
      }

      const extractResponse = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(extractPayload),
      });
      const extract = await extractResponse.json();
      if (!extract.success) {
        alert(extract.message || "CareerGuardian AI could not analyze this message right now. Please try again.");
        setStarted(false);
        setThinking(false);
        setRecordingProgress("");
        return;
      }

      const sourceText = localPdfText || extract.text || "";
      const documentFacts = extractDocumentFacts(sourceText);
      const extractedCompany = typeof extract.data.company === "string" ? extract.data.company : "";
      const extractedData = {
        ...extract.data,
        company: extractedCompany || documentFacts.organization || "",
        jobRole: extract.data.jobRole || documentFacts.recruitmentTitle || "",
        notificationNumber: extract.data.notificationNumber || documentFacts.notificationNumber || "",
        applicationStartDate: extract.data.applicationStartDate || documentFacts.applicationOpeningDate || "",
        applicationClosingDate: extract.data.applicationClosingDate || documentFacts.applicationClosingDate || "",
        publicationDate: extract.data.publicationDate || documentFacts.publicationDate || "",
        applicationUrl: extract.data.applicationUrl || documentFacts.applicationUrl || "",
        rawText: extract.text || "",
        decodedQrPayloads,
        qrScanStatus,
        ...(documentProvenance ? {
          documentProvenance: {
            ...documentProvenance,
            facts: {
              ...documentFacts,
              organization: extractedCompany && sourceText.toLowerCase().includes(extractedCompany.toLowerCase()) ? extractedCompany : documentFacts.organization,
            },
          },
        } : {}),
        website: extract.data.website || (selected === "url" ? jobUrl : documentFacts.applicationUrl || ""),
        description: selected === "recording" ? recordingResult.rawTranscript : inputMethodValue !== "ocr" ? extract.text : extract.data.description || "",
        inputType,
        inputMethod: inputMethodValue,
        ...(recordingResult ? {
          rawText: recordingResult.rawTranscript,
          mediaType: recordingResult.mediaType,
          recordingDuration: recordingResult.duration,
          mediaMetadata: { fileName: file?.name, mimeType: file?.type || "unknown", sizeBytes: file?.size, lastModified: file?.lastModified },
          transcript: recordingResult.rawTranscript,
          cleanTranscript: recordingResult.cleanTranscript,
          transcriptLanguage: recordingResult.transcriptLanguage,
          selectedApplicationLanguage: recordingResult.selectedApplicationLanguage,
          transcriptSegments: recordingResult.transcriptSegments,
          keyEvidence: recordingResult.keyEvidence,
          repeatedEvidence: recordingResult.repeatedEvidence,
          recordingRiskSignals: recordingResult.recordingRiskSignals,
          recordingSummary: recordingResult.recordingSummary,
          additionalEvidenceText: previousContext ? [previousContext.company, previousContext.jobRole, previousContext.description].filter(Boolean).join("\n") : "",
          additionalEvidenceSource: previousContext?.inputType || "",
        } : {}),
      };
      setResult(extractedData);
      const userId = localStorage.getItem("userId");
      const effectiveSource = sourceType;
      const verifyResponse = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...extractedData, sourceType: selected === "recording" ? recordingResult.mediaType === "video" ? "video_recording" : "call_recording" : effectiveSource, inputType, inputMethod: inputMethodValue, userId }),
      });
      const verify = await verifyResponse.json();
      if (!verify.success) {
        alert(verify.message || "Verification Failed");
        setStarted(false);
        setThinking(false);
        setRecordingProgress("");
        return;
      }
      setVerification(verify);
      localStorage.setItem("verifiedRecruitment", JSON.stringify({
        company: extractedData.company || "",
        recruiter: extractedData.recruiter || extractedData.contactPerson || "",
        jobRole: extractedData.jobRole || "",
        salary: extractedData.salary || "",
        education: extractedData.education || "",
        requiredSkills: extractedData.requiredSkills || [],
        website: extractedData.website || "",
        email: extractedData.email || "",
        phone: extractedData.phone || "",
        location: extractedData.location || "",
        description: selected === "recording" ? "" : extractedData.description || "",
        layers: verify.layers || [],
        trustScore: verify.trustScore,
        verdict: verify.verdict,
        riskScore: verify.riskScore,
        verificationConfidence: verify.verificationConfidence,
        sourceConfidence: verify.sourceConfidence,
        sourceType: verify.sourceType,
        ...(selected === "recording" ? {
          mediaType: recordingResult.mediaType,
          recordingDuration: recordingResult.duration,
          recordingRiskIndicators: (recordingResult.keyEvidence || []).filter((item: any) => /payment|fee|otp|pin|cvv|password|credential|urgency|threat|pressure/i.test(item.category)).map((item: any) => ({ category: item.category, startTime: item.startTime })),
        } : {}),
        inputType,
        inputMethod: inputMethodValue,
      }));
      setThinking(false);
      setRecordingProgress("");
      setEngineStarted(true);
    } catch (error) {
      console.error(error);
      setStarted(false);
      setThinking(false);
      setRecordingProgress("");
      alert("CareerGuardian AI could not analyze this message right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!engineStarted || !verification) return;

    const layers =
      verification.layers || [];

    if (currentStep < layers.length) {
      const timer = setTimeout(() => {
        setCurrentStep(
          (prev) => prev + 1
        );
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [
    engineStarted,
    currentStep,
    verification,
  ]);

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">

        {/* Header */}

        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-5 py-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />

            <span className="font-semibold text-blue-700">
              {t("verify.badge", "Guardian Verify")}
            </span>
          </div>

          <h1 className="mt-6 text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">
            AI Recruitment Verification
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Upload any recruitment notification,
            offer letter, internship poster or
            screenshot and let Guardian AI verify
            its authenticity using our 12-Layer
            Verification Engine.
          </p>
        </div>

        {/* Upload Section */}

        {!started && (
          <>
            <div className="mt-12">
              <InputSelector
                selected={selected}
                onSelect={setSelected}
                recordingTitle={t("verify.recording.title", "Call / Audio / Video")}
                recordingDescription={t("verify.recording.description", "Analyze a recruitment call or video and extract timestamped evidence.")}
              />
            </div>

            <div className="mt-8 w-full rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <label htmlFor="opportunity-source" className="block font-semibold text-slate-800">
                How did you receive this opportunity?
              </label>
              <p className="mt-1 text-sm text-slate-500">This gives the checks context. A source by itself does not confirm legitimacy.</p>
              <select id="opportunity-source" value={sourceType} onChange={(event) => setSourceType(event.target.value)} className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900">
                <option value="unknown">Select source (optional)</option>
                <option value="company_website">Company Website</option>
                <option value="company_email">Company Email</option>
                <option value="college_placement_cell">College Placement Cell</option>
                <option value="hod_faculty">HOD / Faculty</option>
                <option value="college_whatsapp_group">College WhatsApp Group</option>
                <option value="linkedin">LinkedIn</option>
                <option value="job_portal">Job Portal</option>
                <option value="recruiter_directly">Recruiter Directly</option>
                <option value="employee_referral">Employee Referral</option>
                <option value="friend_known_contact">Friend / Known Contact</option>
                <option value="other">Other</option>
              </select>
            </div>

            <UploadZone
              selected={selected}
              file={file}
              onFileChange={setFile}
              inputMethod={inputMethod}
              onInputMethodChange={setInputMethod}
              text={pastedText}
              onTextChange={setPastedText}
              url={jobUrl}
              onUrlChange={setJobUrl}
              combinePrevious={combinePrevious}
              onCombinePreviousChange={setCombinePrevious}
            />

            <div className="mt-10 text-center">
              <button
                onClick={startVerification}
                disabled={loading}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-10 py-5 text-lg font-bold text-white shadow-lg transition hover:scale-105 disabled:opacity-60"
              >
                {loading
                  ? "Preparing..."
                  : selected === "whatsapp" ? "Analyze WhatsApp Chat"
                  : selected === "text" ? "Analyze Conversation"
                  : selected === "job" ? "Verify Job Opportunity"
                  : selected === "url" ? "Verify Job Opportunity"
                  : selected === "recording" ? t("verify.recording.upload", "Upload Recording")
                  : "Extract & Verify"}
              </button>
            </div>
          </>
        )}

        {/* AI Thinking */}

        {thinking && (
          <div className="mt-10">
            {recordingProgress && <p className="mb-3 text-center font-semibold text-blue-700">{recordingProgress}</p>}
            <AIThinking />
          </div>
        )}

        {/* Verification Results */}

        {engineStarted &&
          verification &&
          result && (
            <>
              {recording && <RecordingEvidencePanel recording={recording} caseId={verification.verificationId || "Local case"} />}
              {verification.verdict === "HIGH RISK" && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5"><p className="font-semibold text-red-900">This assessment contains high-risk evidence.</p><Link href="/emergency" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 font-semibold text-white hover:bg-red-800">Open Guardian Recovery <ArrowRight className="h-4 w-4" /></Link></div>}
              <VerificationSummary verification={verification} extracted={result} />
              {verification.creditsAwarded > 0 && (
                <section className="mt-5 flex flex-col gap-4 border-y border-cyan-200 bg-cyan-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-cyan-950">+{verification.creditsAwarded} CareerGuardian credits earned</p>
                    <p className="mt-1 text-sm text-cyan-900">Your balance: {verification.creditsBalance} / 100</p>
                  </div>
                  {verification.premiumUnlocked ? (
                    <Link href="/premium" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white hover:bg-cyan-800">Premium unlocked · Enter Premium <ArrowRight className="h-4 w-4" /></Link>
                  ) : (
                    <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300 bg-white px-4 py-3 font-bold text-cyan-950 hover:bg-cyan-100">View unlock progress <ArrowRight className="h-4 w-4" /></Link>
                  )}
                </section>
              )}

              {verification.digitalIdentityOpportunityAuthenticity && (
                <section aria-labelledby="digital-identity-title" className="mt-8 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Main layer 1</p>
                      <h2 id="digital-identity-title" className="mt-2 text-2xl font-black text-slate-900">DIGITAL IDENTITY & OPPORTUNITY AUTHENTICITY</h2>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                      {verification.digitalIdentityOpportunityAuthenticity.finalStatus || "REVIEW"}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-700">Verify the organization, website, recruiter and recruitment opportunity — not just the URL.</p>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard label="Submitted Website" value={verification.digitalIdentityOpportunityAuthenticity.submittedUrl || "Not provided"} />
                    <MetricCard label="Claimed Organization" value={verification.digitalIdentityOpportunityAuthenticity.claimedOrganization || "Not identified"} />
                    <MetricCard label="Domain" value={verification.digitalIdentityOpportunityAuthenticity.domain?.status || "UNKNOWN"} />
                    <MetricCard label="Opportunity Authorization" value={verification.digitalIdentityOpportunityAuthenticity.opportunityAuthorization?.status || "UNAVAILABLE"} />
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard label="Infrastructure" value={verification.digitalIdentityOpportunityAuthenticity.infrastructure?.relationship || "UNKNOWN"} />
                    <MetricCard label="Recruiter" value={verification.digitalIdentityOpportunityAuthenticity.recruiterIdentity?.status || "UNAVAILABLE"} />
                    <MetricCard label="Payment Identity" value={verification.digitalIdentityOpportunityAuthenticity.paymentIdentity?.status || "NOT_PROVIDED"} />
                    <MetricCard label="Evidence Coverage" value={`${verification.digitalIdentityOpportunityAuthenticity.evidenceCoverage?.observed ?? 0} / ${verification.digitalIdentityOpportunityAuthenticity.evidenceCoverage?.total ?? 0}`} />
                  </div>

                  <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Why this result</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {verification.digitalIdentityOpportunityAuthenticity.redFlags?.length
                        ? verification.digitalIdentityOpportunityAuthenticity.redFlags.slice(0, 3).join(" ")
                        : "CareerGuardian analyzed the submitted website, organization claim and opportunity details. Verification remains limited by available independent evidence."}
                    </p>
                    {verification.digitalIdentityOpportunityAuthenticity.redFlags?.length > 0 && (
                      <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
                        {verification.digitalIdentityOpportunityAuthenticity.redFlags.slice(0, 4).map((item: string) => <li key={item}>{item}</li>)}
                      </ul>
                    )}
                  </div>
                </section>
              )}

              <section aria-labelledby="government-recruitment-verification-title" className="mt-8 space-y-4">
                <h2 id="government-recruitment-verification-title" className="text-xl font-bold text-slate-900">Government Recruitment Verification</h2>
                {verification.documentProvenance && <DocumentProvenancePanel result={verification.documentProvenance} payment={verification.paymentFraudDetection} />}
                <GovernmentRegistryPanel result={verification.governmentVerification} />
                <LinkSentinelPanel result={verification.linkSentinel} />
                <PaymentFraudLayer result={verification.paymentFraudDetection} />
              </section>

              <section aria-labelledby="threat-intelligence-title" className="mt-8">
                <h2 id="threat-intelligence-title" className="mb-3 text-xl font-bold text-slate-900">Threat Intelligence</h2>
                <ThreatNetPanel result={verification.threatIntelligence} />
              </section>

              <details className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer font-semibold text-slate-800">Supporting Verification · Existing 12-Layer Analysis</summary>
                <div className="mt-4">
                  <TrustEngine data={{ ...result, verification }} />
                </div>
              </details>

              <details className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer font-semibold text-slate-800">Investigation Report · Extracted Fields and Source Evidence</summary>
                <div className="mt-4">
                  <ExtractedInfo data={{ ...result, verification }} />
                </div>
              </details>

              {/* Badge Unlocked */}

              {verification.unlockedBadges &&
                verification.unlockedBadges.length >
                  0 && (
                  <div className="mt-8 rounded-3xl border border-yellow-200 bg-yellow-50 p-6 text-center shadow-sm">
                    <div className="flex justify-center text-amber-500">
                      <Trophy aria-hidden="true" className="h-10 w-10" />
                    </div>

                    <h2 className="mt-3 text-xl font-black text-slate-900">
                      Badge Unlocked!
                    </h2>

                    <p className="mt-2 text-slate-600">
                      You earned:
                    </p>

                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                      {verification.unlockedBadges.map(
                        (badge: string) => (
                          <span
                            key={badge}
                            className="rounded-full bg-yellow-200 px-4 py-2 text-sm font-bold text-yellow-900"
                          >
                              <Trophy aria-hidden="true" className="mr-2 inline h-4 w-4" />
                            {badge
                              .replace(
                                /_/g,
                                " "
                              )}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Company Report Button */}

              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    const companyName =
                      result?.company;

                    if (!companyName) {
                      alert(
                        "Company name not found."
                      );

                      return;
                    }

                    const companySlug =
                      companyName
                        .trim()
                        .toLowerCase()
                        .replace(
                          /\s+/g,
                          "-"
                        );

                    router.push(
                      `/company/${companySlug}`
                    );
                  }}
                  className="rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white shadow-lg transition hover:scale-105 hover:bg-slate-800"
                >
                  View Company Report <ArrowRight aria-hidden="true" className="ml-2 inline h-5 w-5" />
                </button>
              </div>
            </>
          )}

      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}
