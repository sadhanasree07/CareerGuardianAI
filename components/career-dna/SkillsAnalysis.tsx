"use client";

import {
  CheckCircle2,
  XCircle,
  Star,
  AlertTriangle,
} from "lucide-react";

interface Props {
  matchedSkills: string[];
  missingSkills: string[];
  strongAreas: string[];
  weakAreas: string[];
}

export default function SkillsAnalysis({
  matchedSkills,
  missingSkills,
  strongAreas,
  weakAreas,
}: Props) {

  return (

    <section className="grid gap-8 lg:grid-cols-2">

      {/* Matched Skills */}

      <div className="rounded-3xl bg-white p-8 shadow-xl">

        <div className="mb-6 flex items-center gap-3">

          <CheckCircle2 className="h-8 w-8 text-green-600" />

          <h2 className="text-2xl font-bold">

            Matched Skills

          </h2>

        </div>

        <div className="flex flex-wrap gap-3">

          {matchedSkills.length > 0 ? (

            matchedSkills.map((skill) => (

              <span
                key={skill}
                className="rounded-full bg-green-100 px-5 py-3 font-semibold text-green-700"
              >
                {skill}
              </span>

            ))

          ) : (

            <p className="text-slate-500">

              No matched skills found.

            </p>

          )}

        </div>

      </div>

      {/* Missing Skills */}

      <div className="rounded-3xl bg-white p-8 shadow-xl">

        <div className="mb-6 flex items-center gap-3">

          <XCircle className="h-8 w-8 text-red-600" />

          <h2 className="text-2xl font-bold">

            Missing Skills

          </h2>

        </div>

        <div className="flex flex-wrap gap-3">

          {missingSkills.length > 0 ? (

            missingSkills.map((skill) => (

              <span
                key={skill}
                className="rounded-full bg-red-100 px-5 py-3 font-semibold text-red-700"
              >
                {skill}
              </span>

            ))

          ) : (

            <p className="text-slate-500">

              No missing skills detected.

            </p>

          )}

        </div>

      </div>

      {/* Strong Areas */}

      <div className="rounded-3xl bg-white p-8 shadow-xl">

        <div className="mb-6 flex items-center gap-3">

          <Star className="h-8 w-8 text-yellow-500" />

          <h2 className="text-2xl font-bold">

            Strong Areas

          </h2>

        </div>

        <div className="space-y-4">

          {strongAreas.length > 0 ? (

            strongAreas.map((item) => (

              <div
                key={item}
                className="rounded-2xl bg-yellow-50 p-4"
              >
                {item}
              </div>

            ))

          ) : (

            <p className="text-slate-500">

              No strengths identified.

            </p>

          )}

        </div>

      </div>

      {/* Weak Areas */}

      <div className="rounded-3xl bg-white p-8 shadow-xl">

        <div className="mb-6 flex items-center gap-3">

          <AlertTriangle className="h-8 w-8 text-orange-500" />

          <h2 className="text-2xl font-bold">

            Weak Areas

          </h2>

        </div>

        <div className="space-y-4">

          {weakAreas.length > 0 ? (

            weakAreas.map((item) => (

              <div
                key={item}
                className="rounded-2xl bg-orange-50 p-4"
              >
                {item}
              </div>

            ))

          ) : (

            <p className="text-slate-500">

              No weak areas identified.

            </p>

          )}

        </div>

      </div>

    </section>

  );

}