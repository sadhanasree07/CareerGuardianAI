"use client";

const questions = [
  "How do I become an Embedded Systems Engineer?",

  "How can I improve my resume for placements?",

  "Which certifications should I complete as an ECE student?",

  "Suggest projects to get placed in Core Electronics.",

  "What skills are currently in demand for Embedded Engineers?",

  "How do I prepare for technical interviews?",

  "How can I prepare for GATE ECE?",

  "Should I choose VLSI or Embedded Systems?"
];

export default function SuggestedQuestions({
  onSelect,
}: {
  onSelect: (question: string) => void;
}) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow">

      <h2 className="text-2xl font-bold">
        Suggested Questions
      </h2>

      <p className="mt-2 text-slate-500">
        Click any question to instantly ask AI Mentor.
      </p>

      <div className="mt-8 grid gap-4">

        {questions.map((question, index) => (

          <button
            key={index}
            onClick={() => onSelect(question)}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-blue-500 hover:bg-blue-50"
          >

            💬 {question}

          </button>

        ))}

      </div>

    </div>
  );
}