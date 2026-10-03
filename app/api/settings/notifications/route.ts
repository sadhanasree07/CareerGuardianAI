import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

function userIdFromRequest(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const decoded = token ? verifyToken(token) as { id?: string } | null : null;
  return decoded?.id;
}

export async function GET(req: NextRequest) {
  const userId = userIdFromRequest(req);
  if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  const db = await connectDB();
  if (!db) return NextResponse.json({ success: false, message: "Database is temporarily unavailable. Please try again later." }, { status: 503 });
  const user = await User.findById(userId).select("jobNotificationPreferences").lean();
  return NextResponse.json({ success: true, preferences: user?.jobNotificationPreferences || { enabled: false, frequency: "daily", minimumMatchScore: 60, categories: ["new-openings", "career-recommendations"] } });
}

export async function PUT(req: NextRequest) {
  const userId = userIdFromRequest(req);
  if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const preferences = {
      enabled: Boolean(body.enabled),
      frequency: ["instant", "daily", "weekly"].includes(body.frequency) ? body.frequency : "daily",
      minimumMatchScore: Math.min(100, Math.max(0, Number(body.minimumMatchScore ?? 60))),
      categories: Array.isArray(body.categories) ? body.categories : [],
    };
    const db = await connectDB();
    if (!db) return NextResponse.json({ success: false, message: "Database is temporarily unavailable. Please try again later." }, { status: 503 });
    const user = await User.findByIdAndUpdate(userId, { jobNotificationPreferences: preferences }, { new: true }).select("jobNotificationPreferences").lean();
    return NextResponse.json({ success: true, preferences: user?.jobNotificationPreferences });
  } catch (error) {
    console.error("Notification settings error:", error);
    return NextResponse.json({ success: false, message: "Unable to save notification settings" }, { status: 500 });
  }
}
