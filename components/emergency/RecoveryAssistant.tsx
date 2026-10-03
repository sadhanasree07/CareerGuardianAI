"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Send, User, Sparkles, ShieldCheck, RotateCw } from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";
import { speakText } from "@/src/lib/speech";

type RecoveryCaseContext = {
  caseId: string; status: string; organization: string; recruiter: string; jobTitle: string;
  incidentDate: string; description: string; lostMoney: string; amount: string;
  paymentMethod: string; phone: string; email: string; location: string;
  evidence: { category: string; name: string }[]; timeline: { event: string; date: string }[];
  completedActions: string[]; pendingActions: string[]; trustScore?: number | null; verdict?: string;
};

type Action = { id: string; label: string; href?: string };
type ChatMessage = { role: "user" | "assistant"; content: string; actions?: Action[] };
type Props = {
  recoveryCase: RecoveryCaseContext;
  voiceEnabled: boolean;
  getVoicePlaybackState: () => { enabled: boolean; session: number };
  onAction: (action: string) => void;
};

const historyKey = (caseId: string) => `recovery-chat-${caseId}`;
const welcome = (c: RecoveryCaseContext) => `Hello. I'm your CareerGuardian Recovery Assistant. I can guide you through this recovery case step by step.\n\nYour current case involves ${c.organization || "an organization not specified in this case"} and is currently ${c.status.replaceAll("_", " ")}.\n\nYou can ask me about securing a transaction, notifying your financial institution, preserving evidence, generating a complaint, reporting the incident, or tracking the case.`;

export default function RecoveryAssistant({ recoveryCase, voiceEnabled, getVoicePlaybackState, onAction }: Props) {
  const { language } = useLanguage();
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [retryMessage, setRetryMessage] = useState("");
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(historyKey(recoveryCase.caseId));
      const parsed = saved ? JSON.parse(saved) as ChatMessage[] : [];
      setConversation(parsed.length ? parsed : [{ role: "assistant", content: welcome(recoveryCase) }]);
    } catch {
      setConversation([{ role: "assistant", content: welcome(recoveryCase) }]);
    }
  }, [recoveryCase]);

  useEffect(() => {
    if (conversation.length && typeof window !== "undefined") {
      sessionStorage.setItem(historyKey(recoveryCase.caseId), JSON.stringify(conversation.slice(-30)));
    }
  }, [conversation, recoveryCase.caseId]);

  const caseContext = useMemo(() => recoveryCase, [recoveryCase]);

  async function submit(text = message) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const voiceSession = getVoicePlaybackState().session;
    const isRetry = trimmed === retryMessage && Boolean(error);
    const history = isRetry ? conversation : [...conversation, { role: "user" as const, content: trimmed }];
    if (!isRetry) {
      setConversation(history);
    }
    setBusy(true);
    setError("");
    setRetryMessage(trimmed);
    try {
      const response = await fetch("/api/recovery/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, recoveryCase: caseContext, conversationHistory: (isRetry ? conversation.slice(0, -1) : conversation).slice(-12), userMessage: trimmed }),
      });
      const result = await response.json();
      if (!response.ok || !result.success || typeof result.reply !== "string") {
        const failure = new Error(typeof result.error === "string" ? result.error : "Chat request failed") as Error & { status?: number };
        failure.status = response.status;
        throw failure;
      }
      setMessage("");
      const answer: ChatMessage = { role: "assistant", content: result.reply, actions: Array.isArray(result.actions) ? result.actions : [] };
      setConversation((current) => [...current, answer]);
      const playbackState = getVoicePlaybackState();
      if (mountedRef.current && voiceEnabled && playbackState.enabled && playbackState.session === voiceSession) speakText(answer.content, language);
    } catch (failure) {
      const status = (failure as Error & { status?: number }).status;
      setMessage(trimmed);
      setError(status === 400 ? "Please resend your message."
        : status === 404 ? "Your recovery case could not be loaded. Please try again."
        : status === 429 ? "CareerGuardian AI is busy. Please try again shortly."
        : status === 500 || status === 503 ? "CareerGuardian AI is temporarily unavailable. Please try again."
        : "I'm temporarily unable to process that message. Your recovery case is still safe. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-16 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5 shadow-xl sm:p-10">
      <div className="text-center">
        <span className="rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold text-blue-700">AI RECOVERY ASSISTANT</span>
        <h2 className="mt-5 text-3xl font-bold text-slate-900 sm:text-4xl">Emergency AI Chat Assistant</h2>
        <p className="mt-3 text-slate-600">Get recovery guidance based on your current case.</p>
      </div>
      <div className="mt-8 rounded-3xl bg-white shadow-lg sm:mt-12">
        <div className="flex items-center gap-4 border-b p-5 sm:p-6"><div className="rounded-2xl bg-blue-100 p-3"><Bot className="h-8 w-8 text-blue-600" /></div><div><h3 className="text-xl font-bold">CareerGuardian AI</h3><p className="text-sm text-green-600">● Online · Case {recoveryCase.caseId}</p></div></div>
        <div className="max-h-[32rem] space-y-5 overflow-y-auto p-4 sm:p-8" aria-live="polite">
          {conversation.map((chat, index) => <div key={`${chat.role}-${index}`} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xl rounded-3xl p-4 shadow sm:p-5 ${chat.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900"}`}>
              <div className="mb-2 flex items-center gap-2">{chat.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5 text-blue-600" />}<span className="font-semibold">{chat.role === "user" ? "You" : "CareerGuardian AI"}</span></div>
              <div className="space-y-2 leading-7">{chat.content.split("\n").map((line, lineIndex) => <p key={lineIndex}>{line || "\u00a0"}</p>)}</div>
              {!!chat.actions?.length && <div className="mt-4 flex flex-wrap gap-2">{chat.actions.map((action) => action.href ? <a key={action.id} href={action.href} className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">{action.label}</a> : <button key={action.id} type="button" onClick={() => onAction(action.id)} className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">{action.label}</button>)}</div>}
            </div>
          </div>)}
          {busy && <p className="text-sm text-slate-500" role="status">Preparing case-specific guidance…</p>}
          {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}<button type="button" onClick={() => void submit(retryMessage)} className="ml-3 inline-flex items-center gap-1 font-semibold underline"><RotateCw className="h-4 w-4" />Try Again</button></div>}
        </div>
        <form className="flex gap-3 border-t p-4 sm:p-6" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
          <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about this recovery case…" aria-label="Message CareerGuardian AI" className="min-w-0 flex-1 rounded-2xl border border-slate-300 p-3 outline-none focus:border-blue-500 sm:p-4" />
          <button type="submit" disabled={busy || !message.trim()} aria-label="Send message" className="rounded-2xl bg-blue-600 px-4 text-white transition hover:bg-blue-700 disabled:opacity-50 sm:px-6"><Send className="h-6 w-6" /></button>
        </form>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-white p-5 shadow"><Sparkles className="h-9 w-9 text-blue-600" /><h3 className="mt-4 text-lg font-bold">Case-aware Guidance</h3><p className="mt-2 text-sm text-slate-600">Answers reflect your recovery status and completed steps.</p></div><div className="rounded-2xl bg-white p-5 shadow"><ShieldCheck className="h-9 w-9 text-green-600" /><h3 className="mt-4 text-lg font-bold">Practical Support</h3><p className="mt-2 text-sm text-slate-600">Get help with evidence, complaints, and reporting.</p></div><div className="rounded-2xl bg-white p-5 shadow"><Bot className="h-9 w-9 text-purple-600" /><h3 className="mt-4 text-lg font-bold">Language and Voice</h3><p className="mt-2 text-sm text-slate-600">Responses use your selected language and voice preference.</p></div></div>
    </section>
  );
}
