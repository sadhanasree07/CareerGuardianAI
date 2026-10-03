"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Search, Globe, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrustEngine from "./TrustEngine";
import ExtractedInfo from "./ExtractedInfo";
import { addInvestigation } from "@/lib/dashboard/actions";
export default function UploadCard() {
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState("");
  const [imageMimeType, setImageMimeType] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    

    if (!file) return;
    const maxSize = 1.5 * 1024 * 1024;

if (file.size > maxSize) {
  alert(
    "❌ File size exceeds 1.5 MB.\n\nPlease compress the image and upload again."
  );
  return;
}

    setImage(URL.createObjectURL(file));
    setImageMimeType(file.type);

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageBase64(base64.split(",")[1]);
    };

    reader.readAsDataURL(file);
  }

  async function analyzeRecruitment() {
    if (!imageBase64) {
      alert("Please upload a recruitment image first.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageBase64,
          mimeType:imageMimeType,
          website,
          message,
        }),
      });

      const extract = await response.json();
      console.log("Extract API Response:", extract);

      if (!extract.success) {
        alert(extract.message || "Extraction Failed");
        return;
      }

      const extracted = extract.data;
      console.log("Extracted Object:", extracted);
      alert(JSON.stringify(extracted));

const verifyResponse = await fetch("/api/verify", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ ...extracted, rawText: [extract.text, message].filter(Boolean).join("\n"), website: website || extracted.website || "", inputMethod: extract.inputMethod, inputType: extract.inputMethod }),
});

const verification = await verifyResponse.json();
// Save investigation to Dashboard
await fetch("/api/dashboard", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    company: extracted.company,
    trustScore: verification.trustScore,
    verdict: verification.verdict,
    date: new Date().toLocaleString(),
  }),
});
console.log("Verification Response:", verification);

if (!verification.success) {
  alert("Verification Failed");
  return;
}

setExtractedData({
  ...extracted,
  verification,
});

// ✅ Save Recruitment Report to MongoDB
await fetch("/api/reports/save", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    module: "Recruitment Analyzer",
    title:
      extracted.company || "Recruitment Analysis",
    score:
      verification.trustScore || 0,
    result: {
      extracted,
      verification,
    },
  }),
});

setShowResult(true);
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">

      {/* LEFT PANEL */}

      <div className="rounded-3xl bg-white p-8 shadow-lg">

        <h2 className="text-2xl font-bold text-slate-900">
          Upload Recruitment Evidence
        </h2>

        <p className="mt-2 text-slate-500">
          Upload anything the recruiter shared with you.
        </p>

        <label className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 p-10 transition hover:border-blue-600">

          {image ? (
            <Image
              src={image}
              alt="Preview"
              width={450}
              height={300}
              className="rounded-xl object-cover"
            />
          ) : (
            <>
              <Upload className="mb-4 h-12 w-12 text-blue-600" />

              <p className="font-semibold">
                📤 Upload Recruitment Document
              </p>

              <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-4">

  <p className="font-semibold text-amber-700">
    📁 Supported Upload Formats
  </p>

  <ul className="mt-2 space-y-1 text-sm text-slate-700">

    <li>✅ JPG (.jpg)</li>

    <li>✅ JPEG (.jpeg)</li>

    <li>✅ PNG (.png)</li>

    <li>✅ PDF (.pdf)</li>

  </ul>

  <div className="mt-3 border-t pt-3">

    <p className="font-semibold text-red-600">
      ⚠ Upload Requirements
    </p>

    <ul className="mt-2 space-y-1 text-sm text-slate-700">

      <li>• Maximum file size: <b>1.5 MB</b></li>

      <li>• Image should be clear and readable.</li>

      <li>• Avoid blurry or cropped screenshots.</li>

      <li>• Government notifications and offer letters work best.</li>

    </ul>

  </div>

</div>
            </>
          )}

          <input
            hidden
            type="file"
            accept="image/*,.pdf"
            onChange={handleImage}
          />

        </label>

        <div className="mt-6">

          <label className="font-semibold">
            Website URL (Optional)
          </label>

          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://company.gov.in"
            className="mt-2 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
          />

        </div>

        <div className="mt-6">

          <label className="font-semibold">
            Recruitment Message (Optional)
          </label>

          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste WhatsApp / Telegram / SMS..."
            className="mt-2 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
          />

        </div>

        <Button
          onClick={analyzeRecruitment}
          disabled={loading}
          className="mt-8 w-full rounded-xl py-6 text-lg"
        >
          <Search className="mr-2 h-5 w-5" />

          {loading ? "Analyzing Recruitment..." : "Analyze Recruitment"}

        </Button>

      </div>

      {/* RIGHT PANEL */}

      <div>

        {!showResult ? (

          <div className="rounded-3xl bg-white p-8 shadow-lg">

            <h2 className="text-2xl font-bold">
              Supported Inputs
            </h2>

            <p className="mt-2 text-slate-500">
              CareerGuardian AI supports multiple recruitment formats.
            </p>

            <div className="mt-8 space-y-5">

              <div className="flex items-center gap-3">
                <FileText className="text-blue-600" />
                Government Notification PDF
              </div>

              <div className="flex items-center gap-3">
                <Upload className="text-blue-600" />
                WhatsApp / Telegram Screenshot
              </div>

              <div className="flex items-center gap-3">
                <Globe className="text-blue-600" />
                Official Website URL
              </div>

            </div>

          </div>

        ) : (

          <>
            <ExtractedInfo data={extractedData} />
            <TrustEngine data={extractedData} />
          </>
        )}

      </div>

    </div>
  );
}
