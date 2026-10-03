import { NextResponse } from "next/server";
import { analyzeThreatNet, threatNetConfig } from "@/lib/threatnet";

export async function POST(request: Request) {
  if (!threatNetConfig.enabled) return NextResponse.json({ success: false, enabled: false, message: "ThreatNet is disabled." }, { status: 404 });
  try {
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text : "";
    if (!text.trim() || text.length > 30000) return NextResponse.json({ success: false, message: "Provide recruitment text up to 30,000 characters." }, { status: text.length > 30000 ? 413 : 400 });
    const allowedSourceTypes = new Set(["pdf", "image", "whatsapp", "text", "url", "audio", "recording"]);
    const sourceType = typeof body.sourceType === "string" && allowedSourceTypes.has(body.sourceType) ? body.sourceType : "text";
    const result = await analyzeThreatNet({ text, company: typeof body.company === "string" ? body.company.slice(0, 200) : "", jobRole: typeof body.jobRole === "string" ? body.jobRole.slice(0, 200) : "", website: typeof body.website === "string" ? body.website.slice(0, 500) : "", phone: typeof body.phone === "string" ? body.phone.slice(0, 50) : "", notificationNumber: typeof body.notificationNumber === "string" ? body.notificationNumber.slice(0, 100) : "" });
    return NextResponse.json({ success: true, sourceType, threatIntelligence: result });
  } catch (error) {
    console.error("[ThreatNet] Analysis failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ success: false, message: "ThreatNet analysis is temporarily unavailable." }, { status: 503 });
  }
}
