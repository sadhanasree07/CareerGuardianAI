"use client";

import {
  Target,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function ImprovementPlan({
  result,
}: {
  result: any;
}) {
  if (!result) return null;

  const plan = result.improvementPlan || [
    "Improve Data Structures & Algorithms",
    "Complete one advanced technical project",
    "Practice aptitude daily",
    "Improve communication skills",
    "Complete two industry certifications",
  ];

  return (
    <div className="rounded-3xl bg-white p-8 shadow">

      <div className="flex items-center gap-3">

        <Target className="h-8 w-8 text-emerald-600" />

        <div>

          <h2 className="text-3xl font-bold">

            AI Improvement Plan

          </h2>

          <p className="text-slate-500">

            Increase your placement probability

          </p>

        </div>

      </div>

      <div className="mt-10 space-y-6">

        {plan.map((step: string, index: number) => (

          <div
            key={index}
            className="flex items-start gap-5"
          >

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">

              {index + 1}

            </div>

            <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <div className="flex items-center gap-3">

                <CheckCircle2 className="h-5 w-5 text-emerald-600" />

                <h3 className="font-semibold">

                  {step}

                </h3>

              </div>

            </div>

          </div>

        ))}

      </div>

      <div className="mt-10 rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-600 p-6 text-white">

        <div className="flex items-center justify-between">

          <div>

            <h3 className="text-2xl font-bold">

              Estimated Improvement

            </h3>

            <p className="mt-2 text-emerald-100">

              Follow this roadmap consistently for 3–6 months.

            </p>

          </div>

          <div className="flex items-center gap-2 text-3xl font-bold">

            +20%

            <ArrowRight className="h-8 w-8" />

          </div>

        </div>

      </div>

    </div>
  );
}