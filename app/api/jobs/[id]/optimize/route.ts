import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getPremiumAccess } from "@/lib/premiumAccess";
import JobOpportunity from "@/models/JobOpportunity";
import Resume from "@/models/Resume";
import User from "@/models/User";

function record(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : {};
}

function values(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const access = await getPremiumAccess(req);
    if (!access) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (!access.premiumUnlocked) return NextResponse.json({ success: false, message: "Premium access required." }, { status: 403 });
    await connectDB();

    const { id: jobId } = await context.params;
    const { resumeVersionId } = await req.json();
    const [job, resume, user] = await Promise.all([
      JobOpportunity.findOne({ _id: jobId, isActive: true }).lean(),
      Resume.findOne({ _id: resumeVersionId, userId: access.userId, isMaster: false, jobId: "" }),
      User.findById(access.userId),
    ]);
    if (!job || !resume || !user?.jobReadinessCheck || !["RESUME_REVIEWED", "MATCHING"].includes(user.careerJourneyStage || "")) {
      return NextResponse.json({ success: false, message: "Review your generated Career Resume before targeting a job." }, { status: 409 });
    }

    const prior = await Resume.findOne({ userId: access.userId, isMaster: false, jobId, sourceResumeVersionId: resumeVersionId }).sort({ createdAt: -1 });
    if (prior) {
      user.careerJourneyStage = "TARGETED_RESUME_GENERATED";
      await user.save();
      return NextResponse.json({ success: true, versionId: String(prior._id), resume: prior.resume, optimization: prior.optimization, resumeVersion: prior.resumeVersion });
    }

    const profile = record(user.careerProfile);
    const content = record(resume.resume);
    const existingSkills = [...new Set([
      ...values(profile.skills),
      ...values(content.technicalSkills),
      ...values(content.developmentSkills),
    ])];
    const normalizedSkills = new Set(existingSkills.map((skill) => skill.toLowerCase()));
    const requirements = values(job.skills);
    const description = String(job.description || "");
    const descriptionSkills = existingSkills.filter((skill) => description.toLowerCase().includes(skill.toLowerCase()));
    const matchingSkills = [...new Set([...requirements.filter((skill) => normalizedSkills.has(skill.toLowerCase())), ...descriptionSkills])];
    const missingSkills = requirements.filter((skill) => !normalizedSkills.has(skill.toLowerCase()));
    const projects = Array.isArray(content.projects) ? content.projects : [];
    const relevantProjects = projects.filter((project: Record<string, any>) => {
      const projectText = `${project.title || ""} ${project.description || ""} ${project.technologies || ""}`.toLowerCase();
      return matchingSkills.some((skill) => projectText.includes(skill.toLowerCase()));
    });
    const experience = Array.isArray(content.experience) ? content.experience : [];
    const relevantExperience = experience.filter((item: Record<string, any>) => item.organization || item.role || item.description);
    const optimization = {
      jobDescription: description || "NOT PROVIDED BY SOURCE",
      matchingSkills,
      missingSkills,
      recommendedKeywords: matchingSkills,
      relevantProjects,
      relevantExperience,
      resumeImprovements: [
        ...(matchingSkills.length ? [`Place these already-supported skills prominently: ${matchingSkills.join(", ")}.`] : ["Add relevant skills only after you can substantiate them."]),
        ...(missingSkills.length ? [`Do not claim missing requirements as current skills: ${missingSkills.join(", ")}. Address them through learning or real experience.`] : []),
        ...(!content.professionalSummary ? ["Add a concise summary grounded in your actual education, skills, and career goal."] : []),
        ...(!relevantProjects.length ? ["No resume project clearly matches the listed skills; add a project only if you have completed it."] : []),
      ],
      generatedAt: new Date(),
    };
    const matchedSkillSet = new Set(matchingSkills.map((skill) => skill.toLowerCase()));
    const reorderedContent = {
      ...content,
      technicalSkills: [...values(content.technicalSkills)].sort((a, b) => Number(matchedSkillSet.has(b.toLowerCase())) - Number(matchedSkillSet.has(a.toLowerCase()))),
      developmentSkills: [...values(content.developmentSkills)].sort((a, b) => Number(matchedSkillSet.has(b.toLowerCase())) - Number(matchedSkillSet.has(a.toLowerCase()))),
      projects: [...projects].sort((a: Record<string, any>, b: Record<string, any>) => Number(relevantProjects.includes(b)) - Number(relevantProjects.includes(a))),
    };
    const resumeVersion = await Resume.countDocuments({ userId: access.userId, isMaster: false }) + 1;
    const targeted = await Resume.create({
      userId: access.userId,
      isMaster: false,
      title: `RESUME — ${job.company}`,
      resumeVersion,
      targetCompany: job.company,
      targetRole: job.jobTitle,
      jobId: String(job._id),
      sourceResumeVersionId: String(resume._id),
      resume: reorderedContent,
      optimization,
      atsKeywords: matchingSkills,
    });
    user.careerJourneyStage = "TARGETED_RESUME_GENERATED";
    await user.save();
    return NextResponse.json({ success: true, versionId: String(targeted._id), resume: reorderedContent, optimization, resumeVersion });
  } catch (error) {
    console.error("Targeted resume optimization failed:", error);
    return NextResponse.json({ success: false, message: "Unable to optimize this resume for the selected job." }, { status: 500 });
  }
}