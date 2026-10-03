"use client";

import { Brain, Sparkles, Target } from "lucide-react";

export default function CareerHeader() {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 p-10 text-white shadow-xl">

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

        <div className="max-w-3xl">

          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur">

            <Brain className="h-5 w-5" />

            CareerGuardian AI • Career DNA

          </div>

          <h1 className="mt-6 text-5xl font-extrabold">

            Discover Your Career DNA

          </h1>

          <p className="mt-5 text-lg leading-8 text-blue-100">

            Upload your resume and let CareerGuardian AI identify
            your strengths, skill gaps, career opportunities,
            personalized roadmap and recommended certifications.

          </p>

        </div>

        <div className="grid grid-cols-2 gap-4">

          <FeatureCard
            icon={<Sparkles className="h-7 w-7" />}
            title="AI Resume Analysis"
          />

          <FeatureCard
            icon={<Target className="h-7 w-7" />}
            title="Career Match"
          />

          <FeatureCard
            icon={<Brain className="h-7 w-7" />}
            title="Skill Gap"
          />

          <FeatureCard
            icon={<Sparkles className="h-7 w-7" />}
            title="AI Roadmap"
          />

        </div>

      </div>

    </div>
  );
}

function FeatureCard({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

      <div className="mb-3">
        {icon}
      </div>

      <h3 className="font-semibold">
        {title}
      </h3>

    </div>
  );
}