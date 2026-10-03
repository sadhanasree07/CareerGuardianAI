"use client";

import {
  ShieldCheck,
  Brain,
  ScanSearch,
  Lock,
} from "lucide-react";

const highlights = [
  {
    icon: ShieldCheck,
    title: "12-Layer Verification",
    description:
      "Every recruitment is verified using OCR, NLP, government portal matching, company validation and more.",
    color: "from-blue-600 to-cyan-500",
  },
  {
    icon: ScanSearch,
    title: "Real-Time Scam Detection",
    description:
      "Analyze recruitment PDFs, websites, WhatsApp messages, emails and QR codes within seconds.",
    color: "from-violet-600 to-indigo-500",
  },
  {
    icon: Brain,
    title: "AI Career Intelligence",
    description:
      "Career DNA, Resume Intelligence, Placement Prediction and AI Mentor work together in one platform.",
    color: "from-emerald-600 to-teal-500",
  },
  {
    icon: Lock,
    title: "Secure Platform",
    description:
      "JWT Authentication, MongoDB storage and protected dashboards ensure secure access.",
    color: "from-orange-500 to-red-500",
  },
];

export function StatsSection() {
  return (
    <section className="bg-slate-50 py-24">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mx-auto max-w-3xl text-center">

          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">

            AI Platform Highlights

          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900">

            Everything You Need For A Safe Career

          </h2>

          <p className="mt-6 text-xl text-slate-600">

            CareerGuardian AI combines recruitment verification,
            career intelligence and placement preparation into one
            intelligent platform.

          </p>

        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2">

          {highlights.map((item) => {

            const Icon = item.icon;

            return (

              <div
                key={item.title}
                className="rounded-3xl bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
              >

                <div
                  className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${item.color} text-white`}
                >

                  <Icon className="h-8 w-8" />

                </div>

                <h3 className="text-2xl font-bold">

                  {item.title}

                </h3>

                <p className="mt-4 leading-8 text-slate-600">

                  {item.description}

                </p>

              </div>

            );

          })}

        </div>

      </div>

    </section>
  );
}