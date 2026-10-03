"use client";

import { useEffect, useState } from "react";

import {
  BrainCircuit,
  Clock3,
  Send,
} from "lucide-react";

import VoiceRecorder from "./VoiceRecorder";
import AISpeaker from "./AISpeaker";

const VoiceRecorderComponent = VoiceRecorder as any;

interface Props {
  interview: any;
  currentQuestion: number;
  totalQuestions: number;
  onSubmit: (
    question: any,
    answer: string
  ) => void;
}

export default function InterviewQuestion({

  interview,

  currentQuestion,

  totalQuestions,

  onSubmit,

}: Props) {

  const [answer, setAnswer] =
    useState("");

  const [seconds, setSeconds] =
    useState(180);

  const [aiFinished, setAiFinished] =
    useState(false);

  const question =
    interview.questions[currentQuestion];

  const progress =
    ((currentQuestion + 1) /
      totalQuestions) *
    100;

  useEffect(() => {

    setAnswer("");

    setSeconds(180);

    setAiFinished(false);

    window.speechSynthesis.cancel();

  }, [currentQuestion]);

  useEffect(() => {

    if (seconds <= 0) return;

    const timer = setTimeout(() => {

      setSeconds((prev) => prev - 1);

    }, 1000);

    return () => clearTimeout(timer);

  }, [seconds]);

  function submitAnswer() {

    if (!answer.trim()) {

      alert("Please answer the question.");

      return;

    }

    window.speechSynthesis.cancel();

    onSubmit(question, answer);

  }
    return (

    <section className="rounded-3xl bg-white p-8 shadow-2xl">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-5">

          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-4 text-white shadow-lg">

            <BrainCircuit className="h-10 w-10"/>

          </div>

          <div>

            <h2 className="text-3xl font-bold">

              Guardian AI Interview

            </h2>

            <p className="mt-1 text-slate-500">

              {interview.company}

            </p>

          </div>

        </div>

        <div className="rounded-2xl bg-red-50 px-6 py-4 shadow">

          <div className="flex items-center gap-3">

            <Clock3 className="text-red-600"/>

            <span className="text-2xl font-bold">

              {Math.floor(seconds / 60)}:

              {(seconds % 60)
                .toString()
                .padStart(2, "0")}

            </span>

          </div>

        </div>

      </div>

      {/* Progress */}

      <div className="mt-10">

        <div className="mb-3 flex justify-between">

          <span className="font-semibold text-slate-700">

            Question {currentQuestion + 1} of {totalQuestions}

          </span>

          <span className="font-bold text-blue-600">

            {Math.round(progress)}%

          </span>

        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-200">

          <div

            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 transition-all duration-700"

            style={{

              width: `${progress}%`,

            }}

          />

        </div>

      </div>

      {/* AI Question */}

      <div className="mt-10 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-8 shadow">

        <div className="flex items-center justify-between">

          <span className="rounded-full bg-blue-600 px-5 py-2 font-semibold text-white">

            {question.type}

          </span>

          <AISpeaker

            key={currentQuestion}

            text={`Question ${currentQuestion + 1}. ${question.question}`}

            onFinished={() =>

              setAiFinished(true)

            }

          />

        </div>

        <h2 className="mt-8 text-3xl font-bold leading-relaxed text-slate-900">

          {question.question}

        </h2>

      </div>

      {/* Guardian AI Status */}

      <div className="mt-8 rounded-3xl border bg-white p-6 shadow">

        <div className="flex items-center gap-4">

          <div

            className={`h-4 w-4 rounded-full ${
              aiFinished

                ? "bg-green-500"

                : "animate-pulse bg-blue-500"

            }`}

          />

          <div>

            <h3 className="text-xl font-bold">

              Guardian AI Status

            </h3>

            <p className="mt-1 text-slate-600">

              {aiFinished

                ? "Guardian AI finished speaking. You can now record your answer."

                : "Guardian AI is asking the interview question..."}

            </p>

          </div>

        </div>

      </div>
            {/* Voice Recorder */}

      <div className="mt-8 rounded-3xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-6 shadow">

        <div className="mb-5 flex items-center justify-between">

          <div>

            <h3 className="text-xl font-bold">

              Voice Answer

            </h3>

            <p className="mt-1 text-slate-600">

              Speak naturally. Guardian AI will automatically convert your voice into text.

            </p>

          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              aiFinished
                ? "bg-green-600 text-white"
                : "bg-slate-300 text-slate-700"
            }`}
          >

            {aiFinished
              ? "Ready"
              : "Waiting..."}

          </span>

        </div>

        <VoiceRecorderComponent

          disabled={!aiFinished}

          onTranscript={(text: string) =>
            setAnswer(text)
          }

        />

      </div>

      {/* Transcript */}

      <div className="mt-8">

        <label className="mb-3 block text-xl font-bold">

          Guardian AI Transcript

        </label>

        <textarea

          rows={8}

          value={answer}

          onChange={(e) =>
            setAnswer(e.target.value)
          }

          placeholder="Your spoken answer will appear here..."

          className="w-full rounded-3xl border border-slate-300 bg-slate-50 p-6 text-lg outline-none transition-all focus:border-blue-600 focus:bg-white"

        />

      </div>

      {/* Submit */}

      <button

        onClick={submitAnswer}

        className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 py-5 text-xl font-bold text-white shadow-xl transition-all hover:scale-[1.02]"

      >

        <Send className="h-7 w-7"/>

        {currentQuestion === totalQuestions - 1

          ? "Finish Guardian Interview"

          : "Submit Answer & Continue"}

      </button>

    </section>

  );

}