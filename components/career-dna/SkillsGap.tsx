"use client";

import {
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";

interface Props {
  matched: string[];
  missing: string[];
}

export default function SkillsGap({
  matched,
  missing,
}: Props) {

  return (

    <section className="mt-8 rounded-3xl bg-white p-8 shadow-xl">

      <div className="flex items-center gap-4">

        <div className="rounded-2xl bg-blue-100 p-4">

          <Sparkles className="h-8 w-8 text-blue-600" />

        </div>

        <div>

          <h2 className="text-3xl font-bold">

            AI Skills Gap Analysis

          </h2>

          <p className="text-slate-500">

            Compared with the verified recruitment.

          </p>

        </div>

      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">

        {/* Matched */}

        <div className="rounded-3xl border border-green-200 bg-green-50 p-6">

          <h3 className="mb-6 text-2xl font-bold text-green-700">

            Skills You Already Have

          </h3>

          <div className="space-y-4">

            {matched.length > 0 ? (

              matched.map((skill) => (

                <div
                  key={skill}
                  className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm"
                >

                  <CheckCircle2 className="h-6 w-6 text-green-600" />

                  <span className="font-medium">

                    {skill}

                  </span>

                </div>

              ))

            ) : (

              <p>No matched skills.</p>

            )}

          </div>

        </div>

        {/* Missing */}

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">

          <h3 className="mb-6 text-2xl font-bold text-red-700">

            Skills To Learn

          </h3>

          <div className="space-y-4">

            {missing.length > 0 ? (

              missing.map((skill) => (

                <div
                  key={skill}
                  className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm"
                >

                  <XCircle className="h-6 w-6 text-red-600" />

                  <span className="font-medium">

                    {skill}

                  </span>

                </div>

              ))

            ) : (

              <p>No missing skills 🎉</p>

            )}

          </div>

        </div>

      </div>

      {/* Summary */}

      <div className="mt-8 grid gap-6 md:grid-cols-2">

        <div className="rounded-2xl bg-green-100 p-6 text-center">

          <h2 className="text-5xl font-black text-green-700">

            {matched.length}

          </h2>

          <p className="mt-2 font-semibold">

            Skills Matched

          </p>

        </div>

        <div className="rounded-2xl bg-red-100 p-6 text-center">

          <h2 className="text-5xl font-black text-red-700">

            {missing.length}

          </h2>

          <p className="mt-2 font-semibold">

            Skills Missing

          </p>

        </div>

      </div>

    </section>

  );

}