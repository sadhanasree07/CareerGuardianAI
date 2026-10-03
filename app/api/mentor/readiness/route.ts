import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getPremiumAccess } from "@/lib/premiumAccess";
import User from "@/models/User";
import Resume from "@/models/Resume";
import Interview from "@/models/Interview";
import CareerDNA from "@/models/CareerDNA";

function record(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : {};
}

export async function POST(req: NextRequest) {
  try {
    const access = await getPremiumAccess(req);
    if (!access) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (!access.premiumUnlocked) return NextResponse.json({ success: false, message: "Premium access required." }, { status: 403 });
    await connectDB();

    const [user, masterResume, interview, careerDNA] = await Promise.all([
      User.findById(access.userId),
      Resume.findOne({ userId: access.userId, isMaster: { $ne: false } }).sort({ updatedAt: -1 }).lean(),
      Interview.findOne({ userId: access.userId }).sort({ createdAt: -1 }).lean(),
      CareerDNA.findOne({ userId: access.userId }).sort({ createdAt: -1 }).lean(),
    ]);
    if (!user) return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    const profile = record(user.careerProfile);
    const careerStudent = record(careerDNA?.student);
    const roadmap = record(user.careerRoadmap);
    const hasProfile = Boolean(profile.completedAt);
    const hasAnalysis = Boolean(user.careerAnalysis);
    const hasDailyCompanion = Array.isArray(roadmap.dailyTasks) && roadmap.dailyTasks.length > 0;
    if (!hasProfile || !hasAnalysis || !Array.isArray(roadmap.phases) || !hasDailyCompanion) {
      return NextResponse.json({ success: false, message: "Complete your Career Profile, Analysis, Roadmap, and Daily Companion first." }, { status: 409 });
    }

    const resume = record(masterResume?.resume);
    const education = Boolean((Array.isArray(resume.education) && resume.education.length > 0) || user.degree || user.college || careerStudent.degree || careerStudent.college);
    const skills = [...(Array.isArray(profile.skills) ? profile.skills : []), ...(Array.isArray(user.skills) ? user.skills : []), ...(Array.isArray(careerStudent.skills) ? careerStudent.skills : [])];
    const projects = Array.isArray(resume.projects) && resume.projects.length ? resume.projects : Array.isArray(careerStudent.projects) ? careerStudent.projects : [];
    const experience = Array.isArray(resume.experience) && resume.experience.length ? resume.experience : Array.isArray(careerStudent.experience) ? careerStudent.experience : [];
    const resumeSkillCount = (resume.technicalSkills?.length || 0) + (resume.developmentSkills?.length || 0) + skills.length;
    const resumeComplete = Boolean((resume.name || user.name) && (resume.email || user.email) && education && resumeSkillCount);
    const missingInformation = [
      ...(!user.name ? ["Name"] : []),
      ...(!education ? ["Education"] : []),
      ...(!skills.length ? ["Skills"] : []),
      ...(!projects.length ? ["Projects"] : []),
      ...(!experience.length ? ["Experience or internships"] : []),
      ...(!resume.email && !user.email ? ["Email"] : []),
    ];
    const phases = Array.isArray(roadmap.phases) ? roadmap.phases : [];
    const tasks = phases.flatMap((phase: Record<string, any>) => Array.isArray(phase.tasks) ? phase.tasks : []).concat(roadmap.dailyTasks || []);
    const completedTasks = tasks.filter((task: Record<string, any>) => task.status === "COMPLETED").length;
    const check = {
      checkedAt: new Date(),
      careerProfile: "COMPLETE",
      education: education ? "PROVIDED" : "MISSING",
      skills,
      skillGaps: Array.isArray(record(user.careerAnalysis).skillGaps) ? record(user.careerAnalysis).skillGaps : [],
      experience: experience.length ? experience : "NOT PROVIDED",
      projects: projects.length ? projects : "NOT PROVIDED",
      resumeInformation: resumeComplete ? "COMPLETE" : "MISSING",
      interviewReadiness: typeof interview?.score === "number" ? { score: interview.score, feedback: interview.feedback || [] } : "NOT AVAILABLE",
      roadmapProgress: { completed: completedTasks, total: tasks.length },
      missingInformation,
      recommendedImprovements: [
        ...(!education ? ["Add your education details to your profile."] : []),
        ...(!skills.length ? ["Add the skills you can support with real experience or study."] : []),
        ...(!projects.length ? ["Add real projects, or continue with these sections omitted."] : []),
        ...(!experience.length ? ["Add real experience or internships, or continue with these sections omitted."] : []),
        ...(!resumeComplete ? ["Review the generated resume and fill missing contact, education, and skill information before applying."] : []),
      ],
    };

    user.jobReadinessCheck = check;
    user.careerJourneyStage = "READY_FOR_JOB";
    await user.save();
    return NextResponse.json({ success: true, readiness: check, journeyStage: user.careerJourneyStage });
  } catch (error) {
    console.error("Job readiness check failed:", error);
    return NextResponse.json({ success: false, message: "Unable to run Job Readiness Check." }, { status: 500 });
  }
}