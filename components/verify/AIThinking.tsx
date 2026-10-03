"use client";

import { BrainCircuit, Sparkles } from "lucide-react";

const thinkingSteps = [
  "Initializing Guardian Verify™ Engine...",
  "Loading AI Recruitment Model...",
  "Preparing OCR Document Extraction...",
  "Connecting 12 Verification Layers...",
];

export default function AIThinking() {
  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white shadow-xl">

      <div className="p-8">

        <div className="flex items-center gap-4">

          <div className="rounded-2xl bg-white/20 p-4">

            <BrainCircuit className="h-10 w-10 animate-pulse" />

          </div>

          <div>

            <h2 className="text-3xl font-bold">

              Guardian Verify™ AI

            </h2>

            <p className="text-blue-100">

              Intelligent Recruitment Analysis

            </p>

          </div>

        </div>

        <div className="mt-10 space-y-5">

          {thinkingSteps.map((step, index) => (

            <div
              key={step}
              className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur"
            >

              <Sparkles
                className="h-5 w-5 animate-pulse text-yellow-300"
                style={{
                  animationDelay: `${index * 0.4}s`,
                }}
              />

              <span className="text-lg">

                {step}

              </span>

            </div>

          ))}

        </div>

        {/* Progress */}

        <div className="mt-10">

          <div className="mb-3 flex justify-between text-sm">

            <span>

              AI Preparing...

            </span>

            <span>

              Please Wait

            </span>

          </div>

          <div className="h-3 overflow-hidden rounded-full bg-white/20">

            <div className="h-full w-2/3 animate-pulse rounded-full bg-white" />

          </div>

        </div>

      </div>

    </section>
  );
}