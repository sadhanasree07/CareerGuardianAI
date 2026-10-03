import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("cookie")?.match(/(?:^|; )token=([^;]+)/)?.[1];
    const decoded = token ? verifyToken(token) as { id?: string } | null : null;
    const userId = decoded?.id;
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          interviewCount: 1,
        },
      },
      {
        new: true,
      }
    );

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

    return NextResponse.json({
      success: true,

      interviewCount: user.interviewCount,
    });

  } catch (error) {
    console.error(
      "Interview Activity Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update interview activity.",
      },
      {
        status: 500,
      }
    );
  }
}