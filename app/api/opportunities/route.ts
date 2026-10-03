import { NextResponse } from "next/server";
import groq  from "@/lib/groq";

const prompt = `
You are CareerGuardian AI Opportunity Engine.

Return ONLY JSON.

{
 "jobs":[
   {
     "company":"",
     "role":"",
     "location":"",
     "salary":"",
     "type":"",
     "experience":"",
     "match":95,
     "description":"",
     "skills":[""],
     "eligibility":[""]
   }
 ],
 "match":{
   "score":95,
   "strengths":[""],
   "missingSkills":[""],
   "recommendation":""
 }
}
`;

export async function POST(req: Request) {
  try {

    const body = await req.json();

    const completion =
      await groq.chat.completions.create({

        model: "openai/gpt-oss-120b",

        temperature:0.3,

        response_format:{
          type:"json_object"
        },

        messages:[
          {
            role:"system",
            content:prompt
          },
          {
            role:"user",
            content:JSON.stringify(body)
          }
        ]

      });

    const reply =
      completion.choices[0]?.message?.content || "{}";

    return NextResponse.json({

      success:true,

      data:JSON.parse(reply)

    });

  } catch {

    return NextResponse.json({

      success:false,

      message:"Failed"

    });

  }
}