import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CareerDNA from "@/models/CareerDNA";
import Resume from "@/models/Resume";
import groq from "@/lib/groq";
import { getPremiumAccess } from "@/lib/premiumAccess";
import User from "@/models/User";
import { mapProfileToResume } from "@/lib/mapProfileToResume";
import { normalizeResume } from "@/components/resumeBuilder/resumeTypes";

function missingResumeInformation(value: unknown): string[] {
  const resume = normalizeResume(value);
  return [
    ...(!resume.name ? ["Name"] : []),
    ...(!resume.email ? ["Email"] : []),
    ...(!resume.education.length ? ["Education"] : []),
    ...(!(resume.technicalSkills.length + resume.developmentSkills.length) ? ["Skills"] : []),
  ];
}

function mergeResumeFacts(mappedValue: unknown, savedValue: unknown) {
  const mapped = normalizeResume(mappedValue) as unknown as Record<string, unknown>;
  const saved = normalizeResume(savedValue) as unknown as Record<string, unknown>;
  const merged: Record<string, unknown> = {};
  for (const [field, mappedValue] of Object.entries(mapped)) {
    const savedValue = saved[field];
    if (Array.isArray(savedValue)) merged[field] = savedValue.length ? savedValue : mappedValue;
    else if (typeof savedValue === "string") merged[field] = savedValue.trim() ? savedValue : mappedValue;
    else merged[field] = savedValue ?? mappedValue;
  }
  return normalizeResume(merged);
}

export async function POST(req: NextRequest) {

  try {

    const access = await getPremiumAccess(req);
    if (!access) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (!access.premiumUnlocked) return NextResponse.json({ success: false, message: "Premium access required." }, { status: 403 });

    await connectDB();

    const body = await req.json();

    const user = await User.findById(access.userId);
    if (!user) return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    if (!user.jobReadinessCheck || !["READY_FOR_JOB", "RESUME_GENERATED", "RESUME_REVIEWED"].includes(user.careerJourneyStage || "")) {
      return NextResponse.json({ success: false, message: "Complete READY FOR JOB and the Job Readiness Check before generating a resume." }, { status: 409 });
    }

    if (body.careerFlow === true) {
      const existingVersion = await Resume.findOne({ userId: access.userId, isMaster: false, jobId: "", title: { $regex: /^CAREER RESUME/ }, createdAt: { $gte: user.jobReadinessCheck.checkedAt } }).sort({ createdAt: -1 });
      if (existingVersion) return NextResponse.json({ success: true, data: existingVersion.resume, versionId: String(existingVersion._id), informationRequired: missingResumeInformation(existingVersion.resume), resumeVersion: existingVersion.resumeVersion });

      const [careerDNA, master] = await Promise.all([
        CareerDNA.findOne({ userId: access.userId }).sort({ createdAt: -1 }).lean(),
        Resume.findOne({ userId: access.userId, isMaster: { $ne: false } }).sort({ updatedAt: -1 }).lean(),
      ]);
      const profile = user.careerProfile && typeof user.careerProfile === "object" ? user.careerProfile as Record<string, any> : {};
      const mapped = mapProfileToResume({
        ...user.toObject(),
        skills: profile.skills?.length ? profile.skills : user.skills,
        careerGoal: profile.careerGoal || user.careerGoal,
        professionalTitle: profile.targetRole || user.professionalTitle,
        location: profile.preferredLocation || user.location,
      }, careerDNA || null);
      const masterResume = normalizeResume(master?.resume);
      const content = mergeResumeFacts(mapped, masterResume);
      content.name = user.name || content.name;
      content.email = user.email || content.email;
      content.title = profile.targetRole || content.title;
      content.location = profile.preferredLocation || content.location;
      const resumeVersion = await Resume.countDocuments({ userId: access.userId, isMaster: false }) + 1;
      const version = await Resume.create({
        userId: access.userId,
        isMaster: false,
        title: `CAREER RESUME — ${profile.targetRole || "UNTARGETED"}`,
        resumeVersion,
        targetCompany: profile.dreamCompany || "",
        targetRole: profile.targetRole || "",
        jobId: "",
        resume: content,
        atsKeywords: [...new Set([...(content.technicalSkills || []), ...(content.developmentSkills || []), profile.targetRole || ""].filter(Boolean))],
      });
      user.careerJourneyStage = "RESUME_GENERATED";
      await user.save();
      return NextResponse.json({ success: true, data: content, versionId: String(version._id), resumeVersion, informationRequired: missingResumeInformation(content) });
    }

    const { careerDNAId } = body;

    const dna = await CareerDNA.findOne({ _id: careerDNAId, userId: access.userId });

    if (!dna) {

      return NextResponse.json(
        {
          success: false,
          message: "Career DNA not found.",
        },
        {
          status: 404,
        }
      );

    }

    const prompt = `
You are Guardian Resume Studio AI.

Create a professional ATS Resume.

Use ONLY facts explicitly present in Student Profile. Career DNA and the verified job may guide skill ordering and wording, but are not evidence about the student's personal history. Do not invent a title, project details, responsibilities, certifications, achievements, languages, dates, grades, or contact information. If a fact is missing, return an empty string or empty array. Return projects, internships, certifications, achievements, and languages only when they are explicitly present in Student Profile.

Verified Recruitment

${JSON.stringify(
  dna.verifiedJob,
  null,
  2
)}

Student Profile

${JSON.stringify(
  dna.student,
  null,
  2
)}

Career DNA Report

${JSON.stringify(
  dna.report,
  null,
  2
)}

Return ONLY JSON.

{

"name":"",

"professionalSummary":"",

"skills":[],

"projects":[],

"internship":[],

"certifications":[],

"achievements":[],

"languages":[],

"resumeScore":0,

"atsKeywords":[]

}

Rules

Professional Summary should be recruiter friendly.

Reorder skills according to the job.

Reorder projects according to the job.

Generate ATS keywords.

Return JSON only.

`;

    const completion =
      await groq.chat.completions.create({

        model: "openai/gpt-oss-120b",

        temperature: 0.2,

        response_format: {
          type: "json_object",
        },

        messages: [

          {
            role: "user",
            content: prompt,
          },

        ],

      });

    const reply =
      completion.choices[0]?.message?.content || "{}";

    const result = JSON.parse(reply) as Record<string, unknown>;
    const resumeVersion = await Resume.countDocuments({ userId: access.userId, isMaster: false }) + 1;
    const version = await Resume.create({
      userId: access.userId,
      isMaster: false,
      title: `CAREER RESUME — ${user.careerProfile?.targetRole || "UNTARGETED"}`,
      resumeVersion,
      targetCompany: user.careerProfile?.dreamCompany || "",
      targetRole: user.careerProfile?.targetRole || "",
      jobId: "",
      resume: result,
      resumeScore: Number(result.resumeScore) || 0,
      atsKeywords: Array.isArray(result.atsKeywords) ? result.atsKeywords : [],
    });
    user.careerJourneyStage = "RESUME_GENERATED";
    await user.save();

    return NextResponse.json({

      success: true,

      data: result,
      versionId: String(version._id),
      resumeVersion,
      informationRequired: missingResumeInformation(result),

    });

  } catch (err) {

    console.error(err);

    return NextResponse.json(
      {

        success: false,

        message:
          "Resume generation failed.",

      },
      {

        status: 500,

      }
    );

  }

}
