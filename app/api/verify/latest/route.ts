import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Verification from "@/models/Verification";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {

  try {

    const token = req.cookies.get("token")?.value;
    const decoded = token ? verifyToken(token) as { id?: string } | null : null;
    if (!decoded?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const latest =
      await Verification.findOne({ userId: decoded.id })
      .select("-transcript -cleanTranscript -transcriptSegments -keyEvidence -repeatedEvidence -recordingRiskSignals -mediaMetadata -guardianTrustCheck")
      .sort({ createdAt: -1 });

    if (!latest) {

      return NextResponse.json({

        success:false,

      });

    }

    return NextResponse.json({

      success:true,

      data:latest,

    });

  } catch (err) {

    console.error(err);

    return NextResponse.json({

      success:false,

    },{

      status:500,

    });

  }

}
