"use client";

import {
  ShieldCheck,
  FileText,
  Brain,
  GraduationCap,
  Briefcase,
  Radar,
} from "lucide-react";

const modules = [
  {
    icon: ShieldCheck,
    title: "Recruitment Trust Engine",
    description:
      "Detect fake government jobs, internships and recruitment scams using our 12-layer AI verification system.",
    color: "from-blue-600 to-cyan-500",
  },
  {
    icon: Brain,
    title: "Career DNA",
    description:
      "Discover your strengths, career path, learning roadmap and AI-powered career recommendations.",
    color: "from-violet-600 to-indigo-500",
  },
  {
    icon: FileText,
    title: "Resume Intelligence",
    description:
      "Generate ATS-friendly resumes with AI optimization, keyword analysis and recruiter insights.",
    color: "from-emerald-600 to-green-500",
  },
  {
    icon: Briefcase,
    title: "Placement Predictor",
    description:
      "Estimate placement probability, salary range, recommended companies and preparation roadmap.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: GraduationCap,
    title: "AI Mentor",
    description:
      "24×7 career assistant for interview preparation, study planning and technical guidance.",
    color: "from-pink-600 to-rose-500",
  },
  {
    icon: Radar,
    title: "Opportunity Radar",
    description:
      "Explore internships, scholarships, hackathons, jobs and career opportunities from one dashboard.",
    color: "from-sky-600 to-blue-500",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-white py-24">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mx-auto max-w-3xl text-center">

          <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">

            AI Platform Modules

          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900">

            One Platform. Every Career Tool.

          </h2>

          <p className="mt-6 text-xl text-slate-600">

            CareerGuardian AI combines career guidance, recruitment
            verification, resume intelligence and placement preparation
            into one intelligent platform.

          </p>

        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {modules.map((module) => {

            const Icon = module.icon;

            return (

              <div
                key={module.title}
                className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl"
              >

                <div
                  className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${module.color} text-white`}
                >

                  <Icon className="h-8 w-8" />

                </div>

                <h3 className="text-2xl font-bold text-slate-900">

                  {module.title}

                </h3>

                <p className="mt-4 leading-8 text-slate-600">

                  {module.description}

                </p>

                <div className="mt-8 flex items-center justify-between">

                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">

                    Available

                  </span>

                  <span className="text-sm font-medium text-blue-600 group-hover:translate-x-1 transition">

                    Explore →

                  </span>

                </div>

              </div>

            );

          })}

        </div>

      </div>

    </section>
  );
}