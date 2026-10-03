"use client";

import {
  IndianRupee,
  TrendingUp,
  Briefcase,
} from "lucide-react";

interface Props {
  salary: {
    current: string;
    future: string;
  };
}

export default function SalaryGrowth({
  salary,
}: Props) {

  return (

    <section className="mt-8 rounded-3xl bg-white p-8 shadow-xl">

      <div className="flex items-center gap-4">

        <div className="rounded-2xl bg-green-100 p-4">

          <IndianRupee className="h-8 w-8 text-green-600" />

        </div>

        <div>

          <h2 className="text-3xl font-bold">

            AI Salary Growth Prediction

          </h2>

          <p className="text-slate-500">

            Predicted salary after completing the recommended roadmap.

          </p>

        </div>

      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">

        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-8 text-center">

          <h3 className="text-xl font-semibold text-slate-700">

            Current Expected Salary

          </h3>

          <h1 className="mt-5 text-5xl font-black text-blue-700">

            {salary.current}

          </h1>

          <Briefcase className="mx-auto mt-5 h-10 w-10 text-blue-600" />

        </div>

        <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center">

          <h3 className="text-xl font-semibold text-slate-700">

            After Completing Roadmap

          </h3>

          <h1 className="mt-5 text-5xl font-black text-green-700">

            {salary.future}

          </h1>

          <TrendingUp className="mx-auto mt-5 h-10 w-10 text-green-600" />

        </div>

      </div>

      <div className="mt-10 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white">

        <h2 className="text-2xl font-bold">

          Guardian AI Insight

        </h2>

        <p className="mt-4 text-lg leading-8">

          Your salary prediction is generated after comparing
          your profile with the verified recruitment and your
          current technical readiness. Completing the suggested
          roadmap can significantly improve your placement package.

        </p>

      </div>

    </section>

  );

}