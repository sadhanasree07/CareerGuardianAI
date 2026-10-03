"use client";

import {
  ShieldCheck,
  BrainCircuit,
  Sparkles,
} from "lucide-react";

interface Props {
  name?: string;
  guardianScore: number;
}

export default function DashboardHeader({
  name = "Student",
  guardianScore,
}: Props) {

  return (

    <section className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-10 text-white shadow-2xl">

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">

            <ShieldCheck className="h-5 w-5"/>

            <span className="font-semibold">

              Guardian Dashboard™

            </span>

          </div>

          <h1 className="mt-6 text-5xl font-black">

            Welcome, {name} 👋

          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-100">

            Your complete placement journey powered by Guardian AI.
            Track your verified recruitment, Career DNA,
            ATS Resume, Interview performance and overall placement readiness.

          </p>

        </div>

        <div className="rounded-3xl bg-white/15 p-8 text-center backdrop-blur">

          <BrainCircuit className="mx-auto h-12 w-12"/>

          <h2 className="mt-4 text-6xl font-black">

            {guardianScore}%

          </h2>

          <p className="mt-2">

            Guardian Score

          </p>

        </div>

      </div>

      <div className="mt-10 rounded-3xl bg-white/10 p-8">

        <div className="flex items-center gap-4">

          <Sparkles className="text-yellow-300"/>

          <div>

            <h3 className="text-2xl font-bold">

              Guardian AI Summary

            </h3>

            <p className="mt-2 text-blue-100 leading-8">

              Guardian AI has analyzed your complete placement profile.
              Continue improving your technical skills, interview confidence,
              and ATS Resume to maximize your hiring opportunities.

            </p>

          </div>

        </div>

      </div>

    </section>

  );

}