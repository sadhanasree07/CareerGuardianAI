"use client";

import {
  FileCheck,
  Mic,
  ShieldCheck,
  Trophy,
  Lock,
  Flame,
} from "lucide-react";

const BADGES = [
  {
    id: "RESUME_READY",
    name: "Resume Ready",
    description: "Improved your resume",
    icon: FileCheck,
  },
  {
    id: "INTERVIEW_STARTER",
    name: "Interview Starter",
    description: "Completed your first interview",
    icon: Mic,
  },
  {
    id: "INTERVIEW_WARRIOR",
    name: "Interview Warrior",
    description: "Completed 5 interviews",
    icon: Flame,
  },
  {
    id: "CAREER_GUARDIAN",
    name: "Career Guardian",
    description: "Verified a recruitment opportunity",
    icon: ShieldCheck,
  },
  {
    id: "CAREER_CLIMBER",
    name: "Career Climber",
    description: "Completed 10 career activities",
    icon: Trophy,
  },
];

export default function SkillBadges({
  badges,
}: {
  badges: string[];
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-slate-900">
        Your Skill Badges
      </h2>

      <p className="mt-2 text-slate-500">
        Complete activities and unlock achievements.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BADGES.map((badge) => {
          const unlocked =
            badges.includes(badge.id);

          const Icon =
            unlocked
              ? badge.icon
              : Lock;

          return (
            <div
              key={badge.id}
              className={`rounded-2xl border p-5 ${
                unlocked
                  ? "border-green-200 bg-green-50"
                  : "border-slate-200 bg-slate-50 opacity-60"
              }`}
            >
              <Icon
                className={`h-9 w-9 ${
                  unlocked
                    ? "text-green-600"
                    : "text-slate-400"
                }`}
              />

              <h3 className="mt-4 font-bold text-slate-900">
                {badge.name}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {badge.description}
              </p>

              <p
                className={`mt-3 text-xs font-bold ${
                  unlocked
                    ? "text-green-600"
                    : "text-slate-400"
                }`}
              >
                {unlocked
                  ? "UNLOCKED ✓"
                  : "LOCKED"}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}