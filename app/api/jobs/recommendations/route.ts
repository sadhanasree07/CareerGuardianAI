import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CareerDNA from "@/models/CareerDNA";
import JobOpportunity from "@/models/JobOpportunity";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import { matchJob } from "@/lib/jobMatcher";
import Resume from "@/models/Resume";
import { getPremiumAccess } from "@/lib/premiumAccess";

export async function GET(req: NextRequest) {
  try {
    const premiumJourney = req.nextUrl.searchParams.get("journey") === "premium";
    const access = premiumJourney ? await getPremiumAccess(req) : null;
    if (premiumJourney && !access) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (premiumJourney && !access?.premiumUnlocked) return NextResponse.json({ success: false, message: "Premium access required." }, { status: 403 });
    const token = req.cookies.get("token")?.value;
    const decoded = token ? verifyToken(token) as { id?: string } | null : null;
    if (!decoded?.id) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    await connectDB();

    const [career, user, resume] = await Promise.all([
      CareerDNA.findOne({ userId: decoded.id }).sort({ createdAt: -1 }).lean(),
      User.findById(decoded.id).select("jobNotificationPreferences careerProfile careerJourneyStage").lean(),
      premiumJourney ? Resume.findOne({ userId: decoded.id, isMaster: false, jobId: "" }).sort({ updatedAt: -1 }).lean() : Promise.resolve(null),
    ]);
    const profile = user?.careerProfile && typeof user.careerProfile === "object" ? user.careerProfile as Record<string, any> : {};
    if (premiumJourney && !["RESUME_REVIEWED", "MATCHING", "TARGETED_RESUME_GENERATED", "TARGETED_RESUME", "READY_TO_APPLY"].includes(user?.careerJourneyStage || "")) {
      return NextResponse.json({ success: false, message: "Review your generated resume before job matching." }, { status: 409 });
    }
    if (premiumJourney && !resume) return NextResponse.json({ success: false, message: "Generate and review your career resume before matching jobs." }, { status: 409 });
    const resumeSkills = resume?.resume && typeof resume.resume === "object"
      ? [...(Array.isArray(resume.resume.technicalSkills) ? resume.resume.technicalSkills : []), ...(Array.isArray(resume.resume.developmentSkills) ? resume.resume.developmentSkills : [])]
      : [];
    const preferences = premiumJourney ? {
      roles: profile.targetRole ? [profile.targetRole] : [],
      skills: [...new Set([...(Array.isArray(profile.skills) ? profile.skills : []), ...resumeSkills])],
      locations: profile.preferredLocation ? [profile.preferredLocation] : [],
      preferredCompanies: profile.dreamCompany ? [profile.dreamCompany] : [],
      minimumMatchScore: 0,
    } : career?.jobPreferences || { minimumMatchScore: 60 };
    const minimumMatchScore = premiumJourney ? 0 : Math.max(preferences.minimumMatchScore ?? 60, user?.jobNotificationPreferences?.minimumMatchScore ?? 60);
    const jobs = await JobOpportunity.find({ isActive: true, $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }] }).sort({ postedAt: -1 }).lean();
    const matchingCareer = premiumJourney
      ? { student: { skills: (preferences.skills || []).join(",") }, report: { matchedSkills: preferences.skills || [] }, careerProfile: profile, resume: resume?.resume || {} }
      : career || {};
    const recommended = jobs.map((job) => ({
      ...job,
      ...matchJob(job, preferences, matchingCareer),
      scoreDescription: "CareerGuardian compatibility estimate; not an employer score or hiring decision.",
      applicationUrlAvailable: (() => { try { const url = new URL(job.jobUrl); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; } })(),
    })).filter((job) => job.matchScore >= minimumMatchScore).sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ success: true, jobs: recommended, liveJobSourceUnavailable: jobs.length === 0 });
  } catch (error) {
    console.error("Job recommendations error:", error);
    return NextResponse.json({ success: false, message: "Unable to load job recommendations" }, { status: 500 });
  }
}
