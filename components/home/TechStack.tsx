"use client";

import {
  MonitorSmartphone,
  BrainCircuit,
  ShieldCheck,
  Database,
  Cloud,
  ArrowDown,
  Cpu,
} from "lucide-react";

const architecture = [
  {
    icon: MonitorSmartphone,
    title: "Frontend",
    subtitle: "Next.js + React + Tailwind CSS",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: BrainCircuit,
    title: "AI Intelligence",
    subtitle: "Gemini AI + OCR + NLP Analysis",
    color: "bg-violet-100 text-violet-600",
  },
  {
    icon: ShieldCheck,
    title: "12-Layer Verification",
    subtitle: "Recruitment Scam Detection Engine",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Cpu,
    title: "Recovery Engine",
    subtitle: "Complaint • Evidence • Recovery AI",
    color: "bg-red-100 text-red-600",
  },
  {
    icon: Database,
    title: "Database",
    subtitle: "MongoDB + User Reports",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Cloud,
    title: "Cloud Platform",
    subtitle: "Render Deployment + APIs",
    color: "bg-cyan-100 text-cyan-600",
  },
];

export default function TechStack() {
  return (
    <section className="bg-slate-50 py-24">

      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="text-center">

          <span className="rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold text-blue-700">

            TECHNOLOGY STACK

          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900">

            Powered by Modern AI Technology

          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">

            CareerGuardian AI combines Artificial Intelligence,
            OCR, secure cloud technologies and a proprietary
            12-Layer Verification Engine to detect recruitment scams
            and protect job seekers.

          </p>

        </div>

        {/* Architecture Flow */}

        <div className="mt-20 flex flex-col items-center">

          {architecture.map((item, index) => {

            const Icon = item.icon;

            return (

              <div
                key={item.title}
                className="w-full max-w-2xl"
              >

                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-xl">

                  <div className="flex items-center gap-6">

                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.color}`}
                    >

                      <Icon className="h-8 w-8" />

                    </div>

                    <div>

                      <h3 className="text-2xl font-bold text-slate-900">

                        {item.title}

                      </h3>

                      <p className="mt-2 text-slate-600">

                        {item.subtitle}

                      </p>

                    </div>

                  </div>

                </div>

                {index !== architecture.length - 1 && (

                  <div className="flex justify-center py-5">

                    <ArrowDown className="h-8 w-8 text-blue-500 animate-bounce" />

                  </div>

                )}

              </div>

            );

          })}

        </div>

        {/* Bottom Banner */}

        <div className="mt-24 rounded-[36px] bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-12 text-center text-white">

          <BrainCircuit className="mx-auto h-16 w-16 text-cyan-300" />

          <h2 className="mt-8 text-4xl font-bold">

            One Intelligent AI Ecosystem

          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">

            From recruitment verification to emergency recovery and
            career growth, every module of CareerGuardian AI works
            together as one intelligent platform designed to protect
            and empower every job seeker.

          </p>

        </div>

      </div>

    </section>
  );
}