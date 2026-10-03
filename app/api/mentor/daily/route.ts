import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import groq from "@/lib/groq";
import connectDB from "@/lib/mongodb";
import { getPremiumAccess } from "@/lib/premiumAccess";
import User from "@/models/User";

const categories = ["LEARNING", "CODING_PRACTICE", "RESUME_PROFILE", "INTERVIEW", "SKILL_DEVELOPMENT", "OPPORTUNITY_REVIEW"];
function record(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : {};
}

export async function POST(req: NextRequest) {
  try {
    const access = await getPremiumAccess(req);
    if (!access) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (!access.premiumUnlocked) return NextResponse.json({ success: false, message: "Premium access required." }, { status: 403 });
    await connectDB();
    const user = await User.findById(access.userId);
    if (!user || !(user.careerProfile as Record<string, any>)?.completedAt || !user.careerRoadmap) {
      return NextResponse.json({ success: false, message: "Complete your career profile and roadmap first." }, { status: 409 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const roadmap = JSON.parse(JSON.stringify(user.careerRoadmap)) as Record<string, any>;
    if (roadmap.dailyPlanDate === today && roadmap.dailyTasks?.some((task: Record<string, any>) => task.day === today)) {
      return NextResponse.json({ success: true, dailyTasks: roadmap.dailyTasks.filter((task: Record<string, any>) => task.day === today), careerRoadmap: roadmap });
    }

    const incompleteTasks = (Array.isArray(roadmap.phases) ? roadmap.phases : []).flatMap((phase: Record<string, any>) => Array.isArray(phase.tasks) ? phase.tasks : []).filter((task: Record<string, any>) => task.status !== "COMPLETED").slice(0, 20);
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Create exactly six practical career-companion tasks for today, one each for LEARNING, CODING_PRACTICE, RESUME_PROFILE, INTERVIEW, SKILL_DEVELOPMENT, OPPORTUNITY_REVIEW. Use only the supplied user's profile and incomplete roadmap tasks. Do not claim the user completed anything, invent facts, or invent job opportunities. If an opportunity review cannot use supplied live listings, make it a task to review the available job source and report no listings if empty. Return JSON only: {tasks:[{category,title,description}]}" },
        { role: "user", content: JSON.stringify({ careerProfile: user.careerProfile, incompleteRoadmapTasks: incompleteTasks }) },
      ],
    });
    const output = record(JSON.parse(completion.choices[0]?.message?.content || "{}"));
    const generated = Array.isArray(output.tasks) ? output.tasks.map(record) : [];
    const todayTasks = categories.map((category) => {
      const source = generated.find((task) => String(task.category || "").toUpperCase() === category);
      return {
        id: randomUUID(),
        category,
        title: String(source?.title || "Review your saved career plan and choose a concrete next step").slice(0, 160),
        description: String(source?.description || "Use the profile and roadmap already saved in your account.").slice(0, 500),
        status: "NOT_STARTED",
        completedAt: null,
        day: today,
      };
    });
    const retained = (Array.isArray(roadmap.dailyTasks) ? roadmap.dailyTasks : []).filter((task: Record<string, any>) => String(task.day || "") >= new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10));
    roadmap.dailyTasks = [...retained, ...todayTasks];
    roadmap.dailyPlanDate = today;
    roadmap.lastUpdated = new Date();
    user.careerRoadmap = roadmap;
    await user.save();
    return NextResponse.json({ success: true, dailyTasks: todayTasks, careerRoadmap: roadmap });
  } catch (error) {
    console.error("Daily career plan generation failed:", error);
    return NextResponse.json({ success: false, message: "Today's career plan is unavailable right now." }, { status: 500 });
  }
}