"use client";

import {
  Scale,
  FileText,
  ShieldCheck,
  Landmark,
  ArrowRight,
  Gavel,
} from "lucide-react";

const rights = [
  "You have the right to file a Cyber Crime complaint.",
  "Preserve payment receipts and screenshots.",
  "Keep WhatsApp chats and emails safely.",
  "Do not delete any evidence.",
  "Inform your bank immediately after fraud.",
  "Report the incident as early as possible.",
];

const legalSteps = [
  {
    title: "File Cyber Complaint",
    description:
      "Submit your complaint through the National Cyber Crime Portal or your nearest Cyber Crime Police Station.",
    icon: FileText,
  },
  {
    title: "Preserve Evidence",
    description:
      "Keep screenshots, payment proof, emails and offer letters for investigation.",
    icon: ShieldCheck,
  },
  {
    title: "Legal Assistance",
    description:
      "Consult legal experts if the fraud involves financial loss or identity theft.",
    icon: Scale,
  },
];

export default function LegalAssistant() {
  return (
    <section className="mt-16 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-10 shadow-xl">

      {/* Header */}

      <div className="text-center">

        <span className="rounded-full bg-indigo-100 px-5 py-2 text-sm font-semibold text-indigo-700">

          LEGAL ASSISTANT

        </span>

        <h2 className="mt-5 text-4xl font-bold text-slate-900">

          Know Your Legal Rights

        </h2>

        <p className="mt-3 text-slate-600">

          CareerGuardian AI helps you understand your rights after
          becoming a victim of recruitment fraud.

        </p>

      </div>

      {/* Rights */}

      <div className="mt-12 rounded-3xl bg-white p-8 shadow-lg">

        <div className="mb-8 flex items-center gap-3">

          <Scale className="h-8 w-8 text-indigo-600" />

          <h3 className="text-2xl font-bold">

            Your Rights

          </h3>

        </div>

        <div className="space-y-5">

          {rights.map((item) => (

            <div
              key={item}
              className="flex items-start gap-4 rounded-2xl bg-slate-50 p-5"
            >

              <ShieldCheck className="mt-1 h-6 w-6 text-green-600" />

              <p className="leading-7 text-slate-700">

                {item}

              </p>

            </div>

          ))}

        </div>

      </div>

      {/* Legal Steps */}

      <div className="mt-12 grid gap-8 lg:grid-cols-3">

        {legalSteps.map((step) => {

          const Icon = step.icon;

          return (

            <div
              key={step.title}
              className="rounded-3xl bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
            >

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">

                <Icon className="h-8 w-8 text-indigo-600" />

              </div>

              <h3 className="mt-6 text-2xl font-bold">

                {step.title}

              </h3>

              <p className="mt-4 leading-7 text-slate-600">

                {step.description}

              </p>

            </div>

          );

        })}

      </div>

      {/* AI Recommendation */}

      <div className="mt-12 rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white shadow-xl">

        <div className="flex items-start gap-5">

          <Gavel className="mt-1 h-10 w-10" />

          <div>

            <h2 className="text-3xl font-bold">

              AI Legal Recommendation

            </h2>

            <p className="mt-5 leading-8 text-indigo-100">

              CareerGuardian AI recommends reporting recruitment
              scams within the first 24 hours. Preserve all digital
              evidence, contact your bank immediately and avoid
              communicating further with the scammer.

            </p>

            <button className="mt-8 flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 transition hover:bg-slate-100">

              Learn More

              <ArrowRight className="h-5 w-5" />

            </button>

          </div>

        </div>

      </div>

      {/* Emergency Notice */}

      <div className="mt-10 rounded-3xl border border-indigo-200 bg-indigo-50 p-6">

        <div className="flex items-center gap-4">

          <Landmark className="h-10 w-10 text-indigo-600" />

          <div>

            <h3 className="text-xl font-bold text-indigo-700">

              Important Notice

            </h3>

            <p className="mt-2 leading-7 text-slate-700">

              This module provides awareness and guidance only.
              Users should always contact the official Cyber Crime
              authorities or legal professionals for case-specific
              assistance.

            </p>

          </div>

        </div>

      </div>

    </section>
  );
}