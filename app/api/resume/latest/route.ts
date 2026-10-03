import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Resume from "@/models/Resume";
import { getPremiumAccess } from "@/lib/premiumAccess";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const decoded = token ? verifyToken(token) as { id?: string } | null : null;
    if (token && !decoded?.id) return NextResponse.json({ success: false, message: "Invalid or expired session." }, { status: 401 });
    const userId = decoded?.id || "demo-user";
    const db = await connectDB();
    if (!db) return NextResponse.json({ success: false, message: "Database unavailable." }, { status: 503 });
    const versionId = req.nextUrl.searchParams.get("versionId");
    if (versionId) {
      const access = await getPremiumAccess(req);
      if (!access) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      if (!access.premiumUnlocked) return NextResponse.json({ success: false, message: "Premium access required." }, { status: 403 });
      const version = await Resume.findOne({ _id: versionId, userId: access.userId, isMaster: false }).lean();
      if (!version) return NextResponse.json({ success: false, message: "Resume version not found." }, { status: 404 });
      return NextResponse.json({ success: true, data: version });
    }
    const saved = await Resume.findOne({ userId, isMaster: { $ne: false } }).sort({ updatedAt: -1 }).lean();
    if (!saved) return NextResponse.json({ success: false, message: "No saved resume." }, { status: 404 });
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("Resume restore error:", error);
    return NextResponse.json({ success: false, message: "Unable to restore saved resume." }, { status: 500 });
  }
}
