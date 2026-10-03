import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: NextRequest) {

  try {

    const formData = await req.formData();

    const audio = formData.get("audio") as File;

    if (!audio) {

      return NextResponse.json(
        {
          success: false,
          message: "No audio uploaded.",
        },
        {
          status: 400,
        }
      );

    }

    const transcription =
      await groq.audio.transcriptions.create({

        file: audio,

        model: "whisper-large-v3",

        language: "en",

        response_format: "json",

      });

    return NextResponse.json({

      success: true,

      transcript: transcription.text,

    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );

  }

}