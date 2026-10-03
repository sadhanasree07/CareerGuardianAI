import { NextRequest, NextResponse } from "next/server";
import { getPremiumAccess } from "@/lib/premiumAccess";

export async function GET(req: NextRequest) {
  try {
    const access = await getPremiumAccess(req);
    if (!access) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ success: true, ...access, requiredCredits: 100 });
  } catch (error) {
    console.error("Premium status error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ success: false, message: "Unable to load Premium status." }, { status: 500 });
  }
}