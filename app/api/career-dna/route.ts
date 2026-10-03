import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import connectDB from "@/lib/mongodb";
import CareerDNA from "@/models/CareerDNA";
import { getPremiumAccess } from "@/lib/premiumAccess";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: NextRequest) {

  try {

    const access = await getPremiumAccess(req);
    if (!access) {
      return NextResponse.json({ success: false, message: "Sign in to build your Career DNA." }, { status: 401 });
    }
    if (!access.premiumUnlocked) {
      return NextResponse.json({ success: false, message: "Build Your Career requires 100 credits and Premium access.", credits: access.credits, requiredCredits: 100 }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();

    const {

      verifiedJob,

      student,

      jobPreferences,

    } = body;

    const prompt = `

You are Guardian Career DNA AI.

Analyze the VERIFIED RECRUITMENT and the STUDENT PROFILE.

Return ONLY JSON.

Verified Recruitment

${JSON.stringify(verifiedJob, null, 2)}

Student Profile

${JSON.stringify(student, null, 2)}

Return JSON in this format:

{

"readiness":0,

"resumeScore":0,

"githubScore":0,

"technicalScore":0,

"communicationScore":0,

"projectScore":0,

"hiringProbability":0,

"matchedSkills":[],

"missingSkills":[],

"strongAreas":[],

"weakAreas":[],

"recommendedProjects":[],

"recommendedCourses":[],

"recommendedCompanies":[],

"salaryPrediction":{

"current":"",

"future":""

},

"learningRoadmap":[

{

"week":"",

"task":""

}

],

"recommendation":""

}

Rules

Only JSON.

No markdown.

No explanation.

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

    let result: any;

    try {

      result = JSON.parse(reply);

    } catch {

      result = {};

    }

    result.readiness =
      Number(result.readiness || 0);

    result.resumeScore =
      Number(result.resumeScore || 0);

    result.githubScore =
      Number(result.githubScore || 0);

    result.technicalScore =
      Number(result.technicalScore || 0);

    result.communicationScore =
      Number(result.communicationScore || 0);

    result.projectScore =
      Number(result.projectScore || 0);

    result.hiringProbability =
      Number(result.hiringProbability || 0);

    result.matchedSkills =
      result.matchedSkills || [];

    result.missingSkills =
      result.missingSkills || [];

    result.strongAreas =
      result.strongAreas || [];

    result.weakAreas =
      result.weakAreas || [];

    result.recommendedProjects =
      result.recommendedProjects || [];

    result.recommendedCourses =
      result.recommendedCourses || [];

    result.recommendedCompanies =
      result.recommendedCompanies || [];

    result.learningRoadmap =
      result.learningRoadmap || [];

    result.salaryPrediction =
      result.salaryPrediction || {

        current: "",

        future: "",

      };
          const careerDNA = await CareerDNA.create({

      userId: access.userId,

      verifiedJob,

      student,

      report: result,

      jobPreferences: {
        roles: jobPreferences?.roles || [],
        skills: jobPreferences?.skills || [],
        locations: jobPreferences?.locations || [],
        employmentTypes: jobPreferences?.employmentTypes || [],
        preferredCompanies: jobPreferences?.preferredCompanies || [],
        minimumMatchScore: Number(jobPreferences?.minimumMatchScore ?? 60),
      },

    });

    return NextResponse.json({

      success: true,

      data: result,

      id: careerDNA._id,

    });

  } catch (error) {

    console.error(
      "Career DNA Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Career DNA generation failed.",
      },
      {
        status: 500,
      }
    );

  }

}
