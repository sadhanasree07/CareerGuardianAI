"use client";

import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Star,
} from "lucide-react";

export default function InterviewFeedback({
  feedback,
}: {
  feedback: {
    score: number;
    strengths: string[];
    improvements: string[];
    sampleAnswer: string;
  };
}) {
  if (!feedback) return null;

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl">

      {/* Header */}

      <div className="flex items-center gap-3">

        <Star className="h-8 w-8 text-yellow-500" />

        <div>

          <h2 className="text-3xl font-bold">
            AI Interview Feedback
          </h2>

          <p className="text-slate-500">
            Personalized evaluation from CareerGuardian AI
          </p>

        </div>

      </div>

      {/* Score */}

      <div className="mt-8 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 p-8 text-center text-white">

        <p className="text-lg">
          Overall Interview Score
        </p>

        <h1 className="mt-3 text-6xl font-bold">
          {feedback.score}/100
        </h1>

      </div>

      {/* Strengths */}

      <div className="mt-8">

        <div className="mb-4 flex items-center gap-2">

          <CheckCircle2 className="h-6 w-6 text-green-600" />

          <h3 className="text-2xl font-bold">
            Strengths
          </h3>

        </div>

        <div className="space-y-3">

          {feedback.strengths.map((item, index) => (

            <div
              key={index}
              className="rounded-xl bg-green-50 p-4 text-green-700"
            >
              ✅ {item}
            </div>

          ))}

        </div>

      </div>

      {/* Improvements */}

      <div className="mt-10">

        <div className="mb-4 flex items-center gap-2">

          <AlertTriangle className="h-6 w-6 text-orange-500" />

          <h3 className="text-2xl font-bold">
            Areas to Improve
          </h3>

        </div>

        <div className="space-y-3">

          {feedback.improvements.map((item, index) => (

            <div
              key={index}
              className="rounded-xl bg-orange-50 p-4 text-orange-700"
            >
              ⚠ {item}
            </div>

          ))}

        </div>

      </div>

      {/* Sample Answer */}

      <div className="mt-10">

        <div className="mb-4 flex items-center gap-2">

          <Lightbulb className="h-6 w-6 text-blue-600" />

          <h3 className="text-2xl font-bold">
            AI Suggested Answer
          </h3>

        </div>

        <div className="rounded-2xl bg-blue-50 p-6 leading-8 text-slate-700">

          {feedback.sampleAnswer}

        </div>

      </div>

    </div>
  );
}