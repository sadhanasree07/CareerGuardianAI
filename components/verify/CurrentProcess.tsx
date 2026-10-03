"use client";

import {
  Building2,
  Globe,
  Mail,
  Phone,
  IndianRupee,
  MapPin,
  CheckCircle2,
  Search,
} from "lucide-react";

interface Props {
  currentStep: number;
}

const findings = [
  {
    title: "Company",
    value: "Searching company...",
    final: "Awaiting OCR Result",
    icon: Building2,
  },
  {
    title: "Official Website",
    value: "Searching website...",
    final: "Awaiting Verification",
    icon: Globe,
  },
  {
    title: "Recruiter Email",
    value: "Searching email...",
    final: "Awaiting Verification",
    icon: Mail,
  },
  {
    title: "Contact Number",
    value: "Searching phone...",
    final: "Awaiting Verification",
    icon: Phone,
  },
  {
    title: "Salary Offered",
    value: "Analysing salary...",
    final: "Awaiting AI Analysis",
    icon: IndianRupee,
  },
  {
    title: "Location",
    value: "Finding location...",
    final: "Awaiting OCR",
    icon: MapPin,
  },
];

export default function LiveFindings({
  currentStep,
}: Props) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold">

            Live AI Findings

          </h2>

          <p className="text-slate-500">

            Information discovered during verification

          </p>

        </div>

        <Search className="h-8 w-8 text-blue-600" />

      </div>

      <div className="mt-8 space-y-4">

        {findings.map((item, index) => {

          const Icon = item.icon;

          const completed = currentStep > index;

          return (

            <div
              key={item.title}
              className={`rounded-2xl border p-5 transition-all duration-500 ${
                completed
                  ? "border-green-200 bg-green-50"
                  : "border-slate-200 bg-white"
              }`}
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      completed
                        ? "bg-green-100"
                        : "bg-slate-100"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${
                        completed
                          ? "text-green-600"
                          : "text-slate-500"
                      }`}
                    />
                  </div>

                  <div>

                    <p className="text-sm text-slate-500">

                      {item.title}

                    </p>

                    <h3 className="font-semibold">

                      {completed
                        ? item.final
                        : item.value}

                    </h3>

                  </div>

                </div>

                {completed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500" />
                )}

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
}