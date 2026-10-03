"use client";

import {
  Trophy,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  TrendingUp,
  Download,
} from "lucide-react";

interface Props {
  result: {
    overall: number;
    technical: number;
    communication: number;
    confidence: number;
    problemSolving: number;
    hiringProbability: number;
    recommendation: string;
    strengths: string[];
    improvements: string[];
  };

  onDownload: () => void;
}

export default function InterviewResult({
  result,
  onDownload,
}: Props) {

  const scores = [
    {
      title: "Technical",
      value: result.technical,
    },
    {
      title: "Communication",
      value: result.communication,
    },
    {
      title: "Confidence",
      value: result.confidence,
    },
    {
      title: "Problem Solving",
      value: result.problemSolving,
    },
  ];

  return (

    <section className="space-y-8">

      {/* Overall */}

      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-10 text-white shadow-xl">

        <div className="flex items-center justify-between">

          <div>

            <div className="flex items-center gap-3">

              <Trophy className="h-10 w-10" />

              <h1 className="text-4xl font-black">

                Guardian AI Interview Report

              </h1>

            </div>

            <p className="mt-4 text-lg text-blue-100">

              AI Interview successfully completed.

            </p>

          </div>

          <div className="text-center">

            <p className="text-lg">

              Overall Score

            </p>

            <h1 className="text-7xl font-black">

              {result.overall}%

            </h1>

          </div>

        </div>

      </div>

      {/* Score Cards */}

      <div className="grid gap-6 md:grid-cols-2">

        {scores.map((item) => (

          <div
            key={item.title}
            className="rounded-3xl bg-white p-6 shadow"
          >

            <div className="mb-3 flex justify-between">

              <span className="font-semibold">

                {item.title}

              </span>

              <span className="font-bold text-blue-600">

                {item.value}%

              </span>

            </div>

            <div className="h-3 rounded-full bg-slate-200">

              <div
                className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                style={{
                  width: `${item.value}%`,
                }}
              />

            </div>

          </div>

        ))}

      </div>

      {/* Hiring */}

      <div className="rounded-3xl bg-white p-8 shadow">

        <div className="flex items-center gap-4">

          <Briefcase className="h-10 w-10 text-green-600" />

          <div>

            <h2 className="text-3xl font-bold">

              Hiring Probability

            </h2>

            <p className="text-slate-500">

              Based on Guardian AI evaluation.

            </p>

          </div>

        </div>

        <h1 className="mt-8 text-6xl font-black text-green-600">

          {result.hiringProbability}%

        </h1>

      </div>

      {/* Recommendation */}

      <div className="rounded-3xl bg-blue-50 p-8">

        <div className="flex items-center gap-3">

          <BrainCircuit className="text-blue-600" />

          <h2 className="text-2xl font-bold">

            Guardian AI Recommendation

          </h2>

        </div>

        <p className="mt-5 text-lg leading-8">

          {result.recommendation}

        </p>

      </div>

      {/* Strength & Improvements */}

      <div className="grid gap-8 lg:grid-cols-2">

        <div className="rounded-3xl bg-green-50 p-8">

          <div className="mb-5 flex items-center gap-3">

            <CheckCircle2 className="text-green-600" />

            <h2 className="text-2xl font-bold">

              Strengths

            </h2>

          </div>

          <div className="space-y-4">

            {result.strengths.map((item) => (

              <div
                key={item}
                className="rounded-xl bg-white p-4 shadow-sm"
              >

                {item}

              </div>

            ))}

          </div>

        </div>

        <div className="rounded-3xl bg-red-50 p-8">

          <div className="mb-5 flex items-center gap-3">

            <AlertTriangle className="text-red-600" />

            <h2 className="text-2xl font-bold">

              Improvements

            </h2>

          </div>

          <div className="space-y-4">

            {result.improvements.map((item) => (

              <div
                key={item}
                className="rounded-xl bg-white p-4 shadow-sm"
              >

                {item}

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* Download */}

      <button
        onClick={onDownload}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 py-5 text-lg font-bold text-white"
      >

        <Download className="h-6 w-6" />

        Download Interview Report

      </button>

    </section>

  );

}