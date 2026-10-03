"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

export default function PlacementChart({
  result,
}: {
  result: any;
}) {
  if (!result) return null;

  const data = [
    {
      subject: "Skills",
      score: result.skillsScore,
    },
    {
      subject: "Projects",
      score: result.projectScore,
    },
    {
      subject: "Communication",
      score: result.communicationScore,
    },
    {
      subject: "Aptitude",
      score: result.aptitudeScore,
    },
    {
      subject: "CGPA",
      score: result.cgpaScore,
    },
  ];

  return (
    <div className="rounded-3xl bg-white p-8 shadow">

      <h2 className="mb-8 text-3xl font-bold">
        AI Skill Analysis
      </h2>

      <div className="h-[420px]">

        <ResponsiveContainer width="100%" height="100%">

          <RadarChart data={data}>

            <PolarGrid />

            <PolarAngleAxis dataKey="subject" />

            <Radar
              dataKey="score"
              stroke="#2563eb"
              fill="#3b82f6"
              fillOpacity={0.6}
            />

          </RadarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}