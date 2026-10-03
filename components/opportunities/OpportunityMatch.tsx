"use client";

import {
  Target,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function OpportunityMatch({
  match,
}: {
  match: any;
}) {
  if (!match) return null;

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl">

      <div className="flex items-center gap-3">

        <Target className="h-8 w-8 text-blue-600" />

        <div>

          <h2 className="text-3xl font-bold">

            AI Match Analysis

          </h2>

          <p className="text-slate-500">

            Why this opportunity matches you

          </p>

        </div>

      </div>

      {/* Match Score */}

      <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-center text-white">

        <p className="text-lg">

          Overall Match Score

        </p>

        <h1 className="mt-3 text-6xl font-bold">

          {match.score}%

        </h1>

      </div>

      {/* Strengths */}

      <div className="mt-10">

        <div className="mb-4 flex items-center gap-2">

          <CheckCircle2 className="h-6 w-6 text-green-600"/>

          <h3 className="text-2xl font-bold">

            Matching Strengths

          </h3>

        </div>

        <div className="space-y-3">

          {match.strengths.map(
            (item: string, index: number) => (

              <div
                key={index}
                className="rounded-xl bg-green-50 p-4"
              >

                ✅ {item}

              </div>

            )
          )}

        </div>

      </div>

      {/* Missing */}

      <div className="mt-10">

        <div className="mb-4 flex items-center gap-2">

          <AlertTriangle className="h-6 w-6 text-orange-500"/>

          <h3 className="text-2xl font-bold">

            Missing Skills

          </h3>

        </div>

        <div className="space-y-3">

          {match.missingSkills.map(
            (item: string, index: number) => (

              <div
                key={index}
                className="rounded-xl bg-orange-50 p-4"
              >

                ⚠ {item}

              </div>

            )
          )}

        </div>

      </div>

      {/* Recommendation */}

      <div className="mt-10 rounded-2xl bg-blue-50 p-6">

        <h3 className="text-xl font-bold">

          AI Recommendation

        </h3>

        <p className="mt-3 leading-8 text-slate-700">

          {match.recommendation}

        </p>

      </div>

    </div>
  );
}