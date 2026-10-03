import { NextRequest, NextResponse } from "next/server";
import groq  from "@/lib/groq";
import { getPremiumAccess } from "@/lib/premiumAccess";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Resume from "@/models/Resume";
import Application from "@/models/Application";
import JobOpportunity from "@/models/JobOpportunity";
import { matchJob } from "@/lib/jobMatcher";

const mentorPrompt = `
You are the user's personal CareerGuardian career assistant. Answer using the supplied saved career context, not generic assumptions. Never invent user facts, experience, projects, employers, job vacancies, application outcomes, or completion status. Distinguish stored facts (KNOWN), user statements (SELF-REPORTED), recommendations (INFERRED), and absent information (NOT PROVIDED). If asked about jobs, use only the real matching opportunities supplied; say LIVE JOB SOURCE UNAVAILABLE when none are available. Keep answers practical and under 350 words.
`;

function record(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : {};
}

async function loadCareerContext(userId: string) {
  await connectDB();
  const [user, resume, resumeVersions, applications, jobs] = await Promise.all([
    User.findById(userId).select("name degree branch college cgpa skills careerGoal location professionalTitle careerProfile careerAnalysis careerRoadmap careerJourneyStage careerAssistantInteractedAt jobReadinessCheck").lean(),
    Resume.findOne({ userId, isMaster: { $ne: false } }).sort({ updatedAt: -1 }).lean(),
    Resume.find({ userId, isMaster: false }).sort({ updatedAt: -1 }).limit(20).lean(),
    Application.find({ userId }).sort({ updatedAt: -1 }).limit(12).lean(),
    JobOpportunity.find({ isActive: true, $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }] }).sort({ postedAt: -1 }).limit(100).lean(),
  ]);
  if (!user) return null;
  const storedProfile = record(user.careerProfile);
  const profile: Record<string, any> = {
    ...storedProfile,
    education: storedProfile.education || [user.degree, user.branch, user.college].filter(Boolean).join(" · "),
    skills: Array.isArray(storedProfile.skills) && storedProfile.skills.length ? storedProfile.skills : user.skills || [],
    preferredLocation: storedProfile.preferredLocation || user.location || "",
    careerGoal: storedProfile.careerGoal || user.careerGoal || "",
  };
  const jobPreferences = {
    roles: profile.targetRole ? [profile.targetRole] : [],
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    locations: profile.preferredLocation ? [profile.preferredLocation] : [],
    preferredCompanies: profile.dreamCompany ? [profile.dreamCompany] : [],
  };
  const careerResume = resumeVersions.find((item) => !item.jobId);
  const resumeForMatching = careerResume?.resume || resume?.resume;
  const jobMatches = jobs.map((job) => ({
    company: job.company,
    jobTitle: job.jobTitle,
    location: job.location,
    source: job.source,
    jobUrl: job.jobUrl,
    requirements: job.skills,
    ...matchJob(job, jobPreferences, { student: { skills: (jobPreferences.skills as string[]).join(",") }, report: { matchedSkills: jobPreferences.skills }, careerProfile: profile, resume: record(resumeForMatching) }),
  })).sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);
  const phases = Array.isArray(record(user.careerRoadmap).phases) ? record(user.careerRoadmap).phases : [];
  const tasks = phases.flatMap((phase: any) => Array.isArray(phase.tasks) ? phase.tasks : []).concat(Array.isArray(record(user.careerRoadmap).dailyTasks) ? record(user.careerRoadmap).dailyTasks : []);
  const completedTasks = tasks.filter((task: any) => task.status === "COMPLETED").length;
  return {
    user: { name: user.name, education: [user.degree, user.branch, user.college, user.cgpa].filter(Boolean), skills: user.skills, careerGoal: user.careerGoal, location: user.location, professionalTitle: user.professionalTitle },
    careerProfile: profile,
    careerAnalysis: user.careerAnalysis,
    careerRoadmap: user.careerRoadmap,
    progress: { completedTasks, totalTasks: tasks.length, percent: tasks.length ? Math.round(completedTasks / tasks.length * 100) : 0 },
    jobReadinessCheck: user.jobReadinessCheck,
    journeyStage: user.careerJourneyStage,
    careerAssistantInteractedAt: user.careerAssistantInteractedAt,
    resume: resume ? { title: resume.title, content: resume.resume } : null,
    careerResume: careerResume || null,
    targetedResumes: resumeVersions.filter((item) => Boolean(item.jobId)).map((item) => ({ id: String(item._id), title: item.title, targetCompany: item.targetCompany, targetRole: item.targetRole, jobId: item.jobId, resumeVersion: item.resumeVersion, optimization: item.optimization })),
    jobMatches,
    applications,
    companyOptions: [...new Set(jobs.map((job) => job.company))].slice(0, 100),
    roleOptions: [...new Set(jobs.map((job) => job.jobTitle))].slice(0, 100),
  };
}

export async function GET(req: NextRequest) {
  try {
    const access = await getPremiumAccess(req);
    if (!access) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (!access.premiumUnlocked) return NextResponse.json({ success: false, message: "Premium access required." }, { status: 403 });
    const context = await loadCareerContext(access.userId);
    if (!context) return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    return NextResponse.json({ success: true, ...context });
  } catch (error) {
    console.error("AI Mentor context load failed:", error);
    return NextResponse.json({ success: false, message: "Unable to load your career context." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const access = await getPremiumAccess(req);
    if (!access) {
      return NextResponse.json({ success: false, message: "Sign in to use AI Mentor." }, { status: 401 });
    }
    if (!access.premiumUnlocked) {
      return NextResponse.json({ success: false, message: "Premium access requires 100 credits.", credits: access.credits, requiredCredits: 100 }, { status: 403 });
    }

    const body = await req.json();

    const { question } = body;

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          message: "Question is required.",
        },
        {
          status: 400,
        }
      );
    }

    const context = await loadCareerContext(access.userId);
    if (!context) return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    if (!context.careerProfile.completedAt) {
      return NextResponse.json({ success: false, message: "Complete your Career Profile before chatting with your personal assistant." }, { status: 409 });
    }

    const completion =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        temperature: 0.4,

        messages: [
          {
            role: "system",
            content: `${mentorPrompt}\n\nSaved user context (JSON):\n${JSON.stringify(context).slice(0, 24000)}`,
          },
          {
            role: "user",
            content: question,
          },
        ],
      });

    const answer =
      completion.choices[0]?.message?.content ||
      "Sorry, I couldn't generate an answer.";

    await User.updateOne({ _id: access.userId }, { $set: { careerAssistantInteractedAt: new Date() } });

    return NextResponse.json({
      success: true,
      answer,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "AI Mentor Failed",
      },
      {
        status: 500,
      }
    );
  }
}