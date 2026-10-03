"use client";

import { BrainCircuit, Sparkles, Play } from "lucide-react";

interface Props {
  onStart: () => void;
}

export default function InterviewWelcome({
  onStart,
}: Props) {

  return (

    <div className="rounded-3xl bg-gradient-to-br from-blue-700 via-cyan-600 to-indigo-700 p-10 text-white shadow-2xl">

      <div className="flex items-center gap-5">

        <div className="rounded-2xl bg-white/20 p-5">

          <BrainCircuit className="h-12 w-12"/>

        </div>

        <div>

          <h1 className="text-4xl font-black">

            Guardian AI Interview

          </h1>

          <p className="mt-2 text-blue-100 text-lg">

            Your personal AI interviewer is ready.

          </p>

        </div>

      </div>

      <div className="mt-10 rounded-3xl bg-white/10 p-8">

        <div className="flex items-center gap-3">

          <Sparkles className="text-yellow-300"/>

          <h2 className="text-2xl font-bold">

            Before We Begin

          </h2>

        </div>

        <ul className="mt-6 space-y-4 text-lg">

          <li>✔ Guardian AI will ask HR and technical questions.</li>

          <li>✔ Speak naturally and confidently.</li>

          <li>✔ Your answers will be evaluated instantly.</li>

          <li>✔ A detailed interview report will be generated.</li>

        </ul>

      </div>

      <button

        onClick={onStart}

        className="mt-10 flex items-center gap-3 rounded-2xl bg-white px-8 py-5 text-xl font-bold text-blue-700 transition hover:scale-105"

      >

        <Play className="h-6 w-6"/>

        Begin Interview

      </button>

    </div>

  );

}