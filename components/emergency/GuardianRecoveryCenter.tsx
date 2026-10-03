"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import { speakText } from "@/src/lib/speech";
import { BANKS } from "@/app/data/banks";
import ComplaintLetterPreview from "@/components/emergency/ComplaintLetterPreview";
import { buildRecoveryComplaint, complaintText, generateComplaintPdf } from "@/lib/recoveryComplaint";
import { generateRecoveryReportPdf } from "@/lib/recoveryReport";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clipboard,
  Download,
  FileText,
  Headphones,
  Landmark,
  MapPin,
  Mic,
  Phone,
  Share2,
  ShieldCheck,
  Upload,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import RecoveryAssistant from "@/components/emergency/RecoveryAssistant";
import CommunityAlerts from "@/components/emergency/CommunityAlerts";
import ScamHeatMap from "@/components/emergency/ScamHeatMap";

type RecoveryForm = {
  organization: string;
  recruiter: string;
  jobTitle: string;
  description: string;
  paymentMethod: string;
  amount: string;
  incidentDate: string;
  phone: string;
  email: string;
  location: string;
  notes: string;
  lostMoney: "YES" | "NO" | "NOT_SURE";
  confirmed: boolean;
};

type RecoveryCase = RecoveryForm & {
  caseId: string;
  status: string;
  createdAt: string;
  referenceId: string;
  evidence: EvidenceItem[];
  complainantName?: string;
  complainantPhone?: string;
  complainantEmail?: string;
  paymentDate?: string;
};

type EvidenceItem = {
  id: string;
  category: string;
  name: string;
  type: string;
  size: number;
  addedAt: string;
  url: string;
  description: string;
  status: string;
};

const evidenceCategories = [
  "Payment Receipt",
  "Bank Transaction Screenshot",
  "UPI Screenshot",
  "Recorded Call / Audio",
  "WhatsApp Chat",
  "SMS",
  "Email",
  "Recruitment Advertisement",
  "Website Screenshot",
  "Video Recording",
  "Location / Place Video",
  "Other Document",
];

const steps = [
  "Secure the transaction",
  "Notify the financial institution",
  "Preserve evidence",
  "Generate complaint",
  "Report to authorities",
  "Share the case",
  "Track recovery status",
];

const initialForm: RecoveryForm = {
  organization: "",
  recruiter: "",
  jobTitle: "",
  description: "",
  paymentMethod: "",
  amount: "",
  incidentDate: "",
  phone: "",
  email: "",
  location: "",
  notes: "",
  lostMoney: "NOT_SURE",
  confirmed: false,
};

function fieldLabel(label: string, required = false) {
  return <span>{label}{required && <span className="text-red-600"> *</span>}</span>;
}

function safeValue(value: string | undefined) {
  return value?.trim() || "Not provided";
}

export default function GuardianRecoveryCenter() {
  const intakeRef = useRef<HTMLElement>(null);
  const evidenceUrls = useRef<string[]>([]);
  const [mode, setMode] = useState<"intro" | "intake" | "dashboard">("intro");
  const [form, setForm] = useState<RecoveryForm>(initialForm);
  const [caseData, setCaseData] = useState<RecoveryCase | null>(null);
  const [verification, setVerification] = useState<Record<string, unknown> | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const voiceEnabledRef = useRef(true);
  const voiceSessionRef = useRef(0);
  const [guidancePaused, setGuidancePaused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showBank, setShowBank] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [bankNotice, setBankNotice] = useState("");
  const [complaintVisible, setComplaintVisible] = useState(false);
  const [complaintGenerated, setComplaintGenerated] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [communityCategory, setCommunityCategory] = useState("Fake Job Fee");
  const [communityLocation, setCommunityLocation] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [communityStatus, setCommunityStatus] = useState("");
  const [institution, setInstitution] = useState("");
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [timeline, setTimeline] = useState<{ event: string; date: string }[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("verifiedRecruitment");
      if (!saved) return;
      const verified = JSON.parse(saved) as Record<string, unknown>;
      setVerification(verified);
      setForm((current) => ({
        ...current,
        organization: String(verified.company || ""),
        recruiter: String(verified.recruiter || ""),
        jobTitle: String(verified.jobRole || ""),
        phone: String(verified.phone || ""),
        email: String(verified.email || ""),
        location: String(verified.location || ""),
        description: String(verified.description || ""),
      }));
    } catch {
      setVerification(null);
    }
  }, []);

  useEffect(() => () => {
    window.speechSynthesis?.cancel();
    evidenceUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const complaintInput = useMemo(() => caseData ? ({
    caseId: caseData.caseId,
    complaintDate: new Date().toLocaleDateString("en-IN"),
    complainantName: caseData.complainantName,
    complainantPhone: caseData.complainantPhone,
    complainantEmail: caseData.complainantEmail,
    organization: caseData.organization,
    recruiter: caseData.recruiter,
    opportunity: caseData.jobTitle,
    incidentDate: caseData.incidentDate,
    incidentLocation: caseData.location,
    involvedPhone: caseData.phone,
    involvedEmailOrWebsite: caseData.email,
    paymentMethod: caseData.paymentMethod,
    amount: caseData.amount,
    transactionReference: transactionId || caseData.referenceId,
    financialInstitution: institution,
    paymentDate: caseData.paymentDate,
    incidentDescription: caseData.description,
    additionalNotes: caseData.notes,
    evidence: caseData.evidence.map(({ category, name, description, status }) => ({ category, name, description, status })),
    lostMoney: caseData.lostMoney,
  }) : null, [caseData, institution, transactionId]);
  const complaintDocument = useMemo(() => complaintInput ? buildRecoveryComplaint(complaintInput) : null, [complaintInput]);
  const complaint = useMemo(() => complaintInput ? complaintText(complaintInput) : "", [complaintInput]);

  function speak(text: string) {
    if (!voiceEnabledRef.current) return;
    speakText(text);
  }

  function toggleVoice() {
    const enabled = !voiceEnabledRef.current;
    voiceEnabledRef.current = enabled;
    voiceSessionRef.current += 1;
    setVoiceEnabled(enabled);
    if (!enabled) {
      window.speechSynthesis?.cancel();
      setGuidancePaused(false);
    }
  }

  function getVoicePlaybackState() {
    return { enabled: voiceEnabledRef.current, session: voiceSessionRef.current };
  }

  function completeStep(step: number) {
    setCompletedSteps((current) => current.includes(step) ? current : [...current, step]);
  }

  function persistProgress(data: RecoveryCase, status: string, event: string, evidence = data.evidence) {
    setTimeline((current) => [...current, { event, date: new Date().toISOString() }]);
    void fetch("/api/recovery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId: data.caseId,
        status,
        event,
        evidence: evidence.map(({ category, name, type, size, addedAt, description, status }) => ({ category, name, type, size, addedAt, description, status })),
      }),
    }).catch(() => undefined);
  }

  function startRecovery() {
    setMode("intake");
    speak("Hello, and welcome to Guardian Recovery. Don't panic. CareerGuardian AI is here to help you take the right steps, preserve your evidence, and begin your recovery process safely.");
    window.setTimeout(() => intakeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  async function generatePlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!form.organization.trim() || !form.description.trim() || !form.incidentDate || !form.confirmed) {
      setError("Enter the organization, incident description and date, and confirm the details before continuing.");
      return;
    }
    setBusy(true);
    setNotice("Analyzing incident...");
    const data: RecoveryCase = {
      ...form,
      caseId: `CG-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      status: "ASSESSING",
      createdAt: new Date().toISOString(),
      referenceId: "",
      evidence: [],
    };
    try {
      const response = await fetch("/api/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, verifiedContext: verification }),
      });
      const result = await response.json();
      if (response.ok && result.success && result.case?.caseId) data.caseId = result.case.caseId;
      else if (response.status !== 401) throw new Error(result.message || "Recovery service is temporarily unavailable. Your entered information has not been submitted. Please try again.");
      else setNotice("Plan prepared in this session only. Sign in to save this case to your account.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Recovery service is temporarily unavailable. Your entered information has not been submitted. Please try again.");
      setBusy(false);
      return;
    }
    setNotice("Identifying recovery actions...");
    window.setTimeout(() => {
      setNotice("Preparing evidence checklist...");
      window.setTimeout(() => setNotice("Preparing complaint workflow..."), 100);
    }, 100);
    window.setTimeout(() => {
      setCaseData(data);
      setTimeline([
        { event: "Incident reported by user", date: new Date(`${data.incidentDate}T12:00:00`).toISOString() },
        { event: "Recovery started", date: data.createdAt },
      ]);
      setMode("dashboard");
      setBusy(false);
      setNotice("Recovery plan ready.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 400);
  }

  function addEvidence(category: string, file?: File) {
    if (!file || !caseData) return;
    const item: EvidenceItem = {
      id: crypto.randomUUID(),
      category,
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      addedAt: new Date().toISOString(),
      url: URL.createObjectURL(file),
      description: "",
      status: "Available in this session",
    };
    evidenceUrls.current.push(item.url);
    const updated = { ...caseData, evidence: [...caseData.evidence, item], status: "EVIDENCE_COLLECTED" };
    setCaseData(updated);
    completeStep(caseData.lostMoney === "NO" ? 2 : 3);
    persistProgress(updated, "EVIDENCE_COLLECTED", `Evidence added: ${category}`);
  }

  function updateEvidenceDescription(id: string, description: string) {
    if (!caseData) return;
    const evidence = caseData.evidence.map((item) => item.id === id ? { ...item, description } : item);
    const updated = { ...caseData, evidence };
    setCaseData(updated);
    persistProgress(updated, updated.status, "Evidence description updated", evidence);
  }

  function downloadRecoveryReportPdf() {
    if (!caseData) return;
    const enteredAmount = caseData.amount.trim() === "" ? undefined : Number(caseData.amount);
    const reportAmount = enteredAmount !== undefined && Number.isFinite(enteredAmount) && enteredAmount >= 0
      ? enteredAmount
      : undefined;
    const verificationLayers = Array.isArray(verification?.layers)
      ? verification.layers as { layer?: number; title?: string; passed?: boolean; score?: number; message?: string }[]
      : undefined;
    generateRecoveryReportPdf({
      ...caseData,
      amount: reportAmount,
      transactionReference: transactionId || caseData.referenceId,
      institution,
      contactChannel: caseData.phone || caseData.email,
      timeline,
      completedSteps,
      actionLabels: currentSteps,
      verification: verification ? {
        trustScore: verification.trustScore as number | string | undefined,
        verdict: verification.verdict as string | undefined,
        layers: verificationLayers,
        website: verification.website as string | undefined,
        email: verification.email as string | undefined,
        phone: verification.phone as string | undefined,
      } : undefined,
    });
  }

  function generateComplaintLetter() {
    if (!caseData || !complaintInput) return;
    setComplaintGenerated(true);
    setComplaintVisible(true);
    setNotice("Complaint generated successfully.");
    setError("");
    const updated = { ...caseData, status: "COMPLAINT_READY" };
    setCaseData(updated);
    completeStep(caseData.lostMoney === "NO" ? 3 : 4);
    persistProgress(updated, "COMPLAINT_READY", "Complaint letter generated");
    window.setTimeout(() => document.getElementById("complaint-preview")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function downloadComplaintLetterPdf() {
    if (!complaintInput) return;
    generateComplaintPdf(complaintInput);
  }

  async function copyText(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(message);
    } catch {
      setError("Clipboard access is unavailable in this browser. Select and copy the text manually.");
    }
  }

  function openOfficialCyberCrimePortal() {
    const portal = window.open("https://cybercrime.gov.in", "_blank", "noopener,noreferrer");
    void navigator.clipboard.writeText(complaint).then(() => {
      setNotice("Complaint copied and the official portal opened. Review and submit it on the government website; it has not been submitted automatically.");
    }).catch(() => {
      setNotice(portal
        ? "Official portal opened. Copy or download your complaint here, then submit it on the government website."
        : "Your browser blocked the portal window. Use the official link below and submit the complaint manually.");
    });
  }

  function prepareBankNotice() {
    if (!caseData) return;
    setBankNotice([
      "Subject: Request to review suspected fraudulent transaction",
      `\nTo ${safeValue(institution)} Financial Institution's Fraud Response Team,`,
      `\nI am reporting a suspected recruitment-related fraud. Please review the following transaction and advise me on urgent protective actions.\nOrganization: ${safeValue(caseData.organization)}\nIncident date: ${safeValue(caseData.incidentDate)}\nTransaction type: ${safeValue(caseData.paymentMethod)}\nAmount: ${caseData.amount ? `INR ${caseData.amount}` : "Not provided"}\nReference / transaction ID: ${safeValue(transactionId)}\nIncident description: ${safeValue(caseData.description)}`,
      "\nPlease acknowledge this notification, advise whether the transaction can be recalled or disputed, and provide a reference number for follow-up.",
    ].join("\n"));
    setCaseData({ ...caseData, status: "BANK_NOTIFIED" });
    if (caseData.lostMoney !== "NO") completeStep(2);
    persistProgress(caseData, "BANK_NOTIFIED", "Bank notification prepared");
  }

  async function submitCommunityReport() {
    if (!caseData) return;
    if (/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\b\d{7,}\b/.test(communityDescription)) {
      setCommunityStatus("Remove email addresses and phone numbers from the public summary before submitting.");
      return;
    }
    setCommunityStatus("Submitting report...");
    try {
      const response = await fetch("/api/report-scam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: caseData.organization, location: communityLocation, description: communityDescription.trim() || `Anonymized ${communityCategory.toLowerCase()} report.`, category: communityCategory, incidentDate: caseData.incidentDate }),
      });
      const result = await response.json();
      const success = response.ok && result.success;
      setCommunityStatus(success ? "An anonymized community report was submitted." : result.message || "The report could not be submitted. Please try again.");
      if (success) {
        completeStep(caseData.lostMoney === "NO" ? 4 : 5);
        const updated = { ...caseData, status: "REPORTED" };
        setCaseData(updated);
        persistProgress(updated, "REPORTED", "Anonymized community report submitted");
      }
    } catch {
      setCommunityStatus("The report could not be submitted. Please try again.");
    }
  }

  async function shareReport() {
    if (!caseData) return;
    const message = `CareerGuardian AI Recovery Alert\n\nI have reported a suspected recruitment scam involving ${caseData.organization}.\nCase ID: ${caseData.caseId}\nIncident Date: ${safeValue(caseData.incidentDate)}\nCurrent Status: ${caseData.status}\n\nPlease review the recovery report shared with you.`;
    const whatsapp = `https://wa.me/${recipient.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    if (recipient.trim() && navigator.share) {
      try {
        await navigator.share({ title: "CareerGuardian AI Recovery Alert", text: message });
        completeStep(caseData.lostMoney === "NO" ? 5 : 6);
        persistProgress(caseData, caseData.status, "Recovery case shared");
        return;
      } catch { /* User cancelled native share. */ }
    }
    if (recipient.trim()) {
      window.open(whatsapp, "_blank", "noopener,noreferrer");
      completeStep(caseData.lostMoney === "NO" ? 5 : 6);
      persistProgress(caseData, caseData.status, "WhatsApp share opened");
    }
    else setNotice("Enter a recipient's WhatsApp number (with country code) or copy the message to share it.");
  }

  const classes = mode === "intro" ? "from-sky-50 via-white to-blue-50" : "from-red-50 via-white to-orange-50";
  const currentSteps = caseData?.lostMoney === "NO"
    ? ["Secure accounts and devices", "Preserve evidence", "Generate complaint", "Report to authorities", "Share the case", "Track report status"]
    : steps;
  const firstIncompleteStep = currentSteps.findIndex((_, index) => !completedSteps.includes(index + 1));
  const officialBankUrl = Object.entries(BANKS).find(([bankName]) => institution.toUpperCase().includes(bankName))?.[1].website;

  return (
    <main className={`min-h-screen bg-gradient-to-br ${classes} transition-colors duration-500`}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        {mode === "intro" && (
          <section className="rounded-2xl border border-blue-200 bg-white p-8 shadow-lg sm:p-12">
            <div className="max-w-3xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><ShieldCheck /></div>
              <h1 className="mt-7 text-4xl font-bold text-slate-950">Raise a Complaint</h1>
              <p className="mt-4 text-lg text-slate-600">Report fraud, preserve evidence &amp; start recovery.</p>
              <p className="mt-4 max-w-2xl leading-7 text-slate-600">Start by confirming what happened. A recruitment verification does not automatically mean money was lost, and no recovery action will be taken without your input.</p>
              <button type="button" onClick={startRecovery} className="mt-8 inline-flex items-center gap-3 rounded-lg bg-blue-700 px-6 py-4 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300">
                Raise a Complaint <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </section>
        )}

        {mode === "intake" && (
          <section ref={intakeRef} className="scroll-mt-24 rounded-2xl border border-red-200 bg-white p-6 shadow-lg sm:p-10">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-red-700">Recovery case intake</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-950">Tell Guardian AI What Happened</h1>
                <p className="mt-2 text-slate-600">These details help us prepare the correct recovery workflow.</p>
              </div>
              <div className="flex items-center gap-2 self-start rounded-lg border px-3 py-2 text-sm">
                <button type="button" onClick={toggleVoice} aria-label={voiceEnabled ? "Turn voice guidance off" : "Turn voice guidance on"} className="rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-500">{voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}</button>
                Voice Guidance {voiceEnabled ? "On" : "Off"}
              </div>
            </div>

            {verification && (
              <aside className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
                <h2 className="font-semibold text-blue-950">Information detected from your verification</h2>
                <p className="mt-2 text-sm text-blue-900">Detected organization: <strong>{String(verification.company || "Not available")}</strong>{verification.verdict ? ` · Verdict: ${String(verification.verdict)}` : ""}{verification.trustScore !== undefined ? ` · Trust score: ${String(verification.trustScore)}` : ""}</p>
                <p className="mt-1 text-sm text-blue-800">Review and edit these values below. Verification does not confirm financial loss.</p>
              </aside>
            )}

            <form onSubmit={generatePlan} className="mt-8 grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-800">{fieldLabel("Company / Organization involved", true)}<input required value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="HDFC Bank / XYZ Recruitment / ABC Company" className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-200" /></label>
              <label className="space-y-2 text-sm font-medium text-slate-800">Recruiter / Person name <span className="text-slate-500">(optional)</span><input value={form.recruiter} onChange={(e) => setForm({ ...form, recruiter: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-200" /></label>
              <label className="space-y-2 text-sm font-medium text-slate-800">Job / Opportunity name <span className="text-slate-500">(optional)</span><input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-200" /></label>
              <label className="space-y-2 text-sm font-medium text-slate-800">Date of incident <span className="text-red-600">*</span><input type="date" required value={form.incidentDate} onChange={(e) => setForm({ ...form, incidentDate: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-200" /></label>
              <label className="space-y-2 text-sm font-medium text-slate-800 md:col-span-2">What happened? <span className="text-red-600">*</span><textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-200" /></label>
              <fieldset className="md:col-span-2"><legend className="text-sm font-medium text-slate-800">Did you lose money?</legend><div className="mt-2 flex flex-wrap gap-3">{([["YES", "Yes"], ["NO", "No"], ["NOT_SURE", "Not sure"]] as const).map(([value, label]) => <label key={value} className={`cursor-pointer rounded-lg border px-4 py-3 text-sm ${form.lostMoney === value ? "border-red-600 bg-red-50 text-red-800" : "border-slate-300"}`}><input type="radio" name="lostMoney" value={value} checked={form.lostMoney === value} onChange={() => setForm({ ...form, lostMoney: value })} className="mr-2 accent-red-600" />{label}</label>)}</div></fieldset>
              <label className="space-y-2 text-sm font-medium text-slate-800">How did you lose money? <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-200"><option value="">Select if applicable</option>{["UPI payment", "Bank transfer", "Card payment", "Cash payment", "Wallet", "Other", "No money lost"].map((method) => <option key={method}>{method}</option>)}</select></label>
              <label className="space-y-2 text-sm font-medium text-slate-800">Approximate amount lost <span className="text-slate-500">(optional)</span><input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-200" /></label>
              <label className="space-y-2 text-sm font-medium text-slate-800">Phone number / contact involved <span className="text-slate-500">(optional)</span><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-200" /></label>
              <label className="space-y-2 text-sm font-medium text-slate-800">Email / website involved <span className="text-slate-500">(optional)</span><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-200" /></label>
              <label className="space-y-2 text-sm font-medium text-slate-800">Incident location <span className="text-slate-500">(optional)</span><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-200" /></label>
              <label className="space-y-2 text-sm font-medium text-slate-800 md:col-span-2">Additional notes <span className="text-slate-500">(optional)</span><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-200" /></label>
              <label className="flex items-start gap-3 text-sm text-slate-700 md:col-span-2"><input type="checkbox" checked={form.confirmed} onChange={(e) => setForm({ ...form, confirmed: e.target.checked })} className="mt-1 h-4 w-4 accent-red-600" /><span>I confirm that the information provided is accurate to the best of my knowledge.</span></label>
              <p className="text-xs text-slate-500 md:col-span-2">Never enter passwords, OTPs, PINs, CVV, bank login details, or authentication tokens.</p>
              {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 md:col-span-2">{error}</p>}
              {notice && <p role="status" className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900 md:col-span-2">{notice}</p>}
              <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 px-6 py-4 font-semibold text-white hover:bg-red-800 disabled:opacity-60 md:col-span-2">{busy ? "Preparing your plan..." : "Generate Recovery Plan"}<ArrowRight className="h-5 w-5" /></button>
            </form>
          </section>
        )}

        {mode === "dashboard" && caseData && (
          <div className="space-y-7">
            <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-lg sm:p-9">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div><p className="text-sm font-semibold uppercase text-red-700">Guardian Recovery Plan</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Your next steps, clearly laid out</h1><p className="mt-2 text-slate-600">Case {caseData.caseId} · {caseData.lostMoney === "NO" ? "Prevention and reporting workflow" : "Recovery and reporting workflow"}</p></div>
                <span className="inline-flex items-center gap-2 self-start rounded-full bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900"><span className="h-2 w-2 rounded-full bg-amber-600" />{caseData.status.replaceAll("_", " ")}</span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Incident", caseData.description], ["Company", caseData.organization], ["Amount", caseData.amount ? `INR ${caseData.amount}` : "Not provided"], ["Payment method", caseData.paymentMethod || "Not provided"], ["Incident date", caseData.incidentDate], ["Current status", caseData.status.replaceAll("_", " ")]].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 p-4"><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-2 line-clamp-2 text-sm font-medium text-slate-900">{value}</p></div>)}</div>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div><h2 className="text-xl font-bold">Recovery progress</h2><p className="mt-1 text-sm text-slate-600">Complete only the actions that apply to your situation.</p></div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => { setGuidancePaused(false); speak("Your recovery plan is ready. Secure the transaction and contact your financial institution. Preserve payment and communication evidence. Generate your formal complaint. Report the incident to the appropriate cyber crime authority. Share the recovery report with trusted contacts if needed."); }} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-slate-50"><Headphones className="h-4 w-4" />Play Recovery Guidance</button>
                  <button type="button" disabled={!voiceEnabled} onClick={() => { if (guidancePaused) window.speechSynthesis?.resume(); else window.speechSynthesis?.pause(); setGuidancePaused(!guidancePaused); }} className="rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-50">{guidancePaused ? "Resume" : "Pause"}</button>
                  <button type="button" onClick={toggleVoice} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold">{voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}Voice {voiceEnabled ? "On" : "Off"}</button>
                </div>
              </div>
              <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{currentSteps.map((step, index) => { const done = completedSteps.includes(index + 1); const current = !done && index === firstIncompleteStep; return <li key={step} className={`flex items-start gap-2 rounded-lg border p-4 ${current ? "border-red-300 bg-red-50" : done ? "border-green-200 bg-green-50" : "border-slate-200"}`}><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${done ? "bg-green-700 text-white" : current ? "bg-red-700 text-white" : "bg-slate-100 text-slate-700"}`}>{done ? <Check className="h-4 w-4" /> : index + 1}</span><span className="flex-1 text-sm font-medium">{step}</span><button type="button" onClick={() => speak(`Step ${index + 1}: ${step}. Follow the action that applies to the incident you described.`)} aria-label={`Listen to step ${index + 1}: ${step}`} title="Listen to this step" className="rounded p-1 text-slate-600 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"><Headphones className="h-4 w-4" /></button></li>; })}</ol>
              <div id="recovery-actions" />
              {!completedSteps.includes(1) && <button type="button" onClick={() => { completeStep(1); persistProgress(caseData, caseData.status, "User confirmed transaction security step"); }} className="mt-4 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50">I have secured the transaction</button>}
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ActionCard icon={<Phone />} title="Call Cyber Helpline" detail="National Cyber Crime Helpline · 1930"><a href="tel:1930" onClick={() => setNotice("If your device cannot place calls, dial 1930 from a phone.")} className="mt-4 inline-flex rounded-lg bg-red-700 px-4 py-2 font-semibold text-white">Call 1930</a></ActionCard>
              {caseData.lostMoney !== "NO" && <ActionCard icon={<Landmark />} title="Notify Financial Institution" detail="Prepare a formal incident notification"><button type="button" onClick={() => setShowBank(true)} className="mt-4 rounded-lg border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50">Notify Bank</button></ActionCard>}
              <ActionCard icon={<Upload />} title="Secure Evidence" detail="Files stay in this browser session; no cloud upload is configured"><a href="#evidence-locker" className="mt-4 inline-flex rounded-lg border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50">Open Evidence Locker</a></ActionCard>
              <ActionCard icon={<FileText />} title="Generate Complaint Letter" detail="Create a separate formal A4 complaint document"><button type="button" onClick={generateComplaintLetter} className="mt-4 rounded-lg border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50">Generate Complaint Letter</button></ActionCard>
              <ActionCard icon={<AlertTriangle />} title="Report Incident" detail="Submit an anonymized community report"><button type="button" onClick={() => document.getElementById("community-report")?.scrollIntoView({ behavior: "smooth" })} className="mt-4 rounded-lg border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50">Report Scam</button></ActionCard>
              <ActionCard icon={<Share2 />} title="Share Recovery Case" detail="Share only with a recipient you choose"><button type="button" onClick={() => document.getElementById("share-report")?.scrollIntoView({ behavior: "smooth" })} className="mt-4 rounded-lg border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50">Share Report</button></ActionCard>
            </section>

            <section id="evidence-locker" className="scroll-mt-24 rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Secure Evidence Locker</h2>
              <p className="mt-2 text-sm text-slate-600">Preserve evidence before deleting messages or contacting the other party. Files are held in browser memory only and are not securely stored or uploaded.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{evidenceCategories.map((category) => <label key={category} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-slate-300 p-4 hover:border-blue-500"><span className="text-sm font-medium">{category}</span><Upload className="h-4 w-4 shrink-0 text-slate-500" /><input type="file" className="sr-only" aria-label={`Upload ${category}`} onChange={(e) => addEvidence(category, e.target.files?.[0])} /></label>)}</div>
              {caseData.evidence.length > 0 && <ul className="mt-5 divide-y">{caseData.evidence.map((item) => <li key={item.id} className="grid gap-2 py-4 text-sm sm:grid-cols-[1fr_auto] sm:items-start"><div><p><strong>{item.category}</strong> · {item.name} · {(item.size / 1024).toFixed(0)} KB</p><p className="mt-1 text-xs text-slate-500">{item.status} · Added {new Date(item.addedAt).toLocaleString()}</p><label className="mt-2 block text-xs font-medium text-slate-700">Evidence description<input value={item.description} onChange={(e) => updateEvidenceDescription(item.id, e.target.value)} maxLength={500} placeholder="What does this file show?" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></label></div><a href={item.url} target="_blank" rel="noreferrer" className="text-blue-700 underline">Preview</a></li>)}</ul>}
            </section>

            <section id="recovery-timeline" className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Evidence and recovery timeline</h2><ol className="mt-4 space-y-3">{timeline.map((item, index) => <li key={`${item.event}-${index}`} className="flex gap-3 border-l-2 border-blue-200 pb-3 pl-4"><span className="mt-1 h-2 w-2 -translate-x-[21px] rounded-full bg-blue-700" /><div><p className="text-sm font-medium">{item.event}</p><time className="text-xs text-slate-500" dateTime={item.date}>{new Date(item.date).toLocaleString()}</time></div></li>)}</ol></section>

            <section id="complaint-preview" className="scroll-mt-24 rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="text-xl font-bold">Complaint Letter</h2><p className="mt-1 text-sm text-slate-600">A separate formal complaint generated only from this recovery case. Missing facts are marked “Not provided”.</p></div>
                {complaintGenerated && <button type="button" onClick={() => setComplaintVisible(!complaintVisible)} className="rounded-lg border px-4 py-2 text-sm font-semibold">{complaintVisible ? "Hide Preview" : "Preview Complaint"}</button>}
              </div>
              {complaintGenerated && <p role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-900">Complaint generated successfully.</p>}
              <div className="mt-4 flex flex-wrap gap-3">
                {!complaintGenerated && <button type="button" onClick={generateComplaintLetter} className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white">Generate Complaint Letter</button>}
                <button type="button" disabled={!complaintGenerated} onClick={downloadComplaintLetterPdf} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-4 w-4" />Download Complaint PDF</button>
                <button type="button" disabled={!complaintGenerated} onClick={() => copyText(complaint, "Complaint text copied.")} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50"><Clipboard className="h-4 w-4" />Copy Complaint Text</button>
                <button type="button" disabled={!complaintGenerated} onClick={openOfficialCyberCrimePortal} className="rounded-lg bg-red-700 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Open Official Cyber Crime Portal</button>
              </div>
              {complaintGenerated && complaintVisible && complaintDocument && <div className="mt-8 overflow-x-auto bg-slate-100 p-2 sm:p-6"><ComplaintLetterPreview data={complaintDocument} /></div>}
              <p className="mt-3 text-xs text-slate-500">The portal handoff copies the complaint and opens the government website. Review and submit it there; CareerGuardian AI does not submit it on your behalf.</p>
            </section>

            {bankNotice && <section className="rounded-2xl border border-blue-200 bg-white p-6"><h2 className="font-bold">Financial institution notification</h2><textarea readOnly value={bankNotice} rows={9} className="mt-4 w-full rounded-lg border p-4 text-sm leading-6" /><button type="button" onClick={() => copyText(bankNotice, "Bank notification copied.")} className="mt-3 rounded-lg border px-4 py-2 font-semibold">Copy Notification</button><button type="button" onClick={() => { const pdf = new jsPDF(); pdf.setFontSize(11); pdf.text(pdf.splitTextToSize(bankNotice, 175), 18, 20); pdf.save(`${caseData.caseId}-bank-notification.pdf`); }} className="ml-3 mt-3 rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white">Download Notification PDF</button></section>}

            <section id="community-report" className="scroll-mt-24 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Anonymized Community Report</h2><p className="mt-2 text-sm text-slate-600">This public report excludes your contact details and evidence. Do not include names, phone numbers, email addresses, or exact addresses.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm">Category<select value={communityCategory} onChange={(e) => setCommunityCategory(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2">{["Fake Job Fee", "Impersonation", "Phishing", "Fake Interview", "Other"].map((category) => <option key={category}>{category}</option>)}</select></label><label className="text-sm">City / region (optional)<input value={communityLocation} onChange={(e) => setCommunityLocation(e.target.value)} maxLength={80} placeholder="City or region only" className="mt-2 w-full rounded-lg border px-3 py-2" /></label><label className="text-sm sm:col-span-2">Public summary (optional)<textarea value={communityDescription} onChange={(e) => setCommunityDescription(e.target.value)} maxLength={500} rows={3} placeholder="Briefly describe the suspicious recruitment behavior without personal details" className="mt-2 w-full rounded-lg border px-3 py-2" /></label></div><button type="button" onClick={submitCommunityReport} className="mt-4 rounded-lg border px-4 py-2 font-semibold">Submit anonymized report</button>{communityStatus && <p role="status" className="mt-3 text-sm text-slate-700">{communityStatus}</p>}</section>

            <section id="share-report" className="scroll-mt-24 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Share Emergency Report</h2><p className="mt-2 text-sm text-slate-600">Sharing opens a device-supported share sheet or WhatsApp. Nothing is sent silently.</p><label className="mt-4 block text-sm font-medium">Recipient WhatsApp number with country code<input type="tel" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Example: 919876543210" className="mt-2 w-full max-w-md rounded-lg border px-4 py-3" /></label><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={shareReport} className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white">Share via WhatsApp</button><button type="button" onClick={() => copyText(`CareerGuardian AI Recovery Alert\nCase ID: ${caseData.caseId}\nIncident Date: ${safeValue(caseData.incidentDate)}\nStatus: ${caseData.status}`, "Share message copied.")} className="rounded-lg border px-4 py-2 font-semibold">Copy Message</button><button type="button" onClick={async () => { const file = new File([complaint], `${caseData.caseId}-complaint.txt`, { type: "text/plain" }); if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: "Recovery case report" }); else setNotice("This browser cannot share files directly. Download the PDF report and attach it yourself."); }} className="rounded-lg border px-4 py-2 font-semibold">Share Report</button></div></section>

            <section id="recovery-case-summary" className="rounded-2xl border bg-white p-6"><div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-blue-700" /><h2 className="text-xl font-bold">Recovery Case Summary</h2></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><p className="text-sm"><strong>Case ID:</strong> {caseData.caseId}</p><p className="text-sm"><strong>Status:</strong> {caseData.status.replaceAll("_", " ")}</p><p className="text-sm"><strong>Evidence items:</strong> {caseData.evidence.length}</p><p className="text-sm"><strong>Next recommended action:</strong> {caseData.lostMoney === "NO" ? "Preserve evidence and report the incident" : "Contact your financial institution promptly"}</p></div><button type="button" onClick={downloadRecoveryReportPdf} className="mt-5 inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-semibold"><Download className="h-4 w-4" />Download Recovery Report</button><p className="mt-5 border-t pt-4 text-sm text-slate-500">This case is available only during this browser session unless the save-to-account API confirms success.</p></section>

            <RecoveryAssistant
              recoveryCase={{
                caseId: caseData.caseId,
                status: caseData.status,
                organization: caseData.organization,
                recruiter: caseData.recruiter,
                jobTitle: caseData.jobTitle,
                incidentDate: caseData.incidentDate,
                description: caseData.description,
                lostMoney: caseData.lostMoney,
                amount: caseData.amount,
                paymentMethod: caseData.paymentMethod,
                phone: caseData.phone,
                email: caseData.email,
                location: caseData.location,
                evidence: caseData.evidence.map(({ category, name }) => ({ category, name })),
                timeline,
                completedActions: [
                  ...(caseData.evidence.length ? ["evidence_uploaded"] : []),
                  ...(completedSteps.includes(caseData.lostMoney === "NO" ? 2 : 3) ? ["evidence_uploaded"] : []),
                  ...(completedSteps.includes(caseData.lostMoney === "NO" ? 3 : 4) || complaintGenerated ? ["complaint_generated"] : []),
                  ...(completedSteps.includes(caseData.lostMoney === "NO" ? 4 : 5) ? ["reported"] : []),
                  ...(completedSteps.includes(caseData.lostMoney === "NO" ? 1 : 2) ? ["bank_notified"] : []),
                ],
                pendingActions: currentSteps.filter((_, index) => !completedSteps.includes(index + 1)),
                trustScore: typeof verification?.trustScore === "number" ? verification.trustScore : null,
                verdict: typeof verification?.verdict === "string" ? verification.verdict : undefined,
              }}
              voiceEnabled={voiceEnabled}
              getVoicePlaybackState={getVoicePlaybackState}
              onAction={(action) => {
                if (action === "call_1930") window.location.href = "tel:1930";
                if (action === "notify_bank") { setShowBank(true); document.getElementById("recovery-actions")?.scrollIntoView({ behavior: "smooth" }); }
                if (action === "open_evidence") document.getElementById("evidence-locker")?.scrollIntoView({ behavior: "smooth" });
                if (action === "generate_complaint") generateComplaintLetter();
                if (action === "download_complaint") complaintGenerated ? downloadComplaintLetterPdf() : generateComplaintLetter();
                if (action === "report_incident") document.getElementById("recovery-actions")?.scrollIntoView({ behavior: "smooth" });
                if (action === "view_timeline") document.getElementById("recovery-timeline")?.scrollIntoView({ behavior: "smooth" });
                if (action === "view_case") document.getElementById("recovery-case-summary")?.scrollIntoView({ behavior: "smooth" });
              }}
            />
            <CommunityAlerts />
            <ScamHeatMap />
          </div>
        )}

        {(notice || error) && mode === "dashboard" && <div role={error ? "alert" : "status"} className={`fixed bottom-5 right-5 z-40 max-w-md rounded-lg border p-4 shadow-lg ${error ? "border-red-200 bg-red-50 text-red-900" : "border-blue-200 bg-white text-slate-900"}`}><div className="flex items-start justify-between gap-4"><p className="text-sm">{error || notice}</p><button type="button" aria-label="Dismiss message" onClick={() => { setNotice(""); setError(""); }}><X className="h-4 w-4" /></button></div></div>}

        {showBank && caseData && <div role="dialog" aria-modal="true" aria-labelledby="bank-notice-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 id="bank-notice-title" className="text-2xl font-bold">Notify Financial Institution</h2><p className="mt-2 text-sm text-slate-600">Prepare a formal incident notification using details from your recovery case.</p></div><button type="button" onClick={() => setShowBank(false)} aria-label="Close dialog"><X /></button></div><label className="mt-5 block text-sm font-medium">Selected institution<input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Enter bank or payment institution" className="mt-2 w-full rounded-lg border px-4 py-3" /></label><dl className="mt-4 grid gap-3 sm:grid-cols-2">{[["Selected institution", safeValue(institution)], ["Incident date", safeValue(caseData.incidentDate)], ["Transaction type", safeValue(caseData.paymentMethod)], ["Amount", caseData.amount ? `INR ${caseData.amount}` : "Not provided"]].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-3"><dt className="text-xs uppercase text-slate-500">{label}</dt><dd className="mt-1 text-sm font-medium">{value}</dd></div>)}</dl><label className="mt-4 block text-sm font-medium">Reference / Transaction ID<input value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="mt-2 w-full rounded-lg border px-4 py-3" /></label><p className="mt-3 text-sm text-slate-600">Description: {caseData.description}</p><div className="mt-6 flex flex-wrap items-center gap-3"><button type="button" onClick={() => { prepareBankNotice(); setShowBank(false); }} className="rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white">Generate Bank Notification</button>{officialBankUrl && <a href={officialBankUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border px-4 py-3 text-sm font-semibold">Open Official Bank Contact</a>}<p className="text-xs text-slate-500">Use a contact number or official URL printed on your bank card or statement. We do not redirect to a bank homepage.</p></div></div></div>}
      </div>
    </main>
  );
}

function ActionCard({ icon, title, detail, children }: { icon: React.ReactNode; title: string; detail: string; children: React.ReactNode }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-800">{icon}</div><h2 className="mt-4 font-bold">{title}</h2><p className="mt-1 text-sm text-slate-600">{detail}</p>{children}</article>;
}
