"use client";

import { useRef, useState } from "react";
import {
  Upload,
  CheckCircle2,
  ArrowRight,
  FileImage,
} from "lucide-react";

interface Report {
  companyName: string;
  recruiterName: string;
  recruiterPhone: string;
  recruiterEmail: string;
  contactMethod: string;
  amountPaid: number;
  paymentMethod: string;
  paymentDate: string;
  scamDescription: string;

  evidence?: {
    paymentProof?: File | null;
    chatScreenshots?: File | null;
    offerLetter?: File | null;
    otherEvidence?: File | null;
  };
}

interface Props {
  report: Report;
  onComplete: (report: Report) => void;
}

export default function UploadEvidence({
  report,
  onComplete,
}: Props) {
  const [updatedReport, setUpdatedReport] =
    useState<Report>(report);

  const paymentRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLInputElement>(null);
  const offerRef = useRef<HTMLInputElement>(null);
  const otherRef = useRef<HTMLInputElement>(null);

  function handleUpload(
    type:
      | "paymentProof"
      | "chatScreenshots"
      | "offerLetter"
      | "otherEvidence",
    file: File | null
  ) {
    setUpdatedReport({
      ...updatedReport,
      evidence: {
        ...updatedReport.evidence,
        [type]: file,
      },
    });
  }

  const cards = [
    {
      title: "Payment Proof",
      ref: paymentRef,
      key: "paymentProof",
    },
    {
      title: "Chat Screenshot",
      ref: chatRef,
      key: "chatScreenshots",
    },
    {
      title: "Offer Letter",
      ref: offerRef,
      key: "offerLetter",
    },
    {
      title: "Other Evidence",
      ref: otherRef,
      key: "otherEvidence",
    },
  ];

  return (
    <section className="rounded-3xl bg-white shadow-xl">

      {/* Header */}

      <div className="border-b p-8">

        <h2 className="text-3xl font-bold">

          Upload Supporting Evidence

        </h2>

        <p className="mt-3 text-slate-500">

          Upload only the evidence you have.
          You can skip any file.

        </p>

      </div>

      {/* Upload Grid */}

      <div className="grid gap-6 p-8 md:grid-cols-2">

        {cards.map((item) => {

          const file =
            updatedReport.evidence?.[
              item.key as keyof typeof updatedReport.evidence
            ];

          return (

            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
            >

              <div className="flex items-center gap-3">

                <FileImage className="h-7 w-7 text-blue-600" />

                <h3 className="text-xl font-semibold">

                  {item.title}

                </h3>

              </div>

              <input
                hidden
                ref={item.ref}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) =>
                  handleUpload(
                    item.key as any,
                    e.target.files?.[0] || null
                  )
                }
              />

              <button
                onClick={() =>
                  item.ref.current?.click()
                }
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-blue-300 py-6 transition hover:bg-blue-50"
              >

                <Upload className="h-6 w-6 text-blue-600" />

                {file
                  ? "Replace File"
                  : "Upload File"}

              </button>

              {file && (

                <div className="mt-5 flex items-center gap-2 text-green-600">

                  <CheckCircle2 className="h-5 w-5" />

                  <span className="font-medium">

                    {file.name}

                  </span>

                </div>

              )}

            </div>

          );

        })}

      </div>

      {/* AI Notice */}

      <div className="mx-8 rounded-2xl bg-blue-50 p-6">

        <h3 className="text-xl font-bold text-blue-700">

          AI Note

        </h3>

        <p className="mt-3 leading-7 text-slate-700">

          Uploading payment receipts, chats and offer
          letters improves the accuracy of complaint
          generation and scam investigation.

        </p>

      </div>

      {/* Continue */}

      <div className="flex justify-end p-8">

        <button
          onClick={() => onComplete(updatedReport)}
          className="flex items-center gap-3 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700"
        >

          Continue

          <ArrowRight className="h-5 w-5" />

        </button>

      </div>

    </section>
  );
}