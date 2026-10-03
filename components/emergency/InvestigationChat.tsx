"use client";

import { useState } from "react";
import { Bot, User, ArrowRight } from "lucide-react";

interface Report {
  companyName: string;
  recruiterName: string;
  recruiterPhone: string;
  recruiterEmail: string;
  contactMethod: string;
  amountPaid: number;
  paymentMethod: string;
  paymentDate: string;
  scamDescription: string;
}

interface Props {
  companyName: string;
  onComplete: (report: Report) => void;
}

const questions = [
  {
    key: "companyName",
    question: "Is this the company involved in the scam?",
    placeholder: "Company Name",
  },
  {
    key: "recruiterName",
    question: "What is the recruiter's name?",
    placeholder: "Recruiter Name",
  },
  {
    key: "recruiterPhone",
    question: "Recruiter's phone number?",
    placeholder: "+91 XXXXX XXXXX",
  },
  {
    key: "recruiterEmail",
    question: "Recruiter's email address?",
    placeholder: "abc@gmail.com",
  },
  {
    key: "contactMethod",
    question: "How did they contact you?",
    placeholder: "WhatsApp / Telegram / Email",
  },
  {
    key: "amountPaid",
    question: "How much money did you pay?",
    placeholder: "5000",
  },
  {
    key: "paymentMethod",
    question: "Payment Method?",
    placeholder: "UPI / Bank / Card",
  },
  {
    key: "paymentDate",
    question: "When did you make the payment?",
    placeholder: "12 July 2026",
  },
  {
    key: "scamDescription",
    question: "Briefly explain what happened.",
    placeholder: "Describe the incident...",
  },
];

export default function InvestigationChat({
  companyName,
  onComplete,
}: Props) {
  const [step, setStep] = useState(0);

  const [input, setInput] = useState(companyName);

  const [report, setReport] = useState<Report>({
    companyName,
    recruiterName: "",
    recruiterPhone: "",
    recruiterEmail: "",
    contactMethod: "",
    amountPaid: 0,
    paymentMethod: "",
    paymentDate: "",
    scamDescription: "",
  });

  function nextQuestion() {
    const key = questions[step].key;

    const updated = {
      ...report,
      [key]:
        key === "amountPaid"
          ? Number(input)
          : input,
    };

    setReport(updated);

    if (step === questions.length - 1) {
      onComplete(updated);
      return;
    }

    setStep(step + 1);

    const nextKey =
      questions[step + 1].key as keyof Report;

    setInput(String(updated[nextKey] ?? ""));
  }

  return (
    <section className="rounded-3xl bg-white shadow-xl">

      {/* Header */}

      <div className="border-b p-8">

        <div className="flex items-center gap-4">

          <div className="rounded-full bg-blue-100 p-4">

            <Bot className="h-8 w-8 text-blue-600" />

          </div>

          <div>

            <h2 className="text-3xl font-bold">

              AI Recovery Assistant

            </h2>

            <p className="text-slate-500">

              Let's collect a few details before preparing your recovery report.

            </p>

          </div>

        </div>

      </div>

      {/* Progress */}

      <div className="px-8 pt-6">

        <div className="mb-2 flex justify-between">

          <span className="text-sm text-slate-500">

            Question {step + 1} of {questions.length}

          </span>

          <span className="text-sm font-semibold text-blue-600">

            {Math.round(((step + 1) / questions.length) * 100)}%

          </span>

        </div>

        <div className="h-2 rounded-full bg-slate-200">

          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{
              width: `${((step + 1) / questions.length) * 100}%`,
            }}
          />

        </div>

      </div>

      {/* Chat */}

      <div className="space-y-8 p-8">

        <div className="flex gap-4">

          <div className="rounded-full bg-blue-100 p-3">

            <Bot className="h-5 w-5 text-blue-600" />

          </div>

          <div className="max-w-xl rounded-2xl bg-slate-100 p-5">

            <p className="font-semibold text-blue-600">

              CareerGuardian AI

            </p>

            <p className="mt-2">

              {questions[step].question}

            </p>

          </div>

        </div>

        <div className="flex justify-end">

          <div className="max-w-xl rounded-2xl bg-blue-600 p-5 text-white">

            <div className="mb-2 flex items-center gap-2">

              <User className="h-5 w-5" />

              <span className="font-semibold">

                You

              </span>

            </div>

            <input
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              placeholder={questions[step].placeholder}
              className="w-full rounded-xl bg-white p-3 text-black outline-none"
            />

          </div>

        </div>

        <button
          onClick={nextQuestion}
          className="flex items-center gap-3 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700"
        >

          {step === questions.length - 1
            ? "Generate Recovery Report"
            : "Next"}

          <ArrowRight className="h-5 w-5" />

        </button>

      </div>

    </section>
  );
}