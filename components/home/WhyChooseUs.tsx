"use client";

import {
  ShieldCheck,
  BrainCircuit,
  ShieldAlert,
  BadgeCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const features = [
  {
    title: "12-Layer AI Verification",
    traditional: false,
    careerGuardian: true,
  },
  {
    title: "AI Scam Detection",
    traditional: false,
    careerGuardian: true,
  },
  {
    title: "Raise a Complaint",
    traditional: false,
    careerGuardian: true,
  },
  {
    title: "Complaint Generator",
    traditional: false,
    careerGuardian: true,
  },
  {
    title: "Career Intelligence",
    traditional: false,
    careerGuardian: true,
  },
  {
    title: "Resume + Placement AI",
    traditional: false,
    careerGuardian: true,
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-white py-24">

      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="text-center">

          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-5 py-2">

            <Sparkles className="h-5 w-5 text-blue-600" />

            <span className="font-semibold text-blue-700">

              WHY CAREERGUARDIAN AI?

            </span>

          </div>

          <h2 className="mt-6 text-5xl font-bold text-slate-900">

            More Than Just Scam Detection

          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">

            CareerGuardian AI is a complete AI-powered recruitment
            protection and career intelligence platform that
            protects, guides and empowers job seekers.

          </p>

        </div>

        {/* Comparison Table */}

        <div className="mt-20 overflow-hidden rounded-3xl border border-slate-200 shadow-xl">

          <div className="grid grid-cols-3 bg-slate-900 text-white">

            <div className="p-6 text-xl font-bold">

              Feature

            </div>

            <div className="border-l border-slate-700 p-6 text-center text-xl font-bold">

              Traditional Platforms

            </div>

            <div className="border-l border-slate-700 bg-blue-700 p-6 text-center text-xl font-bold">

              CareerGuardian AI

            </div>

          </div>

          {features.map((feature) => (

            <div
              key={feature.title}
              className="grid grid-cols-3 border-t border-slate-200"
            >

              <div className="flex items-center p-6 font-semibold text-slate-700">

                {feature.title}

              </div>

              <div className="flex items-center justify-center border-l border-slate-200">

                {feature.traditional ? (
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                ) : (
                  <XCircle className="h-7 w-7 text-red-500" />
                )}

              </div>

              <div className="flex items-center justify-center border-l border-slate-200 bg-blue-50">

                {feature.careerGuardian ? (
                  <CheckCircle2 className="h-7 w-7 text-blue-600" />
                ) : (
                  <XCircle className="h-7 w-7 text-red-500" />
                )}

              </div>

            </div>

          ))}

        </div>

        {/* Highlights */}

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          <div className="rounded-3xl bg-blue-50 p-8">

            <ShieldCheck className="h-12 w-12 text-blue-600" />

            <h3 className="mt-6 text-2xl font-bold">

              Protect

            </h3>

            <p className="mt-4 leading-8 text-slate-600">

              Detect fake jobs, internships and recruitment scams
              before sharing your personal information.

            </p>

          </div>

          <div className="rounded-3xl bg-slate-50 p-8">

            <BrainCircuit className="h-12 w-12 text-slate-700" />

            <h3 className="mt-6 text-2xl font-bold">

              Verify

            </h3>

            <p className="mt-4 leading-8 text-slate-600">

              AI verifies recruitment using our proprietary
              12-layer verification engine.

            </p>

          </div>

          <div className="rounded-3xl bg-red-50 p-8">

            <ShieldAlert className="h-12 w-12 text-red-600" />

            <h3 className="mt-6 text-2xl font-bold">

              Recover

            </h3>

            <p className="mt-4 leading-8 text-slate-600">

              AI helps victims recover through complaint generation,
              evidence management and emergency guidance.

            </p>

          </div>

        </div>

        {/* Bottom Banner */}

        <div className="mt-24 rounded-[36px] bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-12 text-center text-white shadow-2xl">

          <BadgeCheck className="mx-auto h-16 w-16" />

          <h2 className="mt-8 text-4xl font-bold">

            CareerGuardian AI

          </h2>

          <p className="mt-5 text-xl text-blue-100">

            Protect • Verify • Succeed

          </p>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-blue-100">

            One intelligent AI platform designed to safeguard job seekers,
            prevent recruitment fraud and empower career growth.

          </p>

        </div>

      </div>

    </section>
  );
}