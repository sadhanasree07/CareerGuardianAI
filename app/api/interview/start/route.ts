import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {

    const body = await req.json();

    const {
      company,
      jobRole,
      requiredSkills,
      education,
      salary,
      experience,
    } = body;

    const prompt = `
You are Guardian AI Interview Engine.

Generate a REAL interview for this recruitment.

Company:
${company}

Role:
${jobRole}

Education:
${education}

Salary:
${salary}

Experience:
${experience}

Required Skills:
${Array.isArray(requiredSkills)
  ? requiredSkills.join(", ")
  : requiredSkills}

Generate ONLY JSON.

{
  "title":"Embedded Engineer Interview",

  "company":"Texas Instruments",

  "difficulty":"Intermediate",

  "duration":"20 Minutes",

  "questions":[

    {
      "id":1,
      "type":"Technical",
      "question":"Explain RTOS Scheduling."
    },

    {
      "id":2,
      "type":"Technical",
      "question":"Difference between UART and SPI."
    },

    {
      "id":3,
      "type":"Scenario",
      "question":"How would you debug an embedded system that randomly resets?"
    },

    {
      "id":4,
      "type":"HR",
      "question":"Tell me about yourself."
    },

    {
      "id":5,
      "type":"Behavioral",
      "question":"Describe a challenging project you completed."
    }

  ]
}

Return ONLY JSON.
`;

    const completion =
      await groq.chat.completions.create({

model: "openai/gpt-oss-120b",
        temperature: 0.3,

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],

      });

    const text =
      completion.choices[0].message.content || "{}";

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const interview = JSON.parse(cleaned);

    return NextResponse.json({
      success: true,
      interview,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Interview generation failed.",
      },
      {
        status: 500,
      }
    );

  }
}