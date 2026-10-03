"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  ShieldCheck,
  Lock,
  Smartphone,
  CreditCard,
  FileText,
  PhoneCall,
} from "lucide-react";

const initialChecklist = [
  {
    title: "Save screenshots of chats",
    icon: Smartphone,
    completed: true,
  },
  {
    title: "Keep payment receipts",
    icon: CreditCard,
    completed: true,
  },
  {
    title: "Download offer letter",
    icon: FileText,
    completed: false,
  },
  {
    title: "Call your bank",
    icon: PhoneCall,
    completed: false,
  },
  {
    title: "Change account passwords",
    icon: Lock,
    completed: false,
  },
  {
    title: "Report to Cyber Crime",
    icon: ShieldCheck,
    completed: false,
  },
];

export default function FraudChecklist() {
  const [tasks, setTasks] = useState(initialChecklist);

  function toggle(index: number) {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  }

  const completed = tasks.filter(
    (task) => task.completed
  ).length;

  const percentage = Math.round(
    (completed / tasks.length) * 100
  );

  return (
    <section className="mt-16 rounded-3xl bg-gradient-to-br from-green-50 via-white to-emerald-50 p-10 shadow-xl">

      {/* Header */}

      <div className="text-center">

        <span className="rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-700">

          RECOVERY CHECKLIST

        </span>

        <h2 className="mt-5 text-4xl font-bold text-slate-900">

          Complete Your Safety Checklist

        </h2>

        <p className="mt-3 text-slate-600">

          Follow every step to improve your chances of
          recovering from recruitment fraud.

        </p>

      </div>

      {/* Progress */}

      <div className="mt-12 rounded-3xl bg-white p-8 shadow-lg">

        <div className="flex items-center justify-between">

          <h3 className="text-2xl font-bold">

            Progress

          </h3>

          <span className="rounded-full bg-green-100 px-5 py-2 font-bold text-green-700">

            {percentage}%

          </span>

        </div>

        <div className="mt-6 h-4 rounded-full bg-slate-200">

          <div
            className="h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

      </div>

      {/* Checklist */}

      <div className="mt-10 space-y-5">

        {tasks.map((task, index) => {

          const Icon = task.icon;

          return (

            <button
              key={task.title}
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between rounded-2xl bg-white p-6 shadow transition hover:shadow-xl"
            >

              <div className="flex items-center gap-5">

                <div className="rounded-2xl bg-slate-100 p-4">

                  <Icon className="h-6 w-6 text-blue-600" />

                </div>

                <div className="text-left">

                  <h3 className="text-lg font-semibold">

                    {task.title}

                  </h3>

                </div>

              </div>

              {task.completed ? (

                <CheckCircle2 className="h-8 w-8 text-green-600" />

              ) : (

                <Circle className="h-8 w-8 text-slate-400" />

              )}

            </button>

          );

        })}

      </div>

      {/* AI Recommendation */}

      <div className="mt-12 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white shadow-xl">

        <h2 className="text-2xl font-bold">

          🤖 AI Recommendation

        </h2>

        <p className="mt-5 leading-8 text-blue-100">

          Complete all checklist items as early as possible.
          Reporting within the first few hours significantly
          improves the chances of recovering lost money and
          preserving digital evidence.

        </p>

      </div>

    </section>
  );
}