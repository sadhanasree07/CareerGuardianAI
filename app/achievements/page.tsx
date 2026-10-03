"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Trophy,
  Lock,
  ArrowLeft,
  ShieldCheck,
  FileText,
  Mic,
  Flame,
  Rocket,
  CheckCircle2,
  Target,
  Sparkles,
} from "lucide-react";

const allBadges = [
  {
    id: "CAREER_GUARDIAN",
    title: "Career Guardian",
    description:
      "Complete your first recruitment verification.",
    icon: ShieldCheck,
    requirement: "Complete 1 verification",
    category: "Verification",
  },
  {
    id: "RESUME_READY",
    title: "Resume Ready",
    description:
      "Improve your resume using CareerGuardian.",
    icon: FileText,
    requirement: "Complete resume analysis",
    category: "Resume",
  },
  {
    id: "INTERVIEW_STARTER",
    title: "Interview Starter",
    description:
      "Complete your first practice interview.",
    icon: Mic,
    requirement: "Complete 1 interview",
    category: "Interview",
  },
  {
    id: "INTERVIEW_WARRIOR",
    title: "Interview Warrior",
    description:
      "Build consistency through interview practice.",
    icon: Flame,
    requirement: "Complete 5 interviews",
    category: "Interview",
  },
  {
    id: "CAREER_CLIMBER",
    title: "Career Climber",
    description:
      "Actively improve across multiple career activities.",
    icon: Rocket,
    requirement: "Complete all core activities",
    category: "Career Growth",
  },
  {
    id: "CAREER_DNA_BUILDER",
    title: "Career DNA Builder",
    description: "Complete your Career DNA analysis.",
    icon: Target,
    requirement: "Generate Career DNA",
    category: "Career Growth",
  },
  {
    id: "CAREER_READY",
    title: "Career Ready",
    description: "Reach an 80% Career DNA readiness score.",
    icon: CheckCircle2,
    requirement: "Reach 80% readiness",
    category: "Career Growth",
  },
];

export default function AchievementsPage() {
  const [user, setUser] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAchievements() {
      try {
        const response = await fetch("/api/achievements", { cache: "no-store", credentials: "same-origin" });

        const data =
          await response.json();

        if (!data.success) {
          setError(
            data.message ||
            "Unable to load achievements."
          );

          return;
        }

        setUser(data.user);

      } catch (error) {
        console.error(
          "Achievements Error:",
          error
        );

        setError(
          "Unable to load your achievements."
        );

      } finally {
        setLoading(false);
      }
    }

    loadAchievements();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-center">

          <Trophy className="mx-auto h-12 w-12 animate-bounce text-yellow-500" />

          <p className="mt-4 font-semibold text-slate-600">
            Loading your achievements...
          </p>

        </div>

      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">

        <Lock className="h-12 w-12 text-slate-400" />

        <h1 className="mt-4 text-2xl font-black text-slate-900">
          Achievements Unavailable
        </h1>

        <p className="mt-3 text-slate-600">
          {error}
        </p>

        <Link
          href="/login"
          className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white"
        >
          Go to Login
        </Link>

      </main>
    );
  }

  const badges = user.badges || [];

  const unlockedCount =
    allBadges.filter((badge) =>
      badges.includes(badge.id)
    ).length;

  const progressPercentage =
    Math.round(
      (unlockedCount /
        allBadges.length) *
        100
    );

  return (
    <main className="min-h-screen bg-slate-50">

      <section className="mx-auto max-w-6xl px-6 py-10">

        {/* BACK */}

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Dashboard

        </Link>

        {/* HERO */}

        <div className="mt-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-700 p-8 text-white shadow-xl md:p-12">

          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-center">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold">

                <Sparkles className="h-4 w-4" />

                CAREER PROGRESS

              </div>

              <h1 className="mt-6 text-4xl font-black md:text-5xl">

                Keep Growing,
                <br />

                {user.name} 🚀

              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-blue-100">

                Every verification, resume improvement
                and interview practice brings you one
                step closer to your career goals.

              </p>

            </div>

            {/* PROGRESS */}

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">

              <p className="text-sm font-bold text-blue-100">

                YOUR PROGRESS

              </p>

              <div className="mt-3 flex items-end gap-2">

                <span className="text-5xl font-black">

                  {unlockedCount}

                </span>

                <span className="mb-1 text-lg text-blue-200">

                  / {allBadges.length}

                </span>

              </div>

              <p className="mt-2 text-sm text-blue-100">

                Badges Unlocked

              </p>

              <div className="mt-5 h-3 w-52 overflow-hidden rounded-full bg-white/20">

                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                />

              </div>

              <p className="mt-2 text-right text-xs text-blue-100">

                {progressPercentage}% Complete

              </p>

            </div>

          </div>

        </div>

        {/* REAL ACTIVITY STATS */}

        <div className="mt-8 grid gap-5 md:grid-cols-3">

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <ShieldCheck className="h-8 w-8 text-blue-600" />

            <p className="mt-4 text-3xl font-black text-slate-900">

              {user.verificationCount || 0}

            </p>

            <p className="mt-1 font-semibold text-slate-500">

              Recruitments Verified

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <FileText className="h-8 w-8 text-purple-600" />

            <p className="mt-4 text-3xl font-black text-slate-900">

              {user.resumeCount || 0}

            </p>

            <p className="mt-1 font-semibold text-slate-500">

              Resumes Improved

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <Mic className="h-8 w-8 text-orange-500" />

            <p className="mt-4 text-3xl font-black text-slate-900">

              {user.interviewCount || 0}

            </p>

            <p className="mt-1 font-semibold text-slate-500">

              Interviews Practiced

            </p>

          </div>

        </div>

        {/* BADGES */}

        <div className="mt-14">

          <div className="flex items-center gap-3">

            <Trophy className="h-7 w-7 text-yellow-500" />

            <div>

              <h2 className="text-3xl font-black text-slate-900">

                Your Badge Collection

              </h2>

              <p className="mt-1 text-slate-500">

                Unlock achievements by improving your
                career readiness.

              </p>

            </div>

          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {allBadges.map((badge) => {

              const unlocked =
                badges.includes(badge.id);

              const Icon = badge.icon;

              return (

                <div
                  key={badge.id}
                  className={`relative overflow-hidden rounded-3xl border p-7 transition ${
                    unlocked
                      ? "border-yellow-200 bg-white shadow-lg hover:-translate-y-1"
                      : "border-slate-200 bg-slate-100"
                  }`}
                >

                  {unlocked && (

                    <div className="absolute right-5 top-5">

                      <CheckCircle2 className="h-6 w-6 text-green-500" />

                    </div>

                  )}

                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                      unlocked
                        ? "bg-yellow-100"
                        : "bg-slate-200"
                    }`}
                  >

                    {unlocked ? (

                      <Icon className="h-8 w-8 text-yellow-600" />

                    ) : (

                      <Lock className="h-7 w-7 text-slate-400" />

                    )}

                  </div>

                  <h3
                    className={`mt-6 text-xl font-black ${
                      unlocked
                        ? "text-slate-900"
                        : "text-slate-500"
                    }`}
                  >

                    {badge.title}

                  </h3>

                  <p className="mt-3 leading-7 text-slate-500">

                    {badge.description}

                  </p>

                  <div className="mt-6 border-t pt-4">

                    <p className="text-sm font-semibold text-slate-400">

                      🎯 {badge.requirement}

                    </p>

                    <p
                      className={`mt-2 text-sm font-bold ${
                        unlocked
                          ? "text-green-600"
                          : "text-slate-500"
                      }`}
                    >

                      {unlocked
                        ? "✓ Achievement Earned"
                        : "🔒 Keep Going to Unlock"}

                    </p>

                  </div>

                </div>

              );

            })}

          </div>

        </div>

        {/* NEXT GOAL */}

        <div className="mt-12 rounded-3xl border border-blue-100 bg-blue-50 p-8">

          <div className="flex gap-5">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">

              <Target className="h-6 w-6" />

            </div>

            <div>

              <h2 className="text-xl font-black text-slate-900">

                Your Next Career Goal

              </h2>

              <p className="mt-2 text-slate-600">

                {unlockedCount === allBadges.length
                  ? "Amazing! You have unlocked every achievement. Keep building your career journey!"
                  : "Complete your next CareerGuardian activity to unlock another achievement."}

              </p>

            </div>

          </div>

        </div>

      </section>
    </main>
  );
}