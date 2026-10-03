"use client";

import { TrendingUp, Sparkles } from "lucide-react";

export default function PlacementHeader() {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-blue-600 to-cyan-600 p-10 text-white shadow-xl">

      <div className="flex items-center gap-5">

        <div className="rounded-2xl bg-white/20 p-4">

          <TrendingUp className="h-10 w-10" />

        </div>

        <div>

          <h1 className="text-4xl font-bold">
            AI Placement Predictor
          </h1>

          <p className="mt-2 text-lg text-emerald-100">
            Predict your placement readiness using AI.
          </p>

        </div>

      </div>

      <div className="mt-8 rounded-2xl bg-white/10 p-6">

        <div className="flex items-center gap-3">

          <Sparkles className="h-6 w-6 text-yellow-300"/>

          <p>

            CareerGuardian AI analyzes your CGPA, projects,
            internships, certifications, technical skills,
            aptitude level and interview preparation to predict
            your placement chances and recommend improvements.

          </p>

        </div>

      </div>

    </div>
  );
}