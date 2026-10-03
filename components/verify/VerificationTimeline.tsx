"use client";

import {
  CheckCircle2,
  LoaderCircle,
  Clock3,
  FileText,
  Building2,
  Globe,
  Mail,
  Phone,
  DollarSign,
  SearchCheck,
  ScanSearch,
  BrainCircuit,
  ShieldCheck,
} from "lucide-react";

export const verificationLayers = [
  {
    title: "OCR Extraction",
    icon: FileText,
    result: "Recruitment details extracted successfully.",
  },
  {
    title: "Company Registry",
    icon: Building2,
    result: "Company registered in official database.",
  },
  {
    title: "Website Verification",
    icon: Globe,
    result: "Official website verified.",
  },
  {
    title: "Recruiter Email",
    icon: Mail,
    result: "Official email domain matched.",
  },
  {
    title: "Phone Validation",
    icon: Phone,
    result: "Contact number verified.",
  },
  {
    title: "Salary Analysis",
    icon: DollarSign,
    result: "Salary pattern appears genuine.",
  },
  {
    title: "Keyword Analysis",
    icon: SearchCheck,
    result: "No scam keywords detected.",
  },
  {
    title: "Document Check",
    icon: ScanSearch,
    result: "Document consistency verified.",
  },
  {
    title: "AI Risk Analysis",
    icon: BrainCircuit,
    result: "Low fraud probability detected.",
  },
  {
    title: "Cross Verification",
    icon: ShieldCheck,
    result: "Cross-platform verification completed.",
  },
  {
    title: "Security Validation",
    icon: ShieldCheck,
    result: "Security checks completed.",
  },
  {
    title: "Trust Score",
    icon: CheckCircle2,
    result: "Guardian Trust Score generated.",
  },
];

interface Props {
  currentStep: number;
}

export default function VerificationTimeline({
  currentStep,
}: Props) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl">

      <h2 className="text-2xl font-bold">

        Verification Timeline

      </h2>

      <div className="mt-8 space-y-4">

        {verificationLayers.map((layer, index) => {

          const Icon = layer.icon;

          const completed = index < currentStep;
          const active = index === currentStep;

          return (

            <div
              key={layer.title}
              className={`flex items-center justify-between rounded-2xl border p-4 transition-all

              ${
                completed
                  ? "border-green-200 bg-green-50"
                  : active
                  ? "border-blue-400 bg-blue-50"
                  : "border-slate-200 bg-white"
              }

              `}
            >

              <div className="flex items-center gap-4">

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl

                  ${
                    completed
                      ? "bg-green-600 text-white"
                      : active
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100"
                  }

                  `}
                >

                  <Icon className="h-5 w-5" />

                </div>

                <span className="font-medium">

                  {layer.title}

                </span>

              </div>

              {completed ? (
                <CheckCircle2 className="text-green-600" />
              ) : active ? (
                <LoaderCircle className="animate-spin text-blue-600" />
              ) : (
                <Clock3 className="text-slate-400" />
              )}

            </div>

          );

        })}

      </div>

    </div>
  );
}