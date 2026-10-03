"use client";

import {
  Upload,
  ScanSearch,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  GraduationCap,
} from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Recruitment",
    description:
      "Upload a job notification, internship offer, WhatsApp message or recruitment PDF.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: ScanSearch,
    title: "AI Extracts Information",
    description:
      "OCR extracts company name, recruiter, salary, website and contact details.",
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    icon: ShieldCheck,
    title: "12-Layer Verification",
    description:
      "CareerGuardian AI verifies authenticity using twelve intelligent security checks.",
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    icon: AlertTriangle,
    title: "Scam Detection",
    description:
      "Receive Trust Score, AI Verdict, Scam Probability and personalized recommendations.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: ShieldAlert,
    title: "Emergency Recovery",
    description:
      "Generate complaints, organize evidence and receive AI-guided recovery assistance.",
    color: "bg-red-100 text-red-600",
  },
  {
    icon: GraduationCap,
    title: "Career Growth",
    description:
      "Build resumes, improve interviews, predict placements and grow your career safely.",
    color: "bg-green-100 text-green-600",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-slate-50 py-24">

      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="text-center">

          <span className="rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold text-blue-700">

            HOW IT WORKS

          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900">

            One AI Platform.
            <br />
            Complete Career Protection.

          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">

            CareerGuardian AI protects your career from the moment you
            receive a recruitment offer until your placement journey is complete.

          </p>

        </div>

        {/* Timeline */}

        <div className="relative mt-20">

          {/* Vertical Line */}

          <div className="absolute left-8 top-0 hidden h-full w-1 rounded-full bg-blue-200 lg:block" />

          <div className="space-y-12">

            {steps.map((step, index) => {

              const Icon = step.icon;

              return (

                <div
                  key={step.title}
                  className="relative flex flex-col gap-8 lg:flex-row lg:items-center"
                >

                  {/* Icon */}

                  <div
                    className={`z-10 flex h-16 w-16 items-center justify-center rounded-full ${step.color}`}
                  >

                    <Icon className="h-8 w-8" />

                  </div>

                  {/* Card */}

                  <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-lg">

                    <div className="flex items-center justify-between">

                      <h3 className="text-2xl font-bold text-slate-900">

                        Step {index + 1}

                      </h3>

                      <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">

                        {step.title}

                      </span>

                    </div>

                    <p className="mt-5 leading-8 text-slate-600">

                      {step.description}

                    </p>

                  </div>

                </div>

              );

            })}

          </div>

        </div>

      </div>

    </section>
  );
}