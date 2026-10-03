import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import groq from "@/lib/groq";
import connectDB from "@/lib/mongodb";
import { getPremiumAccess } from "@/lib/premiumAccess";
import User from "@/models/User";

const stringFields = [
  "areaOfInterest", "dreamCompany", "targetRole", "preferredIndustry", "education",
  "preferredLocation", "workPreference", "experienceLevel", "careerGoal", "salaryExpectation",
  "preferredDomain", "shortTermGoal", "longTermGoal",
] as const;
const listFields = ["skills", "weakSkills", "skillsToImprove"] as const;
const phaseTitles = ["FOUNDATION", "SKILL DEVELOPMENT", "PROJECT DEVELOPMENT", "INTERVIEW PREPARATION", "JOB READINESS"];
const dailyCategories = ["LEARNING", "CODING_PRACTICE", "RESUME_PROFILE", "INTERVIEW", "SKILL_DEVELOPMENT", "OPPORTUNITY_REVIEW"];
const phaseFallbacks = [
  "Review the foundation topics for your target role and choose one to study.",
  "Practice one skill from your improvement list and record what you learned.",
  "Plan a project using skills you already listed; add it to your resume only after completing it.",
  "Practice one interview answer for your target role.",
  "Review your profile and resume facts; identify missing information before applying.",
];

function normalizeProfile(value: unknown, existing: Record<string, unknown>) {
  const body = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const profile: Record<string, unknown> = {};
  for (const field of stringFields) {
    const supplied = typeof body[field] === "string" ? body[field].trim().slice(0, 500) : "";
    profile[field] = supplied || (typeof existing[field] === "string" ? existing[field] : "");
  }
  for (const field of listFields) {
    const supplied = Array.isArray(body[field]) ? body[field] : [];
    const previous = Array.isArray(existing[field]) ? existing[field] : [];
    profile[field] = [...new Set((supplied.length ? supplied : previous)
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim().slice(0, 100)).filter(Boolean))].slice(0, 30);
  }
  return profile;
}

function list(value: unknown, limit = 12): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, limit) : [];
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function POST(req: NextRequest) {
  try {
    const access = await getPremiumAccess(req);
    if (!access) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (!access.premiumUnlocked) return NextResponse.json({ success: false, message: "Premium access required." }, { status: 403 });
    await connectDB();

    const user = await User.findById(access.userId);
    if (!user) return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    const existing = record(user.careerProfile);
    const requestBody = await req.json();
    const generateAnalysis = requestBody.generateAnalysis === true;
    const profile = generateAnalysis ? existing : normalizeProfile(requestBody.careerProfile, {
      ...existing,
      education: existing.education || [user.degree, user.branch, user.college].filter(Boolean).join(" · "),
      skills: existing.skills || user.skills,
      preferredLocation: existing.preferredLocation || user.location,
      careerGoal: existing.careerGoal || user.careerGoal,
    });
    const missing: string[] = stringFields.filter((field) => !String(profile[field] || "").trim());
    for (const field of listFields) if (!(profile[field] as string[]).length) missing.push(field);
    if (missing.length) {
      return NextResponse.json({ success: false, message: "Complete or mark each missing answer as NOT PROVIDED.", missingFields: missing }, { status: 400 });
    }

    if (!generateAnalysis) {
      user.careerProfile = { ...profile, completedAt: new Date() };
      user.careerAnalysis = null;
      user.careerRoadmap = null;
      user.careerAssistantInteractedAt = null;
      user.careerJourneyStage = "PROFILE";
      user.jobReadinessCheck = null;
      await user.save();
      return NextResponse.json({ success: true, careerProfile: user.careerProfile, needsAnalysis: true, journeyStage: user.careerJourneyStage });
    }
    if (!user.careerAssistantInteractedAt) {
      return NextResponse.json({ success: false, message: "Use your Personal Career Assistant before generating Career Analysis." }, { status: 409 });
    }

    const userProfileFacts = {
      name: user.name,
      education: [user.degree, user.branch, user.college, user.cgpa].filter(Boolean),
      existingSkills: user.skills,
      location: user.location,
      careerGoal: user.careerGoal,
      professionalTitle: user.professionalTitle,
    };
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a personal career assistant. Use only the supplied self-reported career profile and stored account facts. Do not invent personal facts, employers, skills, experience, education, projects, achievements, or vacancies. Mark observations as KNOWN, SELF-REPORTED, INFERRED, or NOT PROVIDED. Recommendations must be clearly recommendations, not claims about the user. Return JSON only with: strengths, weakAreas, skillGaps, skillsToImprove, recommendedSkills, learningOrder, interviewPreparationNeeds, careerRecommendations, recommendedRoles, phases, and dailyTasks. phases must contain five phases in this order: FOUNDATION, SKILL DEVELOPMENT, PROJECT DEVELOPMENT, INTERVIEW PREPARATION, JOB READINESS; each has 1-5 actionable tasks with title, description, category and skill. dailyTasks must contain six actionable task objects with category (LEARNING, CODING_PRACTICE, RESUME_PROFILE, INTERVIEW, SKILL_DEVELOPMENT, OPPORTUNITY_REVIEW), title and description. Do not mark tasks complete.`,
        },
        {
          role: "user",
          content: JSON.stringify({ careerProfile: profile, storedAccountFacts: userProfileFacts }),
        },
      ],
    });
    const output = record(JSON.parse(completion.choices[0]?.message?.content || "{}"));

    const phases = phaseTitles.map((title, index) => {
      const generated = (Array.isArray(output.phases) ? output.phases : []).map(record).find((phase) => String(phase.title || "").toUpperCase().includes(title));
      const generatedTasks = (Array.isArray(generated?.tasks) ? generated.tasks : []).map(record).slice(0, 5);
      const tasks = (generatedTasks.length ? generatedTasks : [{ title: `Next step for ${profile.targetRole || "your career goal"}`, description: phaseFallbacks[index], category: title, skill: "" }]).map((task) => ({
        id: randomUUID(),
        title: String(task.title || "Profile-based recommendation").slice(0, 160),
        description: String(task.description || "Review this recommendation against your goals.").slice(0, 500),
        category: String(task.category || title),
        skill: String(task.skill || ""),
        status: "NOT_STARTED",
        completedAt: null,
      }));
      return { id: `phase-${index + 1}`, title, tasks };
    });
    const generatedDaily = (Array.isArray(output.dailyTasks) ? output.dailyTasks : []).map(record);
    const dailyFallbacks = [
      `Study a topic related to ${profile.preferredDomain || profile.targetRole}.`,
      `Complete one short practice exercise related to ${(profile.skillsToImprove as string[] | undefined)?.[0] || profile.targetRole}.`,
      "Review your saved profile and resume facts; add only information that is true.",
      `Practice one interview answer for ${profile.targetRole}.`,
      `Choose one skill from your improvement list: ${(profile.skillsToImprove as string[]).join(", ") || "NOT PROVIDED"}.`,
      `Review real available opportunities for ${profile.targetRole}; note if none are listed.`,
    ];
    const dailyTasks = dailyCategories.map((category, index) => {
      const task = generatedDaily.find((entry) => String(entry.category || "").toUpperCase() === category);
      return {
        id: randomUUID(),
        category,
        title: String(task?.title || dailyFallbacks[index]).slice(0, 160),
        description: String(task?.description || "This is a suggested task, not a recorded completion.").slice(0, 500),
        status: "NOT_STARTED",
        completedAt: null,
        day: new Date().toISOString().slice(0, 10),
      };
    });

    const analysis = {
      strengths: list(output.strengths),
      weakAreas: list(output.weakAreas),
      skillGaps: list(output.skillGaps),
      skillsToImprove: list(output.skillsToImprove),
      recommendedSkills: list(output.recommendedSkills),
      learningOrder: list(output.learningOrder),
      interviewPreparationNeeds: list(output.interviewPreparationNeeds),
      careerRecommendations: list(output.careerRecommendations),
      recommendedRoles: list(output.recommendedRoles),
      sourceLabels: {
        accountFacts: "KNOWN",
        careerProfile: "SELF-REPORTED",
        analysis: "INFERRED",
        missingInformation: "NOT PROVIDED",
      },
      generatedAt: new Date(),
    };
    const roadmap = { phases, dailyTasks, dailyPlanDate: new Date().toISOString().slice(0, 10), lastUpdated: new Date() };
    user.careerProfile = { ...profile, completedAt: profile.completedAt || new Date() };
    user.careerAnalysis = analysis;
    user.careerRoadmap = roadmap;
    user.careerJourneyStage = "COMPANION";
    user.jobReadinessCheck = null;
    await user.save();

    return NextResponse.json({ success: true, careerProfile: user.careerProfile, careerAnalysis: analysis, careerRoadmap: roadmap, journeyStage: user.careerJourneyStage });
  } catch (error) {
    console.error("Career profile analysis failed:", error);
    return NextResponse.json({ success: false, message: "Unable to save and analyze your career profile right now." }, { status: 500 });
  }
}