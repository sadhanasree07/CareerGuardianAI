"use client";

import {
  Briefcase,
  CheckCircle2,
  TrendingUp,
  Target,
} from "lucide-react";

interface Props {
  readiness: number;
}

export default function JobReadiness({
  readiness,
}: Props) {

  const color =
    readiness >= 80
      ? "text-green-600"
      : readiness >= 60
      ? "text-yellow-500"
      : "text-red-600";

  const bg =
    readiness >= 80
      ? "bg-green-100"
      : readiness >= 60
      ? "bg-yellow-100"
      : "bg-red-100";

  return (

    <section className="rounded-3xl bg-white p-8 shadow-xl">

      <div className="flex items-center gap-4">

        <div className={`rounded-2xl ${bg} p-4`}>

          <Briefcase className={`h-8 w-8 ${color}`} />

        </div>

        <div>

          <h2 className="text-3xl font-bold">

            Job Readiness

          </h2>

          <p className="text-slate-500">

            Guardian AI compared your profile with the verified recruitment.

          </p>

        </div>

      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">

        <div className="flex justify-center">

          <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-[14px] border-blue-100">

            <div className="text-center">

              <h1 className={`text-7xl font-black ${color}`}>

                {readiness}%

              </h1>

              <p className="mt-3 text-slate-500">

                Ready

              </p>

            </div>

          </div>

        </div>

        <div className="space-y-5">

          <div className="rounded-2xl bg-blue-50 p-5">

            <div className="flex items-center gap-3">

              <Target className="text-blue-600" />

              <h3 className="font-bold">

                AI Analysis

              </h3>

            </div>

            <p className="mt-3 text-slate-700">

              Guardian AI analyzed your current profile,
              compared it with the verified recruitment,
              and calculated your readiness.

            </p>

          </div>

          <div className="rounded-2xl bg-green-50 p-5">

            <div className="flex items-center gap-3">

              <CheckCircle2 className="text-green-600" />

              <h3 className="font-bold">

                Strong Match

              </h3>

            </div>

            <p className="mt-3 text-slate-700">

              You already satisfy most of the required
              recruitment skills.

            </p>

          </div>

          <div className="rounded-2xl bg-yellow-50 p-5">

            <div className="flex items-center gap-3">

              <TrendingUp className="text-yellow-600" />

              <h3 className="font-bold">

                Improvement Needed

              </h3>

            </div>

            <p className="mt-3 text-slate-700">

              Completing the recommended roadmap can
              increase your readiness above 90%.

            </p>

          </div>

        </div>

      </div>

    </section>

  );

}