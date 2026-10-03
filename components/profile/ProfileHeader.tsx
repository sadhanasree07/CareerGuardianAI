"use client";

import { UserCircle2, Sparkles } from "lucide-react";

export default function ProfileHeader() {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 p-10 text-white shadow-xl">

      <div className="flex items-center gap-5">

        <div className="rounded-2xl bg-white/20 p-4">

          <UserCircle2 className="h-10 w-10" />

        </div>

        <div>

          <h1 className="text-4xl font-bold">
            My Profile
          </h1>

          <p className="mt-2 text-lg text-blue-100">
            Manage your CareerGuardian AI account and career profile.
          </p>

        </div>

      </div>

      <div className="mt-8 rounded-2xl bg-white/10 p-6">

        <div className="flex items-center gap-3">

          <Sparkles className="h-6 w-6 text-yellow-300" />

          <p>
            Your profile powers Career DNA, Resume Builder,
            Placement Predictor, AI Mentor, Interview Simulator
            and Opportunity Radar.
          </p>

        </div>

      </div>

    </div>
  );
}