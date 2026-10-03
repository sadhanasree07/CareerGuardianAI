import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Incident from "@/models/Incident";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      company,
      incidentType,
      description,
    } = body;

    if (
      !company ||
      !incidentType ||
      !description
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all fields.",
        },
        {
          status: 400,
        }
      );
    }

    const incident = await Incident.create({
      company,
      incidentType,
      description,
      status: "PENDING",
    });

    return NextResponse.json({
      success: true,
      message: "Incident reported successfully.",
      incident,
    });
  } catch (error) {
    console.error(
      "Incident Report Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit incident report.",
      },
      {
        status: 500,
      }
    );
  }
}