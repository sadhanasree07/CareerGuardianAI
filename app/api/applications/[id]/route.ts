import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getPremiumAccess } from "@/lib/premiumAccess";
import Application from "@/models/Application";

const statuses = new Set(["SAVED", "READY_TO_APPLY", "APPLICATION_STARTED", "APPLIED", "INTERVIEW", "REJECTED", "OFFER"]);

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const access = await getPremiumAccess(req);
    if (!access) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (!access.premiumUnlocked) return NextResponse.json({ success: false, message: "Premium access required." }, { status: 403 });
    const { id } = await context.params;
    const { status } = await req.json();
    if (typeof status !== "string" || !statuses.has(status)) {
      return NextResponse.json({ success: false, message: "Invalid application status." }, { status: 400 });
    }
    const application = await Application.findOneAndUpdate(
      { _id: id, userId: access.userId },
      { $set: { status } },
      { new: true, runValidators: true },
    );
    if (!application) return NextResponse.json({ success: false, message: "Application not found." }, { status: 404 });
    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Application tracker update failed:", error);
    return NextResponse.json({ success: false, message: "Unable to update application." }, { status: 500 });
  }
}