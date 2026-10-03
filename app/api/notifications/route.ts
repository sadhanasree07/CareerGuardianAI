import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";

function userIdFromRequest(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const decoded = token ? verifyToken(token) as { id?: string } | null : null;
  return decoded?.id;
}

export async function GET(req: NextRequest) {
  const userId = userIdFromRequest(req);
  if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  try {
    const db = await connectDB();
    if (!db) return NextResponse.json({ success: false, message: "Database is temporarily unavailable. Please try again later." }, { status: 503 });
    const user = await User.findById(userId).select("jobNotificationPreferences.enabled").lean();
    if (!user?.jobNotificationPreferences?.enabled) return NextResponse.json({ success: true, unreadCount: 0, notifications: [] });
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
      Notification.countDocuments({ userId, isRead: false }),
    ]);
    return NextResponse.json({ success: true, unreadCount, notifications });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json({ success: false, message: "Unable to load notifications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const userId = userIdFromRequest(req);
  if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const { notificationId } = await req.json();
    const notification = await Notification.findOneAndUpdate({ _id: notificationId, userId }, { isRead: true }, { new: true }).lean();
    if (!notification) return NextResponse.json({ success: false, message: "Notification not found" }, { status: 404 });
    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return NextResponse.json({ success: false, message: "Unable to update notification" }, { status: 500 });
  }
}
