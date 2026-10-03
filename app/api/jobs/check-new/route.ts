import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import CareerDNA from "@/models/CareerDNA";
import JobOpportunity from "@/models/JobOpportunity";
import Notification from "@/models/Notification";
import { matchJob } from "@/lib/jobMatcher";
import { fetchJobsFromSources } from "@/lib/jobSources";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.get("authorization") !== `Bearer ${cronSecret}`) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const sourcedJobs = await fetchJobsFromSources();
    for (const job of sourcedJobs) {
      await JobOpportunity.updateOne({ source: job.source, jobUrl: job.jobUrl }, { $set: { ...job, isActive: true } }, { upsert: true });
    }
    const users = await User.find({ "jobNotificationPreferences.enabled": true }).select("_id jobNotificationPreferences").lean();
    const jobs = await JobOpportunity.find({ isActive: true, postedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }).lean();
    let created = 0;
    for (const user of users) {
      const career = await CareerDNA.findOne({ userId: String(user._id) }).sort({ createdAt: -1 }).lean();
      if (!career) continue;
      const minimum = Math.max(career.jobPreferences?.minimumMatchScore ?? 60, user.jobNotificationPreferences?.minimumMatchScore ?? 60);
      for (const job of jobs) {
        const categories = user.jobNotificationPreferences?.categories || [];
        const isInternship = job.employmentType.toLowerCase().includes("intern");
        const isRemote = job.location.toLowerCase().includes("remote") || job.employmentType.toLowerCase().includes("remote");
        if (categories.length && !categories.includes("new-openings") && !(isInternship && categories.includes("internships")) && !(isRemote && categories.includes("remote")) && !categories.includes("career-recommendations")) continue;
        const match = matchJob(job, career.jobPreferences || {}, career);
        if (match.matchScore < minimum) continue;
        const result = await Notification.updateOne(
          { userId: String(user._id), jobId: job._id },
          { $setOnInsert: { userId: String(user._id), title: "New Job Match!", message: `${job.jobTitle} opening at ${job.company} matches your Career DNA with an ${match.matchScore}% match.`, type: "JOB", jobId: job._id, company: job.company, jobTitle: job.jobTitle, jobUrl: job.jobUrl, matchScore: match.matchScore, isRead: false } },
          { upsert: true }
        );
        if (result.upsertedCount) created += 1;
      }
    }
    return NextResponse.json({ success: true, created, usersChecked: users.length, jobsChecked: jobs.length, jobsSynced: sourcedJobs.length });
  } catch (error) {
    console.error("Job notification check error:", error);
    return NextResponse.json({ success: false, message: "Unable to check new jobs" }, { status: 500 });
  }
}
