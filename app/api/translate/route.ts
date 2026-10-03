import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const {
      text,
      targetLanguage,
    } = body;

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          message: "Text is required",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Translation API will be connected here.

      Example options:
      1. Bhashini API
      2. LibreTranslate API
      3. Google Cloud Translation
    */

    if (targetLanguage === "en") {
      return NextResponse.json({
        success: true,
        translatedText: text,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Translation service is not configured.",
      },
      { status: 503 }
    );

  } catch (error) {

    console.error(
      "Translation API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to translate text.",
      },
      {
        status: 500,
      }
    );
  }
}