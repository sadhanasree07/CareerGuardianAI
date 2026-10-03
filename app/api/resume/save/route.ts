import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Resume from "@/models/Resume";
import User from "@/models/User";
import { getPremiumAccess } from "@/lib/premiumAccess";

function getUserId(req: NextRequest): string | null {
  const token = req.cookies.get("token")?.value;
  const decoded = token ? verifyToken(token) as { id?: string } | null : null;
  if (token && !decoded?.id) return null;
  return decoded?.id || "demo-user";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.resume || typeof body.resume !== "object" || Array.isArray(body.resume)) {
      return NextResponse.json({ success: false, message: "Resume data is required." }, { status: 400 });
    }
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ success: false, message: "Invalid or expired session." }, { status: 401 });
    const db = await connectDB();
    if (!db) return NextResponse.json({ success: false, message: "Database unavailable. Your browser draft is still saved." }, { status: 503 });
    if (typeof body.versionId === "string") {
      const access = await getPremiumAccess(req);
      if (!access) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      if (!access.premiumUnlocked) return NextResponse.json({ success: false, message: "Premium access required." }, { status: 403 });
      const version = await Resume.findOneAndUpdate(
        { _id: body.versionId, userId: access.userId, isMaster: false },
        { $set: { resume: body.resume } },
        { new: true },
      );
      if (!version) return NextResponse.json({ success: false, message: "Resume version not found." }, { status: 404 });
      const user = await User.findById(access.userId);
      if (user && user.jobReadinessCheck) {
        user.careerJourneyStage = version.jobId ? "TARGETED_RESUME" : "RESUME_REVIEWED";
        await user.save();
      }
      return NextResponse.json({ success: true, data: { id: version._id, versionId: version._id, resumeVersion: version.resumeVersion } });
    }
    const saved = await Resume.findOneAndUpdate(
      { userId, isMaster: { $ne: false } },
      { $set: { resume: body.resume, isMaster: true, title: "MASTER RESUME" } },
      { new: true, upsert: true, sort: { updatedAt: -1 }, setDefaultsOnInsert: true },
    );
    return NextResponse.json({ success: true, data: { id: saved._id } });
  } catch (error) {
    console.error("Resume save error:", error);
    return NextResponse.json({ success: false, message: "Unable to save this resume." }, { status: 500 });
  }
}
