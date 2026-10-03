import axios from "axios";
import FormData from "form-data";
import sharp from "sharp";

const OCR_SAFE_LIMIT = 1.3 * 1024 * 1024;

export class OcrExtractionError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "OPTIMIZATION_FAILED"
      | "OCR_PAYLOAD_TOO_LARGE"
      | "OCR_FAILED"
  ) {
    super(message);
    this.name = "OcrExtractionError";
  }
}

async function optimizeImageForOCR(
  imageBuffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; contentType: string }> {
  if (imageBuffer.length <= OCR_SAFE_LIMIT) {
    return { buffer: imageBuffer, contentType: mimeType };
  }

  try {
    const metadata = await sharp(imageBuffer).metadata();
    const originalWidth = metadata.width;
    const originalHeight = metadata.height;

    if (!originalWidth || !originalHeight) {
      throw new Error("The uploaded image dimensions could not be read.");
    }

    let width = originalWidth;
    let height = originalHeight;
    let optimizedBuffer = imageBuffer;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const quality = Math.max(70, 85 - attempt * 3);

      optimizedBuffer = await sharp(imageBuffer)
        .rotate()
        .resize({ width, height, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();

      if (optimizedBuffer.length <= OCR_SAFE_LIMIT) {
        return { buffer: optimizedBuffer, contentType: "image/jpeg" };
      }

      width = Math.max(1200, Math.round(width * 0.85));
      height = Math.max(1200, Math.round(height * 0.85));
    }

    throw new Error("The image could not be reduced below the OCR size limit.");
  } catch (error) {
    if (error instanceof OcrExtractionError) {
      throw error;
    }

    throw new OcrExtractionError(
      "We could not optimize this image for processing. Please upload a clear image or PDF under the supported size.",
      "OPTIMIZATION_FAILED"
    );
  }
}

export async function extractTextFromOCR(
  base64Image: string,
  mimeType = "image/png"
): Promise<string> {
  const apiKey = process.env.OCR_SPACE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OCR_SPACE_API_KEY is missing. Add it to your .env.local file."
    );
  }

  const cleanBase64 = base64Image.replace(
    /^data:image\/[a-zA-Z0-9.+-]+;base64,/, ""
  );

  const contentType = mimeType || "image/png";
  const imageBuffer = Buffer.from(cleanBase64, "base64");
  const originalSizeMb = imageBuffer.length / (1024 * 1024);
  const optimized = await optimizeImageForOCR(imageBuffer, contentType);
  const optimizedSizeMb = optimized.buffer.length / (1024 * 1024);

  console.log(`Original size: ${originalSizeMb.toFixed(2)} MB`);
  console.log(`Optimized size: ${optimizedSizeMb.toFixed(2)} MB`);

  const form = new FormData();

  form.append("apikey", apiKey);
  form.append("language", "eng");
  form.append("isOverlayRequired", "false");
  form.append("OCREngine", "2");
  form.append("scale", "true");

  form.append("file", optimized.buffer, {
    filename: "upload" + (optimized.contentType.includes("jpeg") ? ".jpg" : ".png"),
    contentType: optimized.contentType,
  });

  try {
    console.log("OCR request started");

    const response = await axios.post(
      "https://api.ocr.space/parse/image",
      form,
      {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
      }
    );

    console.log("OCR completed");

    const parsed = response?.data;

    if (!parsed || !Array.isArray(parsed.ParsedResults)) {
      return "";
    }

    const text = parsed.ParsedResults.map((x: any) => x.ParsedText || "")
      .join("\n")
      .trim();

    return text;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 413) {
      throw new OcrExtractionError(
        "The document is too large to process. Please upload a clear image or PDF under the supported size.",
        "OCR_PAYLOAD_TOO_LARGE"
      );
    }

    throw new OcrExtractionError(
      "OCR processing failed. Please try again with a clear image or PDF.",
      "OCR_FAILED"
    );
  }
}