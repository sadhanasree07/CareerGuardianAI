"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface Props {
  score: number;
}

export default function TrustMeter({
  score,
}: Props) {

  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {

    let value = 0;

    const timer = setInterval(() => {

      value += 2;

      if (value >= score) {

        value = score;

        clearInterval(timer);

      }

      setDisplayScore(value);

    }, 25);

    return () => clearInterval(timer);

  }, [score]);

  const safe = score >= 80;

  return (

    <section className="mt-8 rounded-3xl bg-white p-8 shadow-xl">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-bold">

            Guardian Trust Score

          </h2>

          <p className="mt-2 text-slate-500">

            AI Confidence Calculation

          </p>

        </div>

        {safe ? (

          <ShieldCheck className="h-12 w-12 text-green-600" />

        ) : (

          <AlertTriangle className="h-12 w-12 text-red-600" />

        )}

      </div>

      {/* AI Loading */}

      {displayScore < score && (

        <div className="mt-10 rounded-2xl bg-blue-50 p-6">

          <p className="text-lg font-semibold text-blue-700">

            Calculating Trust Score...

          </p>

          <div className="mt-5 h-4 overflow-hidden rounded-full bg-blue-100">

            <div
              className="h-full animate-pulse rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
              style={{
                width: `${displayScore}%`,
              }}
            />

          </div>

        </div>

      )}

      {/* Score */}

      <div className="mt-10 text-center">

        <h1
          className={`text-8xl font-black ${
            safe
              ? "text-green-600"
              : "text-red-600"
          }`}
        >

          {displayScore}

        </h1>

        <p className="mt-2 text-xl">

          /100

        </p>

      </div>

      {/* Progress */}

      <div className="mt-8 h-5 overflow-hidden rounded-full bg-slate-200">

        <div
          className={`h-full transition-all duration-500 ${
            safe
              ? "bg-green-500"
              : "bg-red-500"
          }`}
          style={{
            width: `${displayScore}%`,
          }}
        />

      </div>

      {/* Status */}

      <div
        className={`mt-10 rounded-3xl p-8 text-center ${
          safe
            ? "bg-green-50"
            : "bg-red-50"
        }`}
      >

        <h2
          className={`text-4xl font-black ${
            safe
              ? "text-green-700"
              : "text-red-700"
          }`}
        >

          {safe
            ? "SAFE RECRUITMENT"
            : "HIGH RISK"}

        </h2>

        <p className="mt-4 text-slate-600">

          {safe
            ? "Guardian AI successfully verified this recruitment."
            : "Guardian AI detected multiple scam indicators."}

        </p>

      </div>

    </section>

  );

}