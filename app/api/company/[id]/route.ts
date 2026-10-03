import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Verification from "@/models/Verification";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Convert URL slug into searchable company text
    const companyName = decodeURIComponent(id)
      .replace(/-/g, " ")
      .trim();

    const verifications = await Verification.find({
      company: {
        $regex: companyName,
        $options: "i",
      },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (verifications.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No verification data found for this company.",
        },
        {
          status: 404,
        }
      );
    }

    const totalChecks = verifications.length;

    let safeReports = 0;
    let suspiciousReports = 0;
    let scamReports = 0;

    let totalTrustScore = 0;

    verifications.forEach((item: any) => {
      totalTrustScore += Number(item.trustScore || 0);

      const status = String(item.status || "").toUpperCase();

      if (status === "SAFE") {
        safeReports++;
      } else if (status === "SCAM") {
        scamReports++;
      } else {
        suspiciousReports++;
      }
    });

    const trustScore = Math.round(
      totalTrustScore / totalChecks
    );

    // Use the latest verification for company details
    const latest = verifications[0] as any;

    // Aggregate the 12 verification layers
    const layerStats: Record<
      number,
      {
        title: string;
        totalScore: number;
        passedCount: number;
        totalCount: number;
      }
    > = {};

    verifications.forEach((verification: any) => {
      const layers = verification.layers || [];

      layers.forEach((layer: any) => {
        // Do not treat the final calculated score as another check
        if (layer.layer === 12) return;

        if (!layerStats[layer.layer]) {
          layerStats[layer.layer] = {
            title: layer.title,
            totalScore: 0,
            passedCount: 0,
            totalCount: 0,
          };
        }

        layerStats[layer.layer].totalScore += Number(
          layer.score || 0
        );

        layerStats[layer.layer].totalCount += 1;

        if (layer.passed) {
          layerStats[layer.layer].passedCount += 1;
        }
      });
    });

    const verificationSummary = Object.entries(layerStats)
      .map(([layerNumber, data]) => ({
        layer: Number(layerNumber),

        title: data.title,

        passedPercentage: Math.round(
          (data.passedCount / data.totalCount) * 100
        ),

        averageScore: Math.round(
          data.totalScore / data.totalCount
        ),
      }))
      .sort((a, b) => a.layer - b.layer);

    return NextResponse.json({
      success: true,

      company: {
        companyName: latest.company,
        location: "India",

        trustScore,

        totalChecks,

        safeReports,

        suspiciousReports,

        scamReports,

        website: latest.website || "",

        verificationSummary,

        recentActivity: verifications
          .slice(0, 5)
          .map((item: any) => ({
            trustScore: item.trustScore,
            status: item.status,
            createdAt: item.createdAt,
            jobRole: item.jobRole,
          })),
      },
    });
  } catch (error) {
    console.error("Company Report Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load company report.",
      },
      {
        status: 500,
      }
    );
  }
}