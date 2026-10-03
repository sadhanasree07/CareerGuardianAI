import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Placement from "@/models/Placement";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      userId,
      prediction,
      readinessScore,
      placementProbability,
      technicalScore,
      communicationScore,
      aptitudeScore,
      skills,
      companies,
      result,
    } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const placement =
      await Placement.findOneAndUpdate(
        {
          userId,
        },
        {
          userId,

          prediction:
            prediction || 0,

          readinessScore:
            readinessScore ||
            result?.readinessScore ||
            result?.score ||
            0,

          placementProbability:
            placementProbability ||
            result?.placementProbability ||
            result?.probability ||
            0,

          technicalScore:
            technicalScore ||
            result?.technicalScore ||
            0,

          communicationScore:
            communicationScore ||
            result?.communicationScore ||
            0,

          aptitudeScore:
            aptitudeScore ||
            result?.aptitudeScore ||
            0,

          skills:
            skills ||
            result?.skills ||
            [],

          companies:
            companies ||
            result?.companies ||
            [],

          result:
            result || {},
        },
        {
          new: true,
          upsert: true,
        }
      );

    return NextResponse.json({
      success: true,
      placement,
    });

  } catch (error) {
    console.error(
      "Placement save error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to save placement prediction.",
      },
      {
        status: 500,
      }
    );
  }
}