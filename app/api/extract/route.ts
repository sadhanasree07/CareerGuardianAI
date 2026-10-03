import { NextResponse } from "next/server";
import groq from "@/lib/groq";
import { extractTextFromOCR, OcrExtractionError } from "@/lib/ocr";
import { extractionPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { image, mimeType } = body;
    const inputMethod = body.inputMethod === "url" ? "url" : body.inputMethod === "text" ? "text" : "ocr";
    const maxTextLength = body.inputType === "recording" ? 100000 : 30000;
    let extractedText = "";
    const extractedDocumentText = typeof body.extractedDocumentText === "string" ? body.extractedDocumentText : "";
    const ocrImages = Array.isArray(body.ocrImages) ? body.ocrImages.filter((value: unknown): value is string => typeof value === "string").slice(0, 12) : [];

    if (inputMethod === "text" || inputMethod === "url") {
      const rawInput = typeof body.text === "string" ? body.text : typeof body.url === "string" ? `Recruitment opportunity URL: ${body.url}` : "";
      if (!rawInput.trim()) {
        return NextResponse.json({ success: false, message: "Please paste the message before continuing." }, { status: 400 });
      }
      const normalized = rawInput
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map((line: string) => line.replace(/[\t ]+/g, " ").trim())
        .join("\n")
        .replace(/\n{4,}/g, "\n\n\n")
        .trim();
      if (normalized.length > maxTextLength) {
        return NextResponse.json({ success: false, message: "This message is too long. Please keep it under 30,000 characters." }, { status: 413 });
      }
      if (inputMethod === "text" && normalized.length < 20) {
        return NextResponse.json({ success: false, message: "Please provide more of the conversation or recruitment message so CareerGuardian AI can analyze meaningful context." }, { status: 400 });
      }
      extractedText = normalized;
    } else if (extractedDocumentText.trim()) {
      extractedText = extractedDocumentText.trim().slice(0, maxTextLength);
    } else if (ocrImages.length) {
      const pageTexts: string[] = [];
      for (const pageImage of ocrImages) {
        try {
          const pageText = await extractTextFromOCR(pageImage, "image/jpeg");
          if (pageText.trim()) pageTexts.push(pageText.trim());
        } catch {
          continue;
        }
      }
      extractedText = pageTexts.join("\n").slice(0, maxTextLength);
    } else if (!image) {
      return NextResponse.json(
        {
          success: false,
          message: "No image received.",
        },
        {
          status: 400,
        }
      );
    } else {
      extractedText = await extractTextFromOCR(image, mimeType || "image/png");
    }

    if (!extractedText || extractedText.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          message: inputMethod === "ocr" ? "No text found in the uploaded image." : "Please provide more message content to analyze.",
        },
        {
          status: 400,
        }
      );
    }

    const completion =
      await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
        temperature: 0,

        response_format: {
          type: "json_object",
        },

        messages: [
          {
            role: "system",
            content: extractionPrompt,
          },
          {
            role: "user",
            content: extractedText,
          },
        ],
      });

    const reply =
      completion.choices[0]?.message?.content || "{}";

    let json;

    try {
      json = JSON.parse(reply);
    } catch {
      json = {};
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      data: json,
      inputMethod,
    });

  } catch (error) {
    if (error instanceof OcrExtractionError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: error.code === "OCR_PAYLOAD_TOO_LARGE" ? 413 : 400,
        }
      );
    }

    console.error("Extract API Error:", error instanceof Error ? error.message : "Unknown error");

    return NextResponse.json(
      {
        success: false,
        message: "CareerGuardian AI could not analyze this message right now. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}
