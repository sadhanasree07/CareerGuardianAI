"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";

export default function UploadResume({
  onResult,
}: {
  onResult: (data: any) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);

  async function uploadImage(file: File) {
    setLoading(true);

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        console.log("Uploading image...");

        const image = reader.result;

        const response = await fetch("/api/careerDNA", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image,
          }),
        });

        console.log("Response Status:", response.status);

        const json = await response.json();

        console.log("API Response:", json);

        if (!response.ok) {
          alert(json.message || "Career DNA API Failed");
          return;
        }

        if (json.success) {

  onResult(json.data);

  // Save report to MongoDB
  await fetch("/api/reports/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      module: "Career DNA",
      title: "Career DNA Analysis",
      score:
        json.data.careerScore ||
        json.data.score ||
        0,
      result: json.data,
    }),
  });

} else {
  alert(json.message || "Career DNA Failed");
}
      } catch (error) {
        console.error("Upload Error:", error);
        alert("Something went wrong. Check console.");
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      console.error("File Reader Error");
      alert("Unable to read image.");
      setLoading(false);
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="mt-10 rounded-3xl bg-white p-10 shadow">

      <h2 className="text-3xl font-bold">
        Upload Resume Screenshot
      </h2>

      <p className="mt-3 text-slate-500">
        Supported Format:
        <br />
        PNG • JPG • JPEG
        <br />
        Maximum Size: 5 MB
      </p>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (!file) return;

          uploadImage(file);
        }}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="mt-8 w-full rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 p-12 transition hover:bg-blue-100 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />

            <p className="mt-5 font-semibold">
              CareerGuardian AI is analyzing your resume...
            </p>
          </>
        ) : (
          <>
            <Upload className="mx-auto h-10 w-10 text-blue-600" />

            <p className="mt-5 text-xl font-semibold">
              Click to Upload Resume Screenshot
            </p>

            <p className="mt-2 text-slate-500">
              PNG • JPG • JPEG
            </p>
          </>
        )}
      </button>

    </div>
  );
}