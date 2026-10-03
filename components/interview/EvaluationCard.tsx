"use client";

import {
  BrainCircuit,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface Props {
  evaluation: {
    technical: number;
    communication: number;
    confidence: number;
    problemSolving: number;
    overall: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
}

export default function EvaluationCard({
  evaluation,
}: Props) {

  const scores = [
    {
      title: "Technical",
      value: evaluation.technical,
    },
    {
      title: "Communication",
      value: evaluation.communication,
    },
    {
      title: "Confidence",
      value: evaluation.confidence,
    },
    {
      title: "Problem Solving",
      value: evaluation.problemSolving,
    },
  ];

  return (

    <section className="rounded-3xl bg-white p-8 shadow-xl">

      <div className="flex items-center gap-4">

        <BrainCircuit className="h-10 w-10 text-blue-600" />

        <div>

          <h2 className="text-3xl font-bold">

            Guardian AI Evaluation

          </h2>

          <p className="text-slate-500">

            Real-time analysis of your interview answer.

          </p>

        </div>

      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">

        {scores.map((score) => (

          <div
            key={score.title}
            className="rounded-2xl border border-slate-200 p-6"
          >

            <div className="mb-3 flex justify-between">

              <span className="font-semibold">

                {score.title}

              </span>

              <span className="font-bold text-blue-600">

                {score.value}%

              </span>

            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-200">

              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                style={{
                  width: `${score.value}%`,
                }}
              />

            </div>

          </div>

        ))}

      </div>

      <div className="mt-10 rounded-2xl bg-blue-50 p-6">

        <h3 className="mb-4 text-xl font-bold">

          AI Feedback

        </h3>

        <p className="leading-8 text-slate-700">

          {evaluation.feedback}

        </p>

      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">

        <div className="rounded-2xl bg-green-50 p-6">

          <div className="mb-5 flex items-center gap-3">

            <CheckCircle2 className="text-green-600" />

            <h3 className="text-xl font-bold">

              Strengths

            </h3>

          </div>

          <div className="space-y-3">

            {evaluation.strengths.map((item) => (

              <div
                key={item}
                className="rounded-xl bg-white p-4"
              >

                {item}

              </div>

            ))}

          </div>

        </div>

        <div className="rounded-2xl bg-red-50 p-6">

          <div className="mb-5 flex items-center gap-3">

            <AlertTriangle className="text-red-600" />

            <h3 className="text-xl font-bold">

              Improvements

            </h3>

          </div>

          <div className="space-y-3">

            {evaluation.improvements.map((item) => (

              <div
                key={item}
                className="rounded-xl bg-white p-4"
              >

                {item}

              </div>

            ))}

          </div>

        </div>

      </div>

      <div className="mt-10 rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-500 p-8 text-white">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-3xl font-bold">

              Overall Interview Score

            </h2>

            <p className="mt-2 text-blue-100">

              Guardian AI Overall Performance

            </p>

          </div>

          <div className="text-center">

            <TrendingUp className="mx-auto h-10 w-10" />

            <h1 className="mt-3 text-6xl font-black">

              {evaluation.overall}%

            </h1>

          </div>

        </div>

      </div>

    </section>

  );

}