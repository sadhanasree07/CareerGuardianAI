import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CareerDNA from "@/models/CareerDNA";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const decoded = token ? verifyToken(token) as { id?: string; email?: string } | null : null;
    if (token && !decoded?.id) return NextResponse.json({ success: false, message: "Invalid or expired session." }, { status: 401 });
    const db = await connectDB();
    if (!db) return NextResponse.json({ success: false, message: "Database unavailable." }, { status: 503 });
    const userIds = decoded?.id
      ? [decoded.id, decoded.email].filter((value): value is string => !!value)
      : ["demo-user"];
    const latest = await CareerDNA
      .findOne({ userId: { $in: [...new Set(userIds)] } })
      .sort({ createdAt: -1 });
    if (!latest) {
      return NextResponse.json(
        {
          success: false,
          message: "No Career DNA report found.",
        },
        {
          status: 404,
        }
      );

    }

    return NextResponse.json({ success: true, data: latest });
  } catch (error) {
    console.error("Career DNA Latest Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch Career DNA.",
      },
      {
        status: 500,
      }
    );

  }
}
