"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

export default function ChatBox({
  onResponse,
}: {
  onResponse: (answer: string) => void;
}) {
  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(false);

  async function askAI() {
    if (!question.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      });

      const json = await res.json();

      if (json.success) {
        onResponse(json.answer);
      } else {
        alert(json.message);
      }

    } catch (err) {

      console.error(err);

      alert("Unable to contact AI Mentor.");

    } finally {

      setLoading(false);

    }
  }

  return (

    <div className="rounded-3xl bg-white p-8 shadow">

      <h2 className="text-2xl font-bold">

        Ask AI Mentor

      </h2>

      <textarea

        rows={5}

        value={question}

        onChange={(e)=>setQuestion(e.target.value)}

        placeholder="Ask anything about placements, internships, higher studies, Embedded Systems, VLSI, Resume, Career Growth..."

        className="mt-6 w-full rounded-2xl border border-slate-300 p-5 outline-none focus:border-blue-500"

      />

      <button

        onClick={askAI}

        disabled={loading}

        className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 py-4 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"

      >

        {loading ? (

          <>

            <Loader2 className="h-5 w-5 animate-spin"/>

            Thinking...

          </>

        ) : (

          <>

            <Send className="h-5 w-5"/>

            Ask AI Mentor

          </>

        )}

      </button>

    </div>

  );

}