"use client";

import { useEffect, useState } from "react";

export default function CareerScore({
  score,
}: {
  score: number;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let value = 0;

    const timer = setInterval(() => {
      value++;

      setProgress(value);

      if (value >= score) {
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

        Career DNA Score

      </h2>

      <div className="flex justify-center">

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
            stroke="#2563eb"
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

        <div className="absolute mt-[75px] text-center">

          <h1 className="text-5xl font-bold text-blue-600">

            {progress}%

          </h1>

          <p className="mt-2 text-slate-500">

            AI Confidence

          </p>

        </div>

      </div>

    </div>
  );
}