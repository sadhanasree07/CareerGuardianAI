import { NextRequest, NextResponse } from "next/server";
import groq from "@/lib/groq";
import type { RecordingKeyEvidence, TranscriptSegment } from "@/lib/recordingEvidence";

export const runtime = "nodejs";
export const maxDuration = 120;
const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_AUDIO = /\.(mp3|wav|m4a|ogg|webm)$/i;

const languageCodes: Record<string, string> = { en: "en", ta: "ta", hi: "hi", te: "te", ml: "ml", kn: "kn" };
const formatTime = (seconds: number) => Math.max(0, Number(seconds) || 0);

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("audio");
    const selectedLanguage = String(form.get("selectedApplicationLanguage") || "en").slice(0, 8);
    if (!(file instanceof File)) return NextResponse.json({ success: false, message: "Choose an audio recording to transcribe." }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ success: false, message: "Recording is too large to process. Choose a shorter recording or supported file under 25 MB." }, { status: 413 });
    if (!ALLOWED_AUDIO.test(file.name) || file.type.startsWith("video/")) return NextResponse.json({ success: false, message: "The uploaded audio format is not supported. Extract audio from the video first, then upload MP3, WAV, M4A, OGG, or WEBM audio." }, { status: 415 });
    if (!process.env.GROQ_API_KEY) return NextResponse.json({ success: false, message: "Speech transcription is not configured on the server." }, { status: 503 });

    const language = languageCodes[selectedLanguage];
    const transcription = await groq.audio.transcriptions.create({
      file, model: "whisper-large-v3", response_format: "verbose_json", timestamp_granularities: ["segment"],
      ...(language ? { language } : {}),
    }, { signal: AbortSignal.timeout(90_000) }) as unknown as {
      text?: string; language?: string; duration?: number;
      segments?: Array<{ start?: number; end?: number; text?: string }>;
    };
    const segments: TranscriptSegment[] = (transcription.segments || [])
      .filter((segment) => typeof segment.text === "string" && segment.text.trim())
      .slice(0, 1500)
      .map((segment, index) => ({ id: index, startTime: formatTime(segment.start || 0), endTime: formatTime(segment.end || segment.start || 0), speaker: "Speaker — unknown", text: segment.text!.trim() }));
    const rawTranscript = segments.length ? segments.map((segment) => segment.text).join(" ").trim() : String(transcription.text || "").trim();
    if (!rawTranscript) return NextResponse.json({ success: false, message: "No speech/audio track could be transcribed from this recording." }, { status: 422 });

    let keyEvidence: RecordingKeyEvidence[] = [];
    if (segments.length) {
      try {
        const evidenceResponse = await groq.chat.completions.create({
          model: "openai/gpt-oss-120b", temperature: 0, response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "Extract only materially relevant recruitment statements present in the supplied timestamped speech transcript. Preserve each quotation verbatim in its spoken language and cite the exact segmentId. Categories can include organization, recruiter identity, job role, salary, interview, payment request, registration/training/credential fee, bank/UPI/OTP/PIN/CVV/password request, urgency, selection/joining claim, location, website/contact, promise/guarantee, threat/pressure, or other. Do not infer scam from a call, personal number, informal speech, accent, grammar, or missing details. Never invent a quote, speaker identity or timestamp. Return JSON {\"items\":[{\"segmentId\":0,\"category\":\"payment request\",\"quote\":\"exact excerpt from that segment\"}]} ." },
            { role: "user", content: JSON.stringify(segments.map(({ id, startTime, endTime, text }) => ({ id, startTime, endTime, text }))) },
          ],
        }, { signal: AbortSignal.timeout(18_000) });
        const parsed = JSON.parse(evidenceResponse.choices[0]?.message?.content || "{}");
        const rawItems = Array.isArray(parsed.items) ? parsed.items.slice(0, 80) : [];
        const safeItems = rawItems.flatMap((item: any) => {
          const source = segments[Number(item.segmentId)];
          const quote = typeof item.quote === "string" ? item.quote.trim() : "";
          if (!source || quote.length < 5 || !source.text.toLowerCase().includes(quote.toLowerCase())) return [];
          const category = typeof item.category === "string" ? item.category.slice(0, 50) : "Other relevant statement";
          return [{ segmentId: source.id, startTime: source.startTime, endTime: source.endTime, category, text: quote, repeatCount: 1, firstOccurrence: source.startTime, subsequentOccurrences: [] as number[] }];
        });
        const normalize = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
        const groups: RecordingKeyEvidence[] = [];
        const similarity = (left: string, right: string) => {
          const a = new Set(normalize(left).split(" ").filter(Boolean));
          const b = new Set(normalize(right).split(" ").filter(Boolean));
          const intersection = [...a].filter((word) => b.has(word)).length;
          return intersection / Math.max(1, new Set([...a, ...b]).size);
        };
        for (const item of safeItems) {
          const match = groups.map((candidate) => ({ candidate, score: similarity(candidate.text, item.text) }))
            .find(({ candidate, score }) => candidate.category.toLowerCase() === item.category.toLowerCase() && score >= 0.4);
          const prior = match?.candidate;
          if (prior) { prior.repeatCount += 1; prior.subsequentOccurrences.push(item.startTime); prior.similarity = Math.max(prior.similarity || 0, match!.score); prior.context = `Related ${item.category} statements at ${prior.subsequentOccurrences.length + 1} distinct transcript segments.`; }
          else groups.push(item);
        }
        keyEvidence = groups;
      } catch { keyEvidence = []; }
    }

    const affirmativePaymentPattern = /\b(pay|payment|transfer|send|fee required|fee mandatory|must pay|registration fee|training fee)\b|₹\s*[\d,]+|\b(rs\.?|rupees?)\s*[\d,]+|[\d,]+\s*(?:रुपये|रुपए|ரூபாய்)|भुगतान|फीस (?:देना|जमा)|கட்டணம் (?:செலுத்த|கட்டாயம்)|பணம் (?:செலுத்த|அனுப்பு)/i;
    const negatedPaymentPattern = /\b(no|without|never|don't|do not|not required|not payable|free of)\b.{0,35}\b(fee|pay|payment)\b|கட்டணம் இல்லை|फीस नहीं|भुगतान नहीं/i;
    const affirmativeCredentialPattern = /\b(send|share|provide|tell|give|submit|reply with)\b.{0,45}\b(otp|pin|cvv|password|bank login|upi)\b|\b(otp|pin|cvv|password)\b.{0,45}\b(send|share|provide|tell|give|submit)\b|ओटीपी.{0,25}(भेज|बत)|otp.{0,25}(அனுப்பு|பகிர்)/i;
    const negatedCredentialPattern = /\b(never|don't|do not|never share|do not share|not ask)\b.{0,45}\b(otp|pin|cvv|password)\b|otp.{0,40}(வேண்டாம்|பகிராதே|அனுப்பாத)|(?:பகிர|அனுப்ப).{0,25}கூடாது|ओटीपी.{0,40}(नहीं|मत)|(?:otp|ओटीपी).{0,30}साझा न करें/i;
    const riskSignals = {
      paymentRequest: keyEvidence.some((item) => /payment|registration fee|training fee|credential fee/i.test(item.category) && affirmativePaymentPattern.test(item.text) && !negatedPaymentPattern.test(item.text)),
      credentialRequest: keyEvidence.some((item) => /otp|pin|cvv|password|credential|bank information|upi/i.test(item.category) && affirmativeCredentialPattern.test(item.text) && !negatedCredentialPattern.test(item.text)),
      urgency: keyEvidence.some((item) => /urgency|threat|pressure/i.test(item.category) && /immediately|right now|within \d+|today only|இப்போதே|तुरंत/i.test(item.text)),
    };
    return NextResponse.json({
      success: true, rawTranscript, cleanTranscript: segments.map((segment) => segment.text).join(" ").replace(/\s+/g, " ").trim(),
      transcriptSegments: segments, transcriptLanguage: transcription.language || "unknown", selectedApplicationLanguage: selectedLanguage,
      duration: Number(transcription.duration) || null, keyEvidence,
      repeatedEvidence: keyEvidence.filter((item) => item.repeatCount > 1),
      recordingRiskSignals: riskSignals,
      recordingSummary: keyEvidence.length ? `${keyEvidence.length} distinct relevant statement(s) extracted from the transcript.` : "No timestamped key statements were extracted; the transcript remains available for review.",
    });
  } catch (error) {
    const message = error instanceof Error && error.name === "TimeoutError"
      ? "Transcription took too long. Choose a shorter recording and try again."
      : "Speech transcription failed. Check the recording format and try again.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
