"use client";

import { Bot, Sparkles } from "lucide-react";

export default function MentorHeader() {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 p-10 text-white shadow-xl">

      <div className="flex items-center gap-4">

        <div className="rounded-2xl bg-white/20 p-4">

          <Bot className="h-10 w-10" />

        </div>

        <div>

          <h1 className="text-4xl font-bold">
            AI Career Mentor
          </h1>

          <p className="mt-2 text-blue-100 text-lg">
            Your personal AI career coach powered by CareerGuardian AI.
          </p>

        </div>

      </div>

      <div className="mt-8 rounded-2xl bg-white/10 p-6">

        <div className="flex items-center gap-3">

          <Sparkles className="h-6 w-6 text-yellow-300" />

          <p className="text-lg">
            Ask anything about careers, internships, placements,
            resume improvement, interview preparation,
            embedded systems, VLSI, IoT, software engineering and more.
          </p>

        </div>

      </div>

    </div>
  );
}