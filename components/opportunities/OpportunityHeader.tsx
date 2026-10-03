"use client";

import { BriefcaseBusiness, Sparkles } from "lucide-react";

export default function OpportunityHeader() {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 p-10 text-white shadow-xl">

      <div className="flex items-center gap-5">

        <div className="rounded-2xl bg-white/20 p-4">

          <BriefcaseBusiness className="h-10 w-10"/>

        </div>

        <div>

          <h1 className="text-4xl font-bold">

            AI Opportunity Radar

          </h1>

          <p className="mt-2 text-lg text-blue-100">

            Discover the best internships and jobs matched to your Career DNA.

          </p>

        </div>

      </div>

      <div className="mt-8 rounded-2xl bg-white/10 p-6">

        <div className="flex items-center gap-3">

          <Sparkles className="h-6 w-6 text-yellow-300"/>

          <p>

            CareerGuardian AI analyzes your skills, projects,
            certifications and career interests to recommend
            internships and jobs with AI-powered matching.

          </p>

        </div>

      </div>

    </div>
  );
}