import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "@/lib/auth";
import connectDB from "../../../../lib/mongodb";
import Report from "../../../../models/Report";

export async function POST(req: NextRequest) {
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

    const body = await req.json();

    const report = await Report.create({
      userId: decoded.id,
      module: body.module,
      title: body.title,
      score: body.score,
      result: body.result,
    });

    return NextResponse.json({
      success: true,
      report,
    });

  } catch (error) {

    console.error("Save Report Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save report",
      },
      {
        status: 500,
      }
    );

  }
}