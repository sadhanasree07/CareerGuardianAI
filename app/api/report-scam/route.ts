import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import Verification from "@/models/Verification";

const categories = new Set(["Fake Job Fee", "Impersonation", "Phishing", "Fake Interview", "Other"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const company = typeof body.company === "string" ? body.company.trim().slice(0, 200) : "";
    const description = typeof body.description === "string" ? body.description.trim().slice(0, 2000) : "";
    if (!company || !description) {
      return NextResponse.json({ success: false, message: "Company and incident description are required." }, { status: 400 });
    }
    if (/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\b\d{7,}\b/.test(description)) {
      return NextResponse.json({ success: false, message: "Remove email addresses and phone numbers from the public summary." }, { status: 400 });
    }

    const rawToken = request.headers.get("cookie")?.match(/(?:^|; )token=([^;]+)/)?.[1];
    const decoded = rawToken ? verifyToken(rawToken) as { id?: string } | null : null;
    const incidentDate = body.incidentDate ? new Date(body.incidentDate) : null;
    if (incidentDate && Number.isNaN(incidentDate.getTime())) {
      return NextResponse.json({ success: false, message: "Enter a valid incident date." }, { status: 400 });
    }

    await connectDB();
    const rawLocation = typeof body.location === "string" ? body.location.trim().slice(0, 80) : "";
    const coarseLocation = /^[\p{L}\s,.'-]{2,80}$/u.test(rawLocation) && !/\b(street|road|lane|flat|apartment|building|block|plot|door)\b/i.test(rawLocation)
      ? rawLocation
      : "Location not provided";

    await Verification.create({
      userId: decoded?.id || "anonymous",
      company,
      description,
      location: coarseLocation,
      communityCategory: categories.has(body.category) ? body.category : "Other",
      incidentDate,
      status: "COMMUNITY_REPORTED",
      trustScore: 0,
      communityReported: true,
    });

    return NextResponse.json({ success: true, message: "Anonymized community report submitted." }, { status: 201 });
  } catch (error) {
    console.error("Report Scam Error:", error);
    return NextResponse.json({ success: false, message: "Failed to submit community report." }, { status: 500 });
  }
}