"use client";

import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  BadgeCheck,
} from "lucide-react";

interface VerdictCardProps {
  score: number;
}

export default function VerdictCard({
  score,
}: VerdictCardProps) {

  const safe = score >= 80;

  const safeReasons = [
    "Official company information verified.",
    "Recruiter email matches official domain.",
    "No suspicious payment requests detected.",
    "Recruitment follows genuine hiring patterns.",
  ];

  const riskReasons = [
    "Unofficial recruiter email detected.",
    "Advance payment request identified.",
    "Suspicious recruitment language found.",
    "Company verification failed.",
  ];

  const reasons = safe ? safeReasons : riskReasons;

  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-xl">

      {/* Header */}

      <div className="flex items-center gap-5">

        <div
          className={`flex h-20 w-20 items-center justify-center rounded-3xl ${
            safe
              ? "bg-green-100"
              : "bg-red-100"
          }`}
        >

          {safe ? (
            <ShieldCheck className="h-10 w-10 text-green-600" />
          ) : (
            <ShieldAlert className="h-10 w-10 text-red-600" />
          )}

        </div>

        <div>

          <h2 className="text-3xl font-bold">

            Guardian AI Report

          </h2>

          <p className="text-slate-500">

            Final AI Decision

          </p>

        </div>

      </div>

      {/* Verdict */}

      <div
        className={`mt-10 rounded-3xl p-8 text-center ${
          safe
            ? "bg-gradient-to-r from-green-50 to-emerald-50"
            : "bg-gradient-to-r from-red-50 to-orange-50"
        }`}
      >

        <BrainCircuit
          className={`mx-auto h-14 w-14 ${
            safe
              ? "text-green-600"
              : "text-red-600"
          }`}
        />

        <h1
          className={`mt-5 text-5xl font-black ${
            safe
              ? "text-green-700"
              : "text-red-700"
          }`}
        >

          {safe
            ? "SAFE"
            : "SCAM DETECTED"}

        </h1>

        <p className="mt-4 text-lg text-slate-600">

          {safe
            ? "Guardian AI successfully verified this recruitment."
            : "Guardian AI identified multiple fraud indicators."}

        </p>

      </div>

      {/* Findings */}

      <div className="mt-10">

        <h3 className="mb-6 flex items-center gap-3 text-2xl font-bold">

          <BadgeCheck className="text-blue-600" />

          AI Findings

        </h3>

        <div className="space-y-4">

          {reasons.map((reason) => (

            <div
              key={reason}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5"
            >

              {safe ? (

                <CheckCircle2 className="h-6 w-6 text-green-600" />

              ) : (

                <AlertTriangle className="h-6 w-6 text-red-600" />

              )}

              <span className="text-slate-700">

                {reason}

              </span>

            </div>

          ))}

        </div>

      </div>

      {/* Confidence */}

      <div className="mt-10 rounded-2xl bg-slate-100 p-6">

        <div className="flex items-center justify-between">

          <span className="font-semibold">

            AI Confidence

          </span>

          <span className="text-2xl font-bold text-blue-600">

            {safe ? "98%" : "95%"}

          </span>

        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-300">

          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
            style={{
              width: safe ? "98%" : "95%",
            }}
          />

        </div>

      </div>

    </section>
  );
}