import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import connectDB from "@/lib/mongodb";
import Interview from "@/models/Interview";
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const {
      company,
      role,
      question,
      answer,
    } = body;

    const prompt = `
You are Guardian AI Interview Evaluator.

Evaluate the student's interview answer.

Company:
${company}

Role:
${role}

Question:
${question}

Student Answer:
${answer}

Return ONLY JSON.

{
  "technical":88,
  "communication":82,
  "confidence":79,
  "problemSolving":90,

  "overall":85,

  "feedback":"Explain in one paragraph.",

  "strengths":[
    "Strength 1",
    "Strength 2",
    "Strength 3"
  ],

  "improvements":[
    "Improvement 1",
    "Improvement 2",
    "Improvement 3"
  ]
}
`;

    const completion =
      await groq.chat.completions.create({

        model: "openai/gpt-oss-120b",
        temperature: 0.2,

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

    const result = JSON.parse(cleaned);
    await connectDB();

await Interview.create({

  userId: "demo-user",

  score: result.overall,

  feedback: result.feedback,

  technical: result.technical,

  communication: result.communication,

  confidence: result.confidence,

  problemSolving: result.problemSolving,

  strengths: result.strengths,

  improvements: result.improvements,

});

    return NextResponse.json({
      success: true,
      evaluation: result,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Evaluation failed.",
      },
      {
        status: 500,
      }
    );

  }

}