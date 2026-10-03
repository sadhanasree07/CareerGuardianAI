"use client";

import { ShieldAlert, Sparkles, ArrowRight } from "lucide-react";

interface EmergencyLandingProps {
  companyName: string;
  trustScore: number;
  verdict: string;
  onStart: () => void;
}

export default function EmergencyLanding({
  companyName,
  trustScore,
  verdict,
  onStart,
}: EmergencyLandingProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-xl">

      {/* Hero */}

      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-8 py-14 text-white">

        <div className="mx-auto max-w-4xl text-center">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur">

            <ShieldAlert className="h-12 w-12 animate-pulse" />

          </div>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2">

            <Sparkles className="h-5 w-5" />

            <span className="font-semibold">

              CareerGuardian AI Emergency Recovery

            </span>

          </div>

          <h1 className="mt-8 text-5xl font-extrabold">

            Recruitment Scam Detected

          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-red-100">

            Don't panic. CareerGuardian AI will guide you step-by-step
            to preserve evidence, generate your complaint and begin
            the recovery process.

          </p>

        </div>

      </div>

      {/* Investigation Summary */}

      <div className="grid gap-6 p-8 md:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

          <p className="text-sm font-medium text-slate-500">

            Company Detected

          </p>

          <h2 className="mt-3 text-2xl font-bold text-slate-900">

            {companyName || "Unknown Company"}

          </h2>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

          <p className="text-sm font-medium text-slate-500">

            Trust Score

          </p>

          <h2 className="mt-3 text-2xl font-bold text-red-600">

            {trustScore}/100

          </h2>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

          <p className="text-sm font-medium text-slate-500">

            AI Verdict

          </p>

          <h2
            className={`mt-3 text-2xl font-bold ${
              verdict === "Scam"
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {verdict}
          </h2>

        </div>

      </div>

      {/* AI Message */}

      <div className="mx-8 rounded-2xl border border-red-200 bg-red-50 p-6">

        <h3 className="text-xl font-bold text-red-700">

          AI Recommendation

        </h3>

        <p className="mt-4 leading-8 text-slate-700">

          Based on the investigation results, this recruitment
          appears to be highly suspicious. The next few minutes are
          important. CareerGuardian AI will ask a few questions to
          prepare your complaint and recovery plan.

        </p>

      </div>

      {/* Footer */}

      <div className="flex flex-col items-center gap-6 p-10">

        <div className="text-center">

          <p className="text-slate-600">

            Estimated Time

          </p>

          <h2 className="mt-2 text-3xl font-bold text-blue-600">

            2 – 3 Minutes

          </h2>

        </div>

        <button
          onClick={onStart}
          className="flex items-center gap-3 rounded-2xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
        >
          Start Emergency Recovery

          <ArrowRight className="h-5 w-5" />

        </button>

      </div>

    </section>
  );
}