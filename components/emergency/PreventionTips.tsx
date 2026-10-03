"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Globe,
  CreditCard,
  Mail,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const tips = [
  {
    icon: ShieldCheck,
    title: "Never Pay Before Joining",
    description:
      "Legitimate employers never ask candidates to pay registration or processing fees before joining.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Globe,
    title: "Always Verify Website",
    description:
      "Check whether the recruitment website is the official domain before submitting any personal information.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: CreditCard,
    title: "Avoid UPI Payments",
    description:
      "Government recruitment agencies never collect application fees through personal UPI IDs.",
    color: "bg-red-100 text-red-600",
  },
  {
    icon: Mail,
    title: "Check Official Email",
    description:
      "Recruiters usually use official company email domains instead of free Gmail or Yahoo accounts.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: AlertTriangle,
    title: "Beware of Urgency",
    description:
      "Messages asking you to 'Pay Immediately' or 'Limited Seats' are common recruitment scam tactics.",
    color: "bg-yellow-100 text-yellow-600",
  },
];

export default function PreventionTips() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % tips.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  function nextTip() {
    setCurrent((prev) => (prev + 1) % tips.length);
  }

  function previousTip() {
    setCurrent((prev) =>
      prev === 0 ? tips.length - 1 : prev - 1
    );
  }

  const TipIcon = tips[current].icon;

  return (
    <section className="mt-16 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-10 shadow-xl">

      <div className="text-center">

        <span className="rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold text-blue-600">

          AI SAFETY TIPS

        </span>

        <h2 className="mt-5 text-4xl font-bold text-slate-900">

          Prevent Recruitment Scams

        </h2>

        <p className="mt-3 text-slate-600">

          Learn smart practices recommended by CareerGuardian AI
          to stay safe from fake job and internship scams.

        </p>

      </div>

      <div className="mx-auto mt-12 max-w-4xl rounded-3xl bg-white p-10 shadow-lg">

        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${tips[current].color}`}
        >
          <TipIcon className="h-10 w-10" />
        </div>

        <h3 className="mt-6 text-center text-3xl font-bold text-slate-900">

          {tips[current].title}

        </h3>

        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-slate-600">

          {tips[current].description}

        </p>

        <div className="mt-10 flex items-center justify-center gap-5">

          <button
            onClick={previousTip}
            className="rounded-full bg-slate-100 p-4 transition hover:bg-slate-200"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {tips.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-3 rounded-full transition-all ${
                current === index
                  ? "w-10 bg-blue-600"
                  : "w-3 bg-slate-300"
              }`}
            />
          ))}

          <button
            onClick={nextTip}
            className="rounded-full bg-slate-100 p-4 transition hover:bg-slate-200"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

        </div>

      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">

        <div className="rounded-2xl bg-red-50 p-6 shadow">

          <h3 className="text-xl font-bold text-red-600">

            🚫 Never Share OTP

          </h3>

          <p className="mt-3 text-slate-600">

            Genuine recruiters never ask for OTPs or banking PINs.

          </p>

        </div>

        <div className="rounded-2xl bg-green-50 p-6 shadow">

          <h3 className="text-xl font-bold text-green-600">

            ✅ Verify Company

          </h3>

          <p className="mt-3 text-slate-600">

            Always verify company registration and official recruitment pages.

          </p>

        </div>

        <div className="rounded-2xl bg-yellow-50 p-6 shadow">

          <h3 className="text-xl font-bold text-yellow-600">

            ⚠ Report Immediately

          </h3>

          <p className="mt-3 text-slate-600">

            If you suspect fraud, report it immediately to reduce financial loss.

          </p>

        </div>

      </div>

    </section>
  );
}