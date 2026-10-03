import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getPremiumAccess } from "@/lib/premiumAccess";
import User from "@/models/User";

const validStatuses = new Set(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]);

export async function PATCH(req: NextRequest) {
  try {
    const access = await getPremiumAccess(req);
    if (!access) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (!access.premiumUnlocked) return NextResponse.json({ success: false, message: "Premium access required." }, { status: 403 });

    const { taskId, status } = await req.json();
    if (typeof taskId !== "string" || typeof status !== "string" || !validStatuses.has(status)) {
      return NextResponse.json({ success: false, message: "A valid task and status are required." }, { status: 400 });
    }
    await connectDB();
    const user = await User.findById(access.userId);
    if (!user?.careerRoadmap) return NextResponse.json({ success: false, message: "Career roadmap not found." }, { status: 404 });

    const roadmap = JSON.parse(JSON.stringify(user.careerRoadmap)) as Record<string, any>;
    let target: Record<string, any> | undefined;
    for (const phase of Array.isArray(roadmap.phases) ? roadmap.phases : []) {
      target = (Array.isArray(phase.tasks) ? phase.tasks : []).find((task: Record<string, any>) => task.id === taskId);
      if (target) break;
    }
    if (!target) target = (Array.isArray(roadmap.dailyTasks) ? roadmap.dailyTasks : []).find((task: Record<string, any>) => task.id === taskId);
    if (!target) return NextResponse.json({ success: false, message: "Task not found." }, { status: 404 });

    target.status = status;
    target.completedAt = status === "COMPLETED" ? target.completedAt || new Date() : null;
    roadmap.lastUpdated = new Date();
    user.careerRoadmap = roadmap;
    await user.save();

    const tasks = [
      ...(Array.isArray(roadmap.phases) ? roadmap.phases.flatMap((phase: Record<string, any>) => Array.isArray(phase.tasks) ? phase.tasks : []) : []),
      ...(Array.isArray(roadmap.dailyTasks) ? roadmap.dailyTasks : []),
    ];
    const completed = tasks.filter((task: Record<string, any>) => task.status === "COMPLETED").length;
    const today = new Date().toISOString().slice(0, 10);
    const todayTasks = roadmap.dailyTasks.filter((task: Record<string, any>) => task.day === today);
    const todayCompleted = todayTasks.filter((task: Record<string, any>) => task.status === "COMPLETED").length;
    const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyCompleted = tasks.filter((task: Record<string, any>) => task.completedAt && new Date(task.completedAt).getTime() >= weekStart).length;
    const skillTasks = tasks.filter((task: Record<string, any>) => task.skill);
    const skillCompleted = skillTasks.filter((task: Record<string, any>) => task.status === "COMPLETED").length;

    return NextResponse.json({
      success: true,
      careerRoadmap: roadmap,
      progress: {
        today: { completed: todayCompleted, total: todayTasks.length, percent: todayTasks.length ? Math.round(todayCompleted / todayTasks.length * 100) : 0 },
        weekly: { completed: weeklyCompleted, total: tasks.length },
        career: { completed, total: tasks.length, percent: tasks.length ? Math.round(completed / tasks.length * 100) : 0 },
        skills: { completed: skillCompleted, total: skillTasks.length, percent: skillTasks.length ? Math.round(skillCompleted / skillTasks.length * 100) : 0 },
      },
    });
  } catch (error) {
    console.error("Roadmap task update failed:", error);
    return NextResponse.json({ success: false, message: "Unable to update roadmap task." }, { status: 500 });
  }
}