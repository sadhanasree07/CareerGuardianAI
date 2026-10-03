"use client";

import { Brain } from "lucide-react";

const skills = [
  "C Programming",
  "Embedded Systems",
  "Arduino",
  "ESP32",
  "PCB Design",
  "IoT",
  "Problem Solving",
  "Communication",
];

export default function SkillAnalysis() {
  return (
    <div className="rounded-3xl bg-white p-8 shadow">

      <div className="mb-6 flex items-center gap-3">

        <Brain className="h-7 w-7 text-violet-600" />

        <h2 className="text-2xl font-bold">

          Skills Detected

        </h2>

      </div>

      <div className="flex flex-wrap gap-3">

        {skills.map((skill) => (

          <span
            key={skill}
            className="rounded-full bg-violet-100 px-4 py-2 font-medium text-violet-700"
          >

            {skill}

          </span>

        ))}

      </div>

    </div>
  );
}