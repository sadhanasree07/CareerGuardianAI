import { NextResponse } from "next/server";
import groq from "@/lib/groq";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

function getUserId(request: Request) {
  const token = request.headers.get("cookie")?.match(/(?:^|; )token=([^;]+)/)?.[1];
    const decoded = token ? verifyToken(token) as { id?: string } | null : null;
  return decoded?.id || null;
}

function safeError(error: unknown) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return message
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"']+/gi, "[redacted MongoDB URI]")
    .replace(/gsk_[A-Za-z0-9_-]+/g, "[redacted API key]")
    .replace(/(?:Bearer\s+)[A-Za-z0-9._~-]+/gi, "Bearer [redacted token]")
    .slice(0, 500);
}

function serverError(error: unknown, status = 503) {
  if (process.env.NODE_ENV === "development") {
    const detail = safeError(error);
    console.error("[Recovery Chat] FAILED", {
      name: error instanceof Error ? error.name : "Error",
      message: detail,
      stack: error instanceof Error ? safeError(new Error(error.stack || "")).slice(0, 1200) : undefined,
    });
  }
  return NextResponse.json({ success: false, error: "AI service is temporarily unavailable" }, { status });
}

const allowedActions = new Set(["call_1930", "notify_bank", "open_evidence", "generate_complaint", "download_complaint", "report_incident", "view_timeline", "view_case"]);

export async function POST(request: Request) {
  const dev = process.env.NODE_ENV === "development";
  const log = (message: string, detail?: unknown) => { if (dev) console.info(`[Recovery Chat] ${message}`, ...(detail === undefined ? [] : [detail])); };
  log("request received");
  let authenticated = false;
  let caseFound = false;

  try {
    let userId: string | null = null;
    try {
      userId = getUserId(request);
    } catch (error) {
      console.warn("[Recovery Chat] authentication token could not be verified:", safeError(error));
    }
    authenticated = Boolean(userId);
    log(`authenticated: ${authenticated}`);

    let body: Record<string, any>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON request body" }, { status: 400 });
    }
    log("body parsed");
    log("body keys", Object.keys(body));
    const userMessage = typeof body.userMessage === "string" ? body.userMessage.trim().slice(0, 2000) : "";
    const clientCase = body.recoveryCase && typeof body.recoveryCase === "object" && !Array.isArray(body.recoveryCase) ? body.recoveryCase : null;
    const caseId = typeof clientCase?.caseId === "string" ? clientCase.caseId.slice(0, 64) : "";
    const language = typeof body.language === "string" && ["en", "ta", "hi", "te", "ml", "kn"].includes(body.language) ? body.language : "en";
    if (!userMessage || !clientCase || !caseId) return NextResponse.json({ success: false, error: "Message and recovery case context are required" }, { status: 400 });
    log(`caseId: ${caseId ? "present" : "missing"}`);
    log(`recovery context: ${clientCase ? "present" : "missing"}`);
    log(`language: ${language}`);
    log(`conversation history count: ${Array.isArray(body.conversationHistory) ? body.conversationHistory.length : 0}`);

    // RecoveryAssistant sends the active case context with every message. Chat does not need
    // to query MongoDB, which also keeps guest/session-only cases working during DB outages.
    const mongoRequired = false;
    const storedCase: Record<string, any> | null = null;
    caseFound = Boolean(clientCase.caseId);
    log(`recovery case found: ${caseFound ? "yes" : "no"}`);
    log(`MongoDB required: ${mongoRequired ? "yes" : "no"}`);

    const source = storedCase || {
      caseId: clientCase.caseId, status: clientCase.status, organization: clientCase.organization,
      recruiter: clientCase.recruiter, jobTitle: clientCase.jobTitle, incidentDate: clientCase.incidentDate,
      incidentDescription: clientCase.description, lostMoney: clientCase.lostMoney, amount: clientCase.amount,
      paymentMethod: clientCase.paymentMethod, bank: clientCase.bank, location: clientCase.location,
      evidence: clientCase.evidence, timeline: clientCase.timeline,
      verifiedContext: { trustScore: clientCase.trustScore, verdict: clientCase.verdict },
      completedActions: clientCase.completedActions, pendingActions: clientCase.pendingActions,
    };

    const context = {
      caseId: source.caseId, status: source.status, organization: source.organization,
      recruiter: source.recruiter, opportunity: source.jobTitle, incidentDate: source.incidentDate,
      incidentDescription: source.incidentDescription, moneyLost: source.lostMoney,
      amount: source.amount, paymentMethod: source.paymentMethod, bank: source.bank || "Not provided",
      location: source.location, evidence: ((source.evidence || []) as Record<string, unknown>[]).map((item) => ({ category: item.category, name: item.name })),
      timeline: ((source.timeline || []) as Record<string, unknown>[]).map((item) => ({ event: item.event, date: item.date })),
      verificationResult: source.verifiedContext,
    };
    const timelineText = context.timeline.map((item: { event: unknown }) => String(item.event || "")).join(" | ").toLowerCase();
    const inferredCompleted = [
      ...(context.evidence.length ? ["evidence_uploaded"] : []),
      ...(source.status === "BANK_NOTIFIED" || /bank notification prepared|financial institution notified/.test(timelineText) ? ["bank_notified"] : []),
      ...(source.status === "COMPLAINT_READY" || /complaint letter generated|complaint generated/.test(timelineText) ? ["complaint_generated"] : []),
      ...(source.status === "REPORTED" || /reported|community report submitted/.test(timelineText) ? ["reported"] : []),
    ];
    const completedActions = [...new Set([...(Array.isArray(source.completedActions) ? source.completedActions : []), ...inferredCompleted])];
    const pendingActions = Array.isArray(source.pendingActions) ? source.pendingActions : (context.moneyLost === "NO"
      ? ["preserve_evidence", "verify_opportunity", "report_incident"]
      : ["secure_transaction", "notify_bank", "preserve_evidence", "generate_complaint", "report_incident"]
    ).filter((action) => !(
      (action === "notify_bank" && completedActions.includes("bank_notified")) ||
      (action === "preserve_evidence" && completedActions.includes("evidence_uploaded")) ||
      (action === "generate_complaint" && completedActions.includes("complaint_generated")) ||
      (action === "report_incident" && completedActions.includes("reported"))
    ));
    const safeCase = { ...context, completedActions, pendingActions };

    const keyAvailable = Boolean(process.env.GROQ_API_KEY?.trim());
    log(`Groq key available: ${keyAvailable ? "yes" : "no"}`);
    if (!keyAvailable) {
      if (dev) console.error("[Recovery Chat] FAILED", { name: "ConfigurationError", message: "GROQ_API_KEY is not configured" });
      return NextResponse.json({ success: false, error: "AI service is not configured" }, { status: 503 });
    }

    const rawHistory = Array.isArray(body.conversationHistory) ? body.conversationHistory.slice(-12) : [];
    const messages = [
      { role: "system" as const, content: `You are CareerGuardian AI Recovery Assistant. Help the user navigate their current recruitment-scam recovery case. Answer the actual latest question using only supplied recovery context and conversation history; never invent facts. Do not assume money was lost unless the case states that. Do not repeat a generic emergency answer when the question changes. Use completed and pending recovery actions to choose the next useful step. Never ask for passwords, OTPs, PINs, CVVs, UPI PINs, bank login credentials, or authentication tokens. Do not claim an authority or financial institution has acted unless supplied data confirms it. Use careful wording such as reported, provided, pending, and based on available information. Respond entirely in the selected language (${language}). If moneyLost is NO, provide prevention and reporting guidance without implying financial loss. When an existing application action is relevant, include only one or more action markers from this set: [[ACTION:call_1930]], [[ACTION:notify_bank]], [[ACTION:open_evidence]], [[ACTION:generate_complaint]], [[ACTION:download_complaint]], [[ACTION:report_incident]], [[ACTION:view_timeline]], [[ACTION:view_case]]. Case context: ${JSON.stringify(safeCase)}` },
      ...rawHistory.filter((item: { role?: unknown; content?: unknown }) => (item?.role === "user" || item?.role === "assistant") && typeof item.content === "string").map((item: { role: "user" | "assistant"; content: string }) => ({ role: item.role, content: item.content.slice(0, 2000) })),
      { role: "user" as const, content: userMessage },
    ];

    log("starting AI request");
    let completion;
    try {
      completion = await groq.chat.completions.create({ model: "openai/gpt-oss-120b", messages, temperature: 0.4, max_completion_tokens: 700, reasoning_effort: "low", reasoning_format: "hidden" });
    } catch (error) {
      const detail = safeError(error);
      if (dev) console.error("[Recovery Chat] FAILED", { name: error instanceof Error ? error.name : "Error", message: detail });
      const status = /401|invalid api key|authentication/i.test(detail) ? 503 : /429/.test(detail) ? 429 : /400|model.*(not found|decommission|retired|invalid)/i.test(detail) ? 500 : 502;
      const userError = status === 503 ? "AI service is not configured" : status === 429 ? "AI service is busy. Please try again shortly" : status === 500 ? "AI service configuration error" : "AI service is temporarily unavailable";
      return NextResponse.json({ success: false, error: userError }, { status });
    }
    log("AI request completed");
    const completionText = completion.choices[0]?.message?.content;
    if (typeof completionText !== "string" || !completionText.trim()) return serverError(new Error("Groq returned an empty response"), 502);
    const actions = [...completionText.matchAll(/\[\[ACTION:([a-z_]+)\]\]/g)].map((match) => match[1]).filter((action) => allowedActions.has(action));
    const reply = completionText.replace(/\s*\[\[ACTION:[a-z_]+\]\]\s*/g, "\n").trim();
    const labels: Record<string, string> = { call_1930: "Call 1930", notify_bank: "Notify Financial Institution", open_evidence: "Open Evidence Locker", generate_complaint: "Generate Complaint", download_complaint: "Download Complaint", report_incident: "Report Incident", view_timeline: "View Recovery Timeline", view_case: "View Recovery Case" };
    log("response prepared");
    return NextResponse.json({ success: true, reply, actions: [...new Set(actions)].map((id) => ({ id, label: labels[id] })) });
  } catch (error) {
    return serverError(error, 500);
  }
}
