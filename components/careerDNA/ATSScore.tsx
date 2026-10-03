"use client";

import { FileCheck } from "lucide-react";

export default function ATSScore() {

  const score = 91;

  return (
    <div className="rounded-3xl bg-white p-8 shadow">

      <div className="flex items-center gap-3">

        <FileCheck className="h-8 w-8 text-green-600"/>

        <h2 className="text-2xl font-bold">
          ATS Resume Score
        </h2>

      </div>

      <div className="mt-8">

        <div className="mb-4 flex justify-between">

          <span>Resume Compatibility</span>

          <span className="font-bold text-green-600">
            {score}%
          </span>

        </div>

        <div className="h-4 rounded-full bg-slate-200">

          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
            style={{
              width: `${score}%`,
            }}
          />

        </div>

      </div>

      <p className="mt-6 text-slate-600">

        Excellent ATS compatibility. Your resume is highly searchable by recruiters.

      </p>

    </div>
  );
}