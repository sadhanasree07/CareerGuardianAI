import { NextRequest, NextResponse } from "next/server";
import groq from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const type = body.type === "summary" ? "professional summary" : "project or experience description";
    if (!text) return NextResponse.json({ success: false, message: "Add source text before requesting an improvement." }, { status: 400 });
    if (text.length > 4000) return NextResponse.json({ success: false, message: "Text must be 4,000 characters or fewer." }, { status: 400 });

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b", temperature: 0.2,
      messages: [{ role: "user", content: `Improve the wording of this resume ${type}. Preserve every factual claim and its meaning. Do not add skills, tools, employers, responsibilities, dates, years of experience, metrics, outcomes, awards, or any fact absent from the source. Return only the rewritten text, no quotes or commentary.\n\nSource text:\n${text}` }],
    });
    const improved = response.choices[0]?.message?.content?.trim();
    if (!improved) throw new Error("The writing service returned no text.");
    return NextResponse.json({ success: true, data: { text: improved } });
  } catch (error) {
    console.error("Resume text improvement error:", error);
    return NextResponse.json({ success: false, message: "Unable to improve this text right now." }, { status: 500 });
  }
}
