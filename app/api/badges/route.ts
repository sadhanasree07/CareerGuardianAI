import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { calculateBadges } from "@/lib/badges";
import CareerDNA from "@/models/CareerDNA";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await connectDB();

    const token = request.headers.get("cookie")?.match(/(?:^|; )token=([^;]+)/)?.[1];
    const decoded = token ? verifyToken(token) as { id?: string } | null : null;
    const userId = decoded?.id;
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    const career = await CareerDNA.findOne({ userId }).sort({ createdAt: -1 }).lean();
    const badges = calculateBadges({ ...user.toObject(), careerDNACompleted: Boolean(career), readiness: career?.report?.readiness });

    user.badges = badges;

    await user.save();

    return NextResponse.json({
      success: true,

      badges,

      progress: {
        resumeImprovements:
          user.resumeImprovements,

        interviewCount:
          user.interviewCount,

        verificationCount:
          user.verificationCount,
        careerDNACompleted: Boolean(career),
        readiness: career?.report?.readiness || 0,
      },
    });

  } catch (error) {
    console.error("Badge Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load badges.",
      },
      {
        status: 500,
      }
    );
  }
}