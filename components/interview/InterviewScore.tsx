"use client";

import { useEffect, useState } from "react";

export default function InterviewScore({
  score,
}: {
  score: number;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;

    const timer = setInterval(() => {
      current++;

      setProgress(current);

      if (current >= score) {
        clearInterval(timer);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [score]);

  const radius = 90;

  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference -
    (progress / 100) * circumference;

  return (
    <div className="rounded-3xl bg-white p-8 shadow">

      <h2 className="mb-8 text-center text-3xl font-bold">

        Interview Performance

      </h2>

      <div className="relative flex justify-center">

        <svg
          width="230"
          height="230"
          className="-rotate-90"
        >

          <circle
            cx="115"
            cy="115"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth="16"
            fill="none"
          />

          <circle
            cx="115"
            cy="115"
            r={radius}
            stroke="#7c3aed"
            strokeWidth="16"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition:
                "stroke-dashoffset .4s ease",
            }}
          />

        </svg>

        <div className="absolute top-[70px] text-center">

          <h1 className="text-5xl font-bold text-violet-600">

            {progress}%

          </h1>

          <p className="mt-2 text-slate-500">

            AI Score

          </p>

        </div>

      </div>

      <div className="mt-8 rounded-2xl bg-violet-50 p-6 text-center">

        <p className="text-lg text-slate-600">

          Overall Interview Readiness

        </p>

        <h3 className="mt-2 text-2xl font-bold text-violet-700">

          {score >= 90
            ? "Excellent"
            : score >= 75
            ? "Very Good"
            : score >= 60
            ? "Good"
            : "Needs Improvement"}

        </h3>

      </div>

    </div>
  );
}