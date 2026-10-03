"use client";

import { Brain, Sparkles } from "lucide-react";

export default function InterviewHeader() {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 p-10 text-white shadow-xl">

      <div className="flex items-center gap-5">

        <div className="rounded-2xl bg-white/20 p-4">

          <Brain className="h-10 w-10" />

        </div>

        <div>

          <h1 className="text-4xl font-bold">
            AI Interview Simulator
          </h1>

          <p className="mt-2 text-lg text-blue-100">
            Practice technical and HR interviews with CareerGuardian AI.
          </p>

        </div>

      </div>

      <div className="mt-8 rounded-2xl bg-white/10 p-6">

        <div className="flex items-center gap-3">

          <Sparkles className="h-6 w-6 text-yellow-300" />

          <p>

            Select your role, answer AI-generated interview questions,
            receive instant feedback, improvement suggestions, and an
            overall interview score.

          </p>

        </div>

      </div>

    </div>
  );
}