import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Verification from "@/models/Verification";

function getLevel(count: number) {
  if (count >= 6) return { level: "HIGH", label: "High Community Risk" };
  if (count >= 3) return { level: "MEDIUM", label: "Community Warning" };
  return { level: "LOW", label: "Reports received" };
}

export async function GET() {
  try {
    await connectDB();
    const reports = await Verification.find({ communityReported: true })
      .select("company location communityCategory incidentDate createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const companies = new Map<string, { company: string; reportCount: number; latestReport: Date; location: string; categories: Set<string> }>();
    const locations = new Map<string, { location: string; reportCount: number; latestReport: Date; categories: Set<string> }>();

    for (const report of reports) {
      const companyName = report.company?.trim() || "Organization not specified";
      const city = report.location?.trim() || "Location not provided";
      const category = report.communityCategory || "Other";
      const latest = new Date(report.incidentDate || report.createdAt);
      const companyKey = companyName.toLowerCase();
      const locationKey = city.toLowerCase();
      const company = companies.get(companyKey) || { company: companyName, reportCount: 0, latestReport: latest, location: city, categories: new Set<string>() };
      company.reportCount += 1;
      company.categories.add(category);
      if (latest > company.latestReport) company.latestReport = latest;
      companies.set(companyKey, company);

      const location = locations.get(locationKey) || { location: city, reportCount: 0, latestReport: latest, categories: new Set<string>() };
      location.reportCount += 1;
      location.categories.add(category);
      if (latest > location.latestReport) location.latestReport = latest;
      locations.set(locationKey, location);
    }

    const alerts = Array.from(companies.values()).map((item) => ({
      company: item.company,
      reportCount: item.reportCount,
      latestReport: item.latestReport,
      location: item.location,
      categories: Array.from(item.categories),
      description: "Anonymized community members reported suspicious recruitment activity.",
      ...getLevel(item.reportCount),
    })).sort((a, b) => b.reportCount - a.reportCount);

    const locationReports = Array.from(locations.values()).map((item) => ({
      location: item.location,
      reportCount: item.reportCount,
      latestReport: item.latestReport,
      categories: Array.from(item.categories),
    })).sort((a, b) => b.reportCount - a.reportCount);

    return NextResponse.json({
      success: true,
      alerts,
      locations: locationReports,
      statistics: {
        totalReports: reports.length,
        totalLocations: locations.size,
        totalCompanies: companies.size,
        communityWarnings: alerts.filter((item) => item.level === "MEDIUM").length,
        highRiskCompanies: alerts.filter((item) => item.level === "HIGH").length,
      },
    });
  } catch (error) {
    console.error("Community Alerts Error:", error);
    return NextResponse.json({ success: false, message: "Failed to load community alerts." }, { status: 500 });
  }
}