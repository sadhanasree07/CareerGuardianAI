"use client";

import Link from "next/link";
import {
  BrainCircuit,
  FileText,
  GraduationCap,
  Briefcase,
  Bot,
  Radar,
  Building2,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";

const tools = [
  {
    icon: BrainCircuit,
    title: "Career DNA",
    description: "Discover your strengths, skills and ideal career path.",
  },
  {
    icon: FileText,
    title: "ATS Resume Builder",
    description: "Create professional resumes optimized for recruiters.",
  },
  {
    icon: GraduationCap,
    title: "Placement Predictor",
    description: "Estimate your placement readiness with AI.",
  },
  {
    icon: Briefcase,
    title: "Interview Simulator",
    description: "Practice interviews with AI-generated questions.",
  },
  {
    icon: Bot,
    title: "AI Career Mentor",
    description: "Receive personalized career guidance anytime.",
  },
  {
    icon: Radar,
    title: "Opportunity Radar",
    description: "Discover verified internships and job opportunities.",
  },
  {
  icon: Building2,
  title: "College Dashboard",
  description:
    "Monitor recruiters, verification activity and recruitment risks.",
  href: "/college-dashboard",
},
];

export default function GrowSection() {
  return (
    <section className="bg-white py-24">

      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}

        <div className="text-center">

          <span className="rounded-full bg-emerald-100 px-5 py-2 text-sm font-semibold text-emerald-700">

            BUILD YOUR CAREER

          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900">

            AI Career Intelligence

          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">

            After verifying opportunities, CareerGuardian AI helps you
            prepare for placements, improve your resume and achieve your
            career goals with personalized AI assistance.

          </p>

        </div>

        {/* Main Layout */}

        <div className="mt-20 grid gap-14 lg:grid-cols-2">

          {/* Left */}

          <div className="grid gap-5 sm:grid-cols-2">

            {tools.map((tool) => {

              const Icon = tool.icon;

              return (

                <Link
  key={tool.title}
  href={tool.href || "#"}
  className="rounded-3xl border border-slate-200 bg-white p-6 shadow transition hover:-translate-y-2 hover:shadow-xl"
>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">

                    <Icon className="h-7 w-7 text-emerald-600" />

                  </div>

                  <h3 className="mt-5 text-xl font-bold">

                    {tool.title}

                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">

                    {tool.description}

                  </p>

                </Link>

              );

            })}

          </div>

          {/* Right */}

          <div>

            <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-emerald-600 to-green-500 p-8 text-white shadow-2xl">

              <h3 className="text-3xl font-bold">

                AI Career Dashboard

              </h3>

              <p className="mt-3 text-emerald-100">

                Example Student Profile

              </p>

              <div className="mt-8 space-y-5">

                <Progress
                  title="Resume Strength"
                  value="92%"
                />

                <Progress
                  title="Placement Readiness"
                  value="81%"
                />

                <Progress
                  title="Interview Skills"
                  value="76%"
                />

                <Progress
                  title="Technical Skills"
                  value="88%"
                />

              </div>

              <div className="mt-10 rounded-2xl bg-white/10 p-5">

                <div className="flex items-center gap-3">

                  <CheckCircle2 className="h-6 w-6" />

                  <span className="font-semibold">

                    AI Recommendation

                  </span>

                </div>

                <p className="mt-3 leading-7 text-emerald-100">

                  Improve communication skills and complete one more
                  technical project to significantly increase placement
                  opportunities.

                </p>

              </div>

              <div className="mt-10 flex flex-wrap gap-4">

                <Link href="/career-dna">

                  <button className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 font-semibold text-emerald-700">

                    Explore Career AI

                    <ArrowRight className="h-5 w-5" />

                  </button>

                </Link>

                <button className="flex items-center gap-3 rounded-2xl border border-white/30 px-6 py-4 font-semibold">

                  <PlayCircle className="h-5 w-5" />

                  Watch Demo

                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

function Progress({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-5">

      <div className="flex items-center justify-between">

        <span>{title}</span>

        <span className="font-bold">

          {value}

        </span>

      </div>

      <div className="mt-3 h-2 rounded-full bg-white/20">

        <div
          className="h-2 rounded-full bg-white"
          style={{ width: value }}
        />

      </div>

    </div>
  );
}