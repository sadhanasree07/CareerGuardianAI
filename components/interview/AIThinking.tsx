"use client";

import { useEffect, useState } from "react";
import { BrainCircuit } from "lucide-react";

const steps = [
  "Analyzing your answer...",
  "Checking technical correctness...",
  "Evaluating communication...",
  "Measuring confidence...",
  "Calculating problem solving...",
  "Generating AI feedback...",
];

export default function AIThinking() {

  const [step, setStep] = useState(0);

  useEffect(() => {

    if (step >= steps.length - 1) return;

    const timer = setTimeout(() => {

      setStep((prev) => prev + 1);

    }, 700);

    return () => clearTimeout(timer);

  }, [step]);

  return (

    <div className="rounded-3xl bg-white p-8 shadow-xl">

      <div className="flex items-center gap-4">

        <div className="rounded-full bg-blue-100 p-5">

          <BrainCircuit className="h-10 w-10 animate-pulse text-blue-600"/>

        </div>

        <div>

          <h2 className="text-3xl font-bold">

            Guardian AI

          </h2>

          <p className="text-slate-500">

            Evaluating your interview...

          </p>

        </div>

      </div>

      <div className="mt-10 space-y-4">

        {steps.map((item,index)=>(

          <div
            key={item}
            className={`rounded-2xl border p-5 transition-all duration-500 ${
              index<=step
                ? "border-blue-200 bg-blue-50"
                : "border-slate-200"
            }`}
          >

            <div className="flex items-center gap-4">

              {index<=step ? (

                <div className="h-4 w-4 animate-pulse rounded-full bg-blue-600"/>

              ):(
                <div className="h-4 w-4 rounded-full border"/>
              )}

              <span className="font-medium">

                {item}

              </span>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}