"use client";

import {
  CalendarDays,
  CheckCircle2,
  Rocket,
} from "lucide-react";

interface RoadmapStep {
  week: string;
  task: string;
}

interface Props {
  roadmap: RoadmapStep[];
}

export default function Roadmap({
  roadmap,
}: Props) {

  return (

    <section className="mt-8 rounded-3xl bg-white p-8 shadow-xl">

      <div className="flex items-center gap-4">

        <div className="rounded-2xl bg-blue-100 p-4">

          <CalendarDays className="h-8 w-8 text-blue-600" />

        </div>

        <div>

          <h2 className="text-3xl font-bold">

            AI Career Roadmap

          </h2>

          <p className="text-slate-500">

            Personalized roadmap generated for this recruitment.

          </p>

        </div>

      </div>

      <div className="mt-12">

        {roadmap.map((step, index) => (

          <div
            key={index}
            className="relative flex gap-6 pb-10"
          >

            {index !== roadmap.length - 1 && (

              <div className="absolute left-5 top-12 h-full w-1 bg-blue-200" />

            )}

            <div
              className={`z-10 flex h-10 w-10 items-center justify-center rounded-full ${
                index === roadmap.length - 1
                  ? "bg-green-600"
                  : "bg-blue-600"
              }`}
            >

              {index === roadmap.length - 1 ? (

                <Rocket className="h-5 w-5 text-white" />

              ) : (

                <CheckCircle2 className="h-5 w-5 text-white" />

              )}

            </div>

            <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <p className="text-sm font-semibold uppercase text-blue-600">

                {step.week}

              </p>

              <h3 className="mt-2 text-xl font-bold">

                {step.task}

              </h3>

            </div>

          </div>

        ))}

      </div>

      <div className="rounded-3xl bg-gradient-to-r from-green-50 to-emerald-50 p-8">

        <h2 className="text-2xl font-bold text-green-700">

          🎯 Guardian AI Goal

        </h2>

        <p className="mt-4 text-lg leading-8 text-slate-700">

          Complete this personalized roadmap to improve your
          readiness score and maximize your chances of getting
          selected for this verified recruitment.

        </p>

      </div>

    </section>

  );

}