"use client";

import { Target } from "lucide-react";

const careers = [
  {
    role: "Embedded Systems Engineer",
    match: "96%",
  },
  {
    role: "PCB Design Engineer",
    match: "94%",
  },
  {
    role: "IoT Engineer",
    match: "91%",
  },
  {
    role: "VLSI Engineer",
    match: "88%",
  },
];

export default function CareerMatch() {
  return (
    <div className="rounded-3xl bg-white p-8 shadow">

      <div className="mb-6 flex items-center gap-3">

        <Target className="h-7 w-7 text-blue-600" />

        <h2 className="text-2xl font-bold">

          AI Career Match

        </h2>

      </div>

      <div className="space-y-5">

        {careers.map((career) => (

          <div
            key={career.role}
            className="rounded-xl border p-5"
          >

            <div className="mb-3 flex justify-between">

              <span className="font-semibold">

                {career.role}

              </span>

              <span className="font-bold text-blue-600">

                {career.match}

              </span>

            </div>

            <div className="h-3 rounded-full bg-slate-200">

              <div
                className="h-full rounded-full bg-blue-600"
                style={{
                  width: career.match,
                }}
              />

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}