import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { translations } from "@/src/lib/translations";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const decoded: any = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or Expired Token",
        },
        {
          status: 401,
        }
      );
    }

    const db = await connectDB();

    if (!db) {
      return NextResponse.json(
        {
          success: false,
          message: "Database is temporarily unavailable. Please try again later.",
        },
        {
          status: 503,
        }
      );
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("Profile API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const decoded = token ? verifyToken(token) as { id?: string } | null : null;

    if (!decoded?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const language = body.preferredLanguage;

    if (typeof language !== "string" || !(language in translations)) {
      return NextResponse.json({ success: false, message: "Unsupported language" }, { status: 400 });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ success: false, message: "Database is temporarily unavailable." }, { status: 503 });
    }

    const user = await User.findByIdAndUpdate(
      decoded.id,
      { preferredLanguage: language },
      { new: true }
    ).select("preferredLanguage").lean();

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, preferredLanguage: user.preferredLanguage });
  } catch (error) {
    console.error("Profile language update error:", error);
    return NextResponse.json({ success: false, message: "Unable to save language preference" }, { status: 500 });
  }
}