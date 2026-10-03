"use client";

import { useEffect, useState } from "react";
import {
  BrainCircuit,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

const steps = [
  "Reading verified recruitment...",
  "Understanding company requirements...",
  "Analyzing your profile...",
  "Matching your technical skills...",
  "Finding missing skills...",
  "Calculating job readiness...",
  "Generating personalized roadmap...",
  "Predicting salary growth...",
  "Preparing AI recommendation...",
];

export default function CareerLoading() {

  const [current, setCurrent] = useState(0);

  useEffect(() => {

    if (current >= steps.length - 1) return;

    const timer = setTimeout(() => {

      setCurrent((prev) => prev + 1);

    }, 800);

    return () => clearTimeout(timer);

  }, [current]);

  return (

    <section className="rounded-3xl bg-white p-8 shadow-xl">

      <div className="flex items-center gap-4">

        <div className="rounded-2xl bg-blue-100 p-4">

          <BrainCircuit className="h-10 w-10 text-blue-600" />

        </div>

        <div>

          <h2 className="text-3xl font-bold">

            Guardian AI is Building Your Career DNA

          </h2>

          <p className="text-slate-500">

            Please wait while Guardian AI compares your profile.

          </p>

        </div>

      </div>

      <div className="mt-10 space-y-4">

        {steps.map((step, index) => (

          <div
            key={step}
            className={`flex items-center gap-4 rounded-2xl border p-5 ${
              index < current
                ? "border-green-200 bg-green-50"
                : index === current
                ? "border-blue-200 bg-blue-50"
                : "border-slate-200"
            }`}
          >

            {index < current ? (

              <CheckCircle2 className="text-green-600" />

            ) : index === current ? (

              <LoaderCircle className="animate-spin text-blue-600" />

            ) : (

              <div className="h-5 w-5 rounded-full border-2 border-slate-300" />

            )}

            <span className="font-medium">

              {step}

            </span>

          </div>

        ))}

      </div>

      <div className="mt-8 h-3 overflow-hidden rounded-full bg-slate-200">

        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-700"
          style={{
            width: `${((current + 1) / steps.length) * 100}%`,
          }}
        />

      </div>

    </section>

  );

}