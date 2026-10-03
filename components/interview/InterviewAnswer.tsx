"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

export default function InterviewAnswer({
  onSubmit,
}: {
  onSubmit: (answer: string) => void;
}) {
  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(false);

  function submitAnswer() {
    if (!answer.trim()) return;

    setLoading(true);

    onSubmit(answer);

    setAnswer("");

    setTimeout(() => {
      setLoading(false);
    }, 600);
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow">

      <h2 className="text-2xl font-bold">
        Your Answer
      </h2>

      <p className="mt-2 text-slate-500">
        Answer as if you are in a real interview.
      </p>

      <textarea
        rows={8}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your interview answer here..."
        className="mt-6 w-full rounded-2xl border border-slate-300 p-5 text-base outline-none transition focus:border-violet-500"
      />

      <button
        onClick={submitAnswer}
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 py-4 text-lg font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Evaluating...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Submit Answer
          </>
        )}
      </button>

    </div>
  );
}