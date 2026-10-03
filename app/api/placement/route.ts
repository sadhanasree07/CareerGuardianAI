import { NextResponse } from "next/server";
import groq  from "@/lib/groq";

const placementPrompt = `
You are CareerGuardian AI Placement Predictor.

Analyze the student's profile.

Return ONLY valid JSON.

{
  "placementChance":0,
  "confidence":0,
  "status":"",
  "salary":"",
  "skillsScore":0,
  "projectScore":0,
  "communicationScore":0,
  "aptitudeScore":0,
  "cgpaScore":0,
  "recommendations":[
    ""
  ],
  "companies":[
    {
      "name":"",
      "role":"",
      "match":0
    }
  ],
  "improvementPlan":[
    ""
  ]
}

Rules

Return JSON only.

Placement chance between 0-100.

Recommend realistic companies.

Recommend realistic salary.

Give 5 recommendations.

Give 5 improvement steps.
`;

export async function POST(req: Request) {
  try {

    const body = await req.json();

    const completion =
      await groq.chat.completions.create({

        model: "openai/gpt-oss-120b",

        temperature: 0.3,

        response_format: {
          type: "json_object",
        },

        messages: [

          {
            role: "system",
            content: placementPrompt,
          },

          {
            role: "user",
            content: JSON.stringify(body),
          },

        ],

      });

    const reply =
      completion.choices[0]?.message?.content || "{}";

    return NextResponse.json({
  success: true,
  data: JSON.parse(reply),
});

  } catch (err) {

    console.error(err);

    return NextResponse.json({

      success: false,

      message: "Prediction Failed",

    });

  }
}