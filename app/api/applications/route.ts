import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getPremiumAccess } from "@/lib/premiumAccess";
import Application from "@/models/Application";
import JobOpportunity from "@/models/JobOpportunity";
import Resume from "@/models/Resume";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const access = await getPremiumAccess(req);
    if (!access) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (!access.premiumUnlocked) return NextResponse.json({ success: false, message: "Premium access required." }, { status: 403 });
    const applications = await Application.find({ userId: access.userId }).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ success: true, applications });
  } catch (error) {
    console.error("Application tracker load failed:", error);
    return NextResponse.json({ success: false, message: "Unable to load applications." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const access = await getPremiumAccess(req);
    if (!access) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (!access.premiumUnlocked) return NextResponse.json({ success: false, message: "Premium access required." }, { status: 403 });

    const { jobId, resumeVersionId } = await req.json();
    if (typeof jobId !== "string" || typeof resumeVersionId !== "string") {
      return NextResponse.json({ success: false, message: "A real job and targeted resume are required." }, { status: 400 });
    }

    const [job, resume, user] = await Promise.all([
      JobOpportunity.findOne({ _id: jobId, isActive: true }),
      Resume.findOne({ _id: resumeVersionId, userId: access.userId, isMaster: false }),
      User.findById(access.userId).select("careerJourneyStage"),
    ]);
    if (!job || !resume || resume.jobId !== jobId || !["TARGETED_RESUME", "READY_TO_APPLY"].includes(user?.careerJourneyStage || "")) {
      return NextResponse.json({ success: false, message: "Complete job matching and targeted resume review first." }, { status: 409 });
    }
    const resumeContent = resume.resume && typeof resume.resume === "object" ? resume.resume as Record<string, any> : {};
    if (!resumeContent.name || !resumeContent.email || !Array.isArray(resumeContent.education) || !resumeContent.education.length || !(resumeContent.technicalSkills?.length || resumeContent.developmentSkills?.length)) {
      return NextResponse.json({ success: false, message: "INFORMATION REQUIRED: complete your name, email, education, and skills before continuing to apply." }, { status: 422 });
    }

    let applicationUrl: URL;
    try {
      applicationUrl = new URL(job.jobUrl);
    } catch {
      return NextResponse.json({ success: false, message: "This opportunity has no valid official application URL." }, { status: 422 });
    }
      if (!["http:", "https:"].includes(applicationUrl.protocol)) {
      return NextResponse.json({ success: false, message: "This opportunity has no valid official application URL." }, { status: 422 });
    }

    const existingApplication = await Application.findOne({ userId: access.userId, jobId });
    const preserveStatus = ["APPLICATION_STARTED", "APPLIED", "INTERVIEW", "REJECTED", "OFFER"].includes(existingApplication?.status || "");
    const application = await Application.findOneAndUpdate(
      { userId: access.userId, jobId },
      {
        $set: {
          company: job.company,
          role: job.jobTitle,
          source: job.source,
          applicationUrl: applicationUrl.toString(),
          resumeVersionId,
          ...(!preserveStatus ? { status: "READY_TO_APPLY" } : {}),
        },
        $setOnInsert: { userId: access.userId, jobId },
      },
      { new: true, upsert: true, runValidators: true },
    );
    await User.updateOne({ _id: access.userId }, { $set: { careerJourneyStage: "READY_TO_APPLY" } });
    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Application tracker create failed:", error);
    return NextResponse.json({ success: false, message: "Unable to prepare this application." }, { status: 500 });
  }
}