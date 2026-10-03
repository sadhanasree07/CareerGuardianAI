"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  ShieldCheck,
  Search,
  FileText,
  CheckCircle2,
} from "lucide-react";

interface Props {
  report: any;
  onComplete: () => void;
}

const steps = [
  {
    icon: Search,
    title: "Analyzing scam details...",
  },
  {
    icon: ShieldCheck,
    title: "Verifying recruiter information...",
  },
  {
    icon: Brain,
    title: "Generating AI recovery plan...",
  },
  {
    icon: FileText,
    title: "Preparing complaint document...",
  },
  {
    icon: CheckCircle2,
    title: "Recovery report completed.",
  },
];

export default function AIThinking({
  report,
  onComplete,
}: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= steps.length) {
      const timer = setTimeout(() => {
        onComplete();
      }, 800);

      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCurrent((prev) => prev + 1);
    }, 1800);

    return () => clearTimeout(timer);
  }, [current, onComplete]);

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-xl">

      {/* Hero */}

      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 px-8 py-14 text-white">

        <div className="mx-auto max-w-4xl text-center">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/20">

            <Brain className="h-12 w-12 animate-pulse" />

          </div>

          <h1 className="mt-8 text-5xl font-bold">

            CareerGuardian AI

          </h1>

          <p className="mt-5 text-lg text-blue-100">

            Please wait while we analyze your
            recruitment case.

          </p>

        </div>

      </div>

      {/* Progress */}

      <div className="p-10">

        <div className="mb-10 h-4 overflow-hidden rounded-full bg-slate-200">

          <div
            className="h-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-700"
            style={{
              width: `${
                Math.min(current, steps.length) /
                steps.length *
                100
              }%`,
            }}
          />

        </div>

        <div className="space-y-6">

          {steps.map((step, index) => {

            const Icon = step.icon;

            const completed = index < current;
            const active = index === current;

            return (

              <div
                key={step.title}
                className={`flex items-center gap-5 rounded-2xl border p-6 transition-all ${
                  completed
                    ? "border-green-200 bg-green-50"
                    : active
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 bg-white"
                }`}
              >

                <div
                  className={`rounded-full p-3 ${
                    completed
                      ? "bg-green-100"
                      : active
                      ? "bg-blue-100"
                      : "bg-slate-100"
                  }`}
                >

                  <Icon
                    className={`h-7 w-7 ${
                      completed
                        ? "text-green-600"
                        : active
                        ? "animate-pulse text-blue-600"
                        : "text-slate-500"
                    }`}
                  />

                </div>

                <div className="flex-1">

                  <h3 className="text-lg font-semibold">

                    {step.title}

                  </h3>

                </div>

                {completed && (

                  <CheckCircle2 className="h-7 w-7 text-green-600" />

                )}

              </div>

            );

          })}

        </div>

        {/* Summary */}

        <div className="mt-12 rounded-2xl bg-slate-50 p-8">

          <h2 className="text-2xl font-bold">

            Investigation Summary

          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            <div>

              <p className="text-sm text-slate-500">

                Company

              </p>

              <h3 className="text-xl font-semibold">

                {report.companyName}

              </h3>

            </div>

            <div>

              <p className="text-sm text-slate-500">

                Amount Paid

              </p>

              <h3 className="text-xl font-semibold">

                ₹{report.amountPaid || 0}

              </h3>

            </div>

            <div>

              <p className="text-sm text-slate-500">

                Contact Method

              </p>

              <h3 className="text-xl font-semibold">

                {report.contactMethod}

              </h3>

            </div>

            <div>

              <p className="text-sm text-slate-500">

                Payment Method

              </p>

              <h3 className="text-xl font-semibold">

                {report.paymentMethod}

              </h3>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}