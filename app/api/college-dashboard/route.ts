import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Verification from "@/models/Verification";

export async function GET() {
  try {
    await connectDB();

    // Get all verification records
    const verifications = await Verification.find()
      .sort({ createdAt: -1 })
      .lean();

    // Group multiple verifications of the same company
    const companyMap = new Map();

    for (const item of verifications) {
      const companyName =
        item.company?.trim() || "Unknown Company";

      const existing =
        companyMap.get(companyName);

      if (existing) {
        existing.verificationCount += 1;

        // Keep latest verification information
        if (
          new Date(item.createdAt).getTime() >
          new Date(existing.createdAt).getTime()
        ) {
          existing.jobRole =
            item.jobRole ||
            existing.jobRole;

          existing.trustScore =
            item.trustScore ??
            existing.trustScore;

          existing.status =
            item.status ||
            existing.status;

          existing.website =
            item.website ||
            existing.website;

          existing.email =
            item.email ||
            existing.email;

          existing.phone =
            item.phone ||
            existing.phone;

          existing.createdAt =
            item.createdAt;
        }
      } else {
        companyMap.set(companyName, {
          _id: item._id.toString(),

          company: companyName,

          jobRole:
            item.jobRole || "Not specified",

          trustScore:
            typeof item.trustScore === "number"
              ? item.trustScore
              : 0,

          status:
            item.status || "SUSPICIOUS",

          website:
            item.website || "",

          email:
            item.email || "",

          phone:
            item.phone || "",

          createdAt:
            item.createdAt,

          verificationCount: 1,
        });
      }
    }

    const companies =
      Array.from(companyMap.values());

    // Calculate dashboard statistics
    const totalRecruiters =
      companies.length;

    const safeRecruiters =
      companies.filter(
        (company) =>
          company.status === "SAFE"
      ).length;

    const suspiciousRecruiters =
      companies.filter(
        (company) =>
          company.status === "SUSPICIOUS" ||
          company.status === "REVIEW"
      ).length;

    const scamRecruiters =
      companies.filter(
        (company) =>
          company.status === "SCAM"
      ).length;

    const totalTrustScore =
      companies.reduce(
        (sum, company) =>
          sum + company.trustScore,
        0
      );

    const averageTrustScore =
      totalRecruiters > 0
        ? Math.round(
            totalTrustScore /
            totalRecruiters
          )
        : 0;

    return NextResponse.json({
      success: true,

      companies,

      stats: {
        totalRecruiters,

        safeRecruiters,

        suspiciousRecruiters,

        scamRecruiters,

        averageTrustScore,
      },
    });

  } catch (error) {
    console.error(
      "College dashboard API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load college dashboard data.",
      },
      {
        status: 500,
      }
    );
  }
}