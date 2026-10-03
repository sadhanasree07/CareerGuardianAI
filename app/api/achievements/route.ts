import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

import { calculateBadges } from "@/lib/badges";
import CareerDNA from "@/models/CareerDNA";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("cookie")?.match(/(?:^|; )token=([^;]+)/)?.[1];
    const decoded = token ? verifyToken(token) as { id?: string } | null : null;
    const userId = decoded?.id;
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const user =
      await User.findById(userId);

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

    // Save badges if changed
    user.badges = badges;

    await user.save();

    return NextResponse.json({
      success: true,

      user: {
        id: user._id.toString(),

        name: user.name,

        email: user.email,

        verificationCount:
          user.verificationCount || 0,

        resumeCount:
          user.resumeCount || 0,

        interviewCount:
          user.interviewCount || 0,

        badges,
        readiness: career?.report?.readiness || 0,
        careerDNACompleted: Boolean(career),
      },
    });

  } catch (error) {

    console.error(
      "Achievements API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load achievements.",
      },
      {
        status: 500,
      }
    );
  }
}