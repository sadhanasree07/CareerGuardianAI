"use client";

import {
  CheckCircle2,
  ShieldCheck,
  Globe,
  Mail,
  Brain,
  FileSearch,
} from "lucide-react";

const activities = [
  {
    time: "09:42 AM",
    title: "OCR Extraction Completed",
    description: "Recruitment information extracted successfully.",
    icon: FileSearch,
  },
  {
    time: "09:42 AM",
    title: "Government Website Verified",
    description: "Official government portal detected.",
    icon: Globe,
  },
  {
    time: "09:43 AM",
    title: "Recruiter Email Validated",
    description: "Email domain appears legitimate.",
    icon: Mail,
  },
  {
    time: "09:43 AM",
    title: "AI Risk Analysis Completed",
    description: "12-layer verification successfully finished.",
    icon: Brain,
  },
  {
    time: "09:44 AM",
    title: "Trust Score Generated",
    description: "Final trust report created.",
    icon: ShieldCheck,
  },
];

export default function ActivityFeed() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-slate-900">
          AI Activity Feed
        </h2>

        <p className="mt-1 text-slate-500">
          Live recruitment investigation timeline.
        </p>

      </div>

      <div className="space-y-6">

        {activities.map((item, index) => {

          const Icon = item.icon;

          return (

            <div
              key={index}
              className="flex gap-5"
            >

              {/* Timeline */}

              <div className="flex flex-col items-center">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50">

                  <Icon className="h-5 w-5 text-blue-600" />

                </div>

                {index !== activities.length - 1 && (

                  <div className="mt-2 h-10 w-px bg-slate-200" />

                )}

              </div>

              {/* Content */}

              <div className="flex-1">

                <div className="flex items-center justify-between">

                  <h3 className="font-semibold text-slate-900">
                    {item.title}
                  </h3>

                  <span className="text-xs text-slate-400">
                    {item.time}
                  </span>

                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {item.description}
                </p>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">

                  <CheckCircle2 className="h-4 w-4" />

                  Completed

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
}