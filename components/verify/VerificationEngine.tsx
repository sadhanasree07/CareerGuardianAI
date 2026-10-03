"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Building2,
  Globe,
  Mail,
  Phone,
  DollarSign,
  SearchCheck,
  ScanSearch,
  ShieldCheck,
  BrainCircuit,
  BadgeCheck,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

const layers = [
  {
    title: "OCR Document Extraction",
    icon: FileText,
    result: "Company details extracted successfully.",
  },
  {
    title: "Company Registry Verification",
    icon: Building2,
    result: "Company found in official registry.",
  },
  {
    title: "Official Website Verification",
    icon: Globe,
    result: "Official website verified.",
  },
  {
    title: "Recruiter Email Validation",
    icon: Mail,
    result: "Official company email detected.",
  },
  {
    title: "Phone Verification",
    icon: Phone,
    result: "Recruiter contact verified.",
  },
  {
    title: "Salary Pattern Analysis",
    icon: DollarSign,
    result: "Salary appears realistic.",
  },
  {
    title: "Scam Keyword Detection",
    icon: SearchCheck,
    result: "No suspicious keywords detected.",
  },
  {
    title: "Document Consistency Check",
    icon: ScanSearch,
    result: "Document structure looks valid.",
  },
  {
    title: "AI Risk Intelligence",
    icon: BrainCircuit,
    result: "Low fraud probability identified.",
  },
  {
    title: "Recruitment Pattern Matching",
    icon: ShieldCheck,
    result: "Recruitment matches trusted patterns.",
  },
  {
    title: "Cross Verification",
    icon: BadgeCheck,
    result: "Cross-check completed successfully.",
  },
  {
    title: "Trust Score Generation",
    icon: ShieldCheck,
    result: "Guardian Trust Score generated.",
  },
];

interface Props {
  onComplete?: () => void;
}

export default function VerificationEngine({
  onComplete,
}: Props) {

  const [step, setStep] = useState(0);

  useEffect(() => {

    if (step >= layers.length) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setStep((prev) => prev + 1);
    }, 1700);

    return () => clearTimeout(timer);

  }, [step, onComplete]);

  const current = layers[Math.min(step, layers.length - 1)];

  const Icon = current.icon;

  return (
    <section className="mt-8 rounded-3xl bg-white p-10 shadow-xl">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-bold">

            Guardian Verify™ Engine

          </h2>

          <p className="mt-2 text-slate-500">

            Running Intelligent Security Checks...

          </p>

        </div>

        <div className="rounded-full bg-blue-100 px-5 py-2">

          <span className="font-bold text-blue-700">

            {Math.min(step + 1, 12)} / 12

          </span>

        </div>

      </div>

      {/* AI Card */}

      <div className="mt-12 rounded-3xl border border-blue-200 bg-blue-50 p-10">

        <div className="flex items-center gap-6">

          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-white">

            <Icon className="h-10 w-10" />

          </div>

          <div>

            <h3 className="text-3xl font-bold">

              {current.title}

            </h3>

            <p className="mt-2 text-slate-600">

              Guardian AI is analysing this layer...

            </p>

          </div>

        </div>

        {/* Progress */}

        <div className="mt-10">

          <div className="mb-3 flex justify-between">

            <span>

              Processing...

            </span>

            <LoaderCircle className="h-5 w-5 animate-spin text-blue-600" />

          </div>

          <div className="h-4 overflow-hidden rounded-full bg-slate-200">

            <div className="h-full w-3/4 animate-pulse rounded-full bg-blue-600" />

          </div>

        </div>

      </div>

      {/* Completed */}

      <div className="mt-10">

        <h3 className="mb-6 text-xl font-bold">

          Completed Checks

        </h3>

        <div className="space-y-4">

          {layers.slice(0, step).map((item) => {

            const DoneIcon = item.icon;

            return (

              <div
                key={item.title}
                className="flex items-start gap-5 rounded-2xl border border-green-200 bg-green-50 p-5"
              >

                <DoneIcon className="mt-1 h-6 w-6 text-green-600" />

                <div>

                  <div className="flex items-center gap-3">

                    <span className="font-bold">

                      {item.title}

                    </span>

                    <CheckCircle2 className="h-5 w-5 text-green-600" />

                  </div>

                  <p className="mt-2 text-slate-600">

                    {item.result}

                  </p>

                </div>

              </div>

            );

          })}

        </div>

      </div>

      {step >= layers.length && (

        <div className="mt-10 rounded-3xl bg-gradient-to-r from-green-600 to-emerald-500 p-8 text-center text-white">

          <CheckCircle2 className="mx-auto h-14 w-14" />

          <h2 className="mt-5 text-3xl font-bold">

            Guardian Verify™ Completed

          </h2>

          <p className="mt-3">

            All twelve verification layers finished successfully.

          </p>

        </div>

      )}

    </section>
  );
}