"use client";

import { useState } from "react";

import InterviewSetup from "@/components/interview/InterviewSetup";
import InterviewQuestion from "@/components/interview/InterviewQuestion";
import EvaluationCard from "@/components/interview/EvaluationCard";
import InterviewResult from "@/components/interview/InterviewResult";
import InterviewWelcome from "@/components/interview/InterviewWelcome";
import BadgeUnlocked from "@/components/badges/BadgeUnlocked";

import downloadInterviewReport from "@/lib/interview/downloadInterviewReport";

export default function InterviewPage() {
  const [interview, setInterview] = useState<any>(null);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [evaluation, setEvaluation] =
    useState<any>(null);

  const [evaluations, setEvaluations] =
    useState<any[]>([]);

  const [completed, setCompleted] =
    useState(false);

  const [finalReport, setFinalReport] =
    useState<any>(null);

  const [showWelcome, setShowWelcome] =
    useState(true);

  const [savingActivity, setSavingActivity] =
    useState(false);

  const [newBadge, setNewBadge] =
    useState<any>(null);

  const [showBadge, setShowBadge] =
    useState(false);

  // Evaluate interview answer
  async function handleSubmit(
    question: any,
    answer: string
  ) {
    try {
      const response = await fetch(
        "/api/interview/evaluate",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            company: interview.company,

            role:
              interview.jobRole ||
              interview.title,

            question:
              question.question,

            answer,
          }),
        }
      );

      const result =
        await response.json();

      if (!result.success) {
        alert("Evaluation failed.");
        return;
      }

      setEvaluation(
        result.evaluation
      );
    } catch (error) {
      console.error(error);

      alert(
        "Interview evaluation failed."
      );
    }
  }

  // Calculate final interview result
  function calculateResult(data: any[]) {
    if (!data.length) {
      return {
        overall: 0,

        technical: 0,

        communication: 0,

        confidence: 0,

        problemSolving: 0,

        hiringProbability: 0,

        recommendation:
          "No interview data available.",

        strengths: [],

        improvements: [],
      };
    }

    const technical = Math.round(
      data.reduce(
        (sum, item) =>
          sum + Number(item.technical || 0),
        0
      ) / data.length
    );

    const communication = Math.round(
      data.reduce(
        (sum, item) =>
          sum +
          Number(item.communication || 0),
        0
      ) / data.length
    );

    const confidence = Math.round(
      data.reduce(
        (sum, item) =>
          sum + Number(item.confidence || 0),
        0
      ) / data.length
    );

    const problemSolving = Math.round(
      data.reduce(
        (sum, item) =>
          sum +
          Number(item.problemSolving || 0),
        0
      ) / data.length
    );

    const overall = Math.round(
      data.reduce(
        (sum, item) =>
          sum + Number(item.overall || 0),
        0
      ) / data.length
    );

    return {
      overall,

      technical,

      communication,

      confidence,

      problemSolving,

      hiringProbability:
        Math.min(overall + 5, 100),

      recommendation:
        overall >= 85
          ? "Excellent interview performance. You are ready for placements."
          : overall >= 70
          ? "Very good performance. Improve a few areas before your next interview."
          : overall >= 50
          ? "Good progress. Practice regularly to improve your performance."
          : "Continue practicing your technical skills and communication.",

      strengths: [
        "Technical Understanding",
        "Communication",
        "Professional Attitude",
      ],

      improvements: [
        "Give more real-world examples.",
        "Improve confidence while answering.",
        "Explain your thought process clearly.",
      ],
    };
  }

  // Save completed interview activity
async function saveInterviewActivity() {
  try {
    const userId =
      localStorage.getItem("userId");

    if (!userId) {
      console.log(
        "User ID not found."
      );

      return null;
    }

    setSavingActivity(true);

    const response = await fetch(
      "/api/activity/interview",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          userId,
        }),
      }
    );

    const result =
      await response.json();

    if (!result.success) {
      console.error(
        result.message
      );

      return null;
    }

    return result;

  } catch (error) {
    console.error(
      "Failed to save interview activity:",
      error
    );

    return null;

  } finally {
    setSavingActivity(false);
  }
}

  // Move to next question
  async function nextQuestion() {
    if (!evaluation) return;

    const updated = [
      ...evaluations,
      evaluation,
    ];

    setEvaluations(updated);

    setEvaluation(null);

    // More questions remaining
    if (
      currentQuestion <
      interview.questions.length - 1
    ) {
      setCurrentQuestion(
        (previous) => previous + 1
      );

      return;
    }

    // Last question completed

    const report =
      calculateResult(updated);

    setFinalReport(report);

    // Save real interview activity
    
const activityResult =
  await saveInterviewActivity();

setCompleted(true);

if (activityResult?.newBadge) {

  setNewBadge(
    activityResult.newBadge
  );

  setTimeout(() => {
    setShowBadge(true);
  }, 700);

}
    // Store updated interview count locally
    // This can be used by dashboard/badges

    if (
      activityResult?.interviewCount !==
      undefined
    ) {
      localStorage.setItem(
        "interviewCount",
        String(
          activityResult.interviewCount
        )
      );

      // Notify other parts of the app
      window.dispatchEvent(
        new Event("careerGuardianActivityUpdated")
      );
    }

    // Show final result

    setCompleted(true);
  }

  return (
    <main className="min-h-screen bg-slate-100">

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Welcome Screen */}

        {showWelcome ? (
          <InterviewWelcome
            onStart={() =>
              setShowWelcome(false)
            }
          />
        ) : !interview ? (
          <InterviewSetup
            onStart={setInterview}
          />
        ) : null}

        {/* Interview Questions */}

        {interview && !completed && (
          <>
            <InterviewQuestion
              interview={interview}

              currentQuestion={
                currentQuestion
              }

              totalQuestions={
                interview.questions.length
              }

              onSubmit={handleSubmit}
            />

            {/* Evaluation */}

            {evaluation && (
              <div className="mt-8 space-y-8">

                <EvaluationCard
                  evaluation={evaluation}
                />

                <button
                  onClick={nextQuestion}

                  disabled={savingActivity}

                  className="w-full rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 py-5 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingActivity
                    ? "Saving Interview Progress..."

                    : currentQuestion ===
                      interview.questions.length - 1

                    ? "Generate Guardian AI Report"

                    : "Continue to Next Question"}
                </button>

              </div>
            )}
          </>
        )}

        {/* Final Interview Report */}

        {completed && finalReport && (
          <InterviewResult
            result={finalReport}

            onDownload={() =>
              downloadInterviewReport(
                finalReport
              )
            }
          />
        )}
        {showBadge && newBadge && (
  <BadgeUnlocked
    badge={newBadge}
    onClose={() => {
      setShowBadge(false);
    }}
  />
)}

      </section>

    </main>
  );
}