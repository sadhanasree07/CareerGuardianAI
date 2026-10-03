import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "@/lib/auth";
import connectDB from "../../../../lib/mongodb";
import Report from "../../../../models/Report";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

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

    const decoded: any = jwt.verify(
      token,
      JWT_SECRET
    );

    const reports = await Report.find({
      userId: decoded.id,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      reports,
    });

  } catch (error) {

    console.error("History Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load reports",
      },
      {
        status: 500,
      }
    );

  }
}