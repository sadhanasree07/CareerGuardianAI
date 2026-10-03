import { NextResponse } from "next/server";
import { analyzeLinks, linkSentinelConfig } from "@/lib/linkSentinel";

export async function POST(request: Request) {
  if (!linkSentinelConfig.enabled) return NextResponse.json({ success: false, enabled: false, status: "DISABLED", message: "Link Sentinel is disabled." }, { status: 404 });
  try {
    const body = await request.json();
    const rawUrl = typeof body.rawUrl === "string" ? body.rawUrl.slice(0, 2048) : "";
    const contextText = typeof body.contextText === "string" ? body.contextText.slice(0, 30000) : "";
    const claimedOrganization = typeof body.claimedOrganization === "string" ? body.claimedOrganization.slice(0, 150) : "";
    if (!rawUrl && !contextText) return NextResponse.json({ success: false, message: "Provide a URL or recruitment text to analyze." }, { status: 400 });
    const urlsAnalyzed = await analyzeLinks(contextText, claimedOrganization, rawUrl);
    return NextResponse.json({ success: true, enabled: true, status: "AVAILABLE", urlsAnalyzed, analyzedCount: urlsAnalyzed.length });
  } catch (error) {
    console.error("[LinkSentinel] API analysis failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ success: false, enabled: true, status: "UNAVAILABLE", urlsAnalyzed: [] }, { status: 503 });
  }
}
