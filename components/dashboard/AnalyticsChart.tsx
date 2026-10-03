"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Investigation {
  company: string;
  trustScore: number;
  verdict: string;
}

interface AnalyticsChartProps {
  investigations: Investigation[];
}

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export default function AnalyticsChart({
  investigations,
}: AnalyticsChartProps) {

  const trustData = investigations.map((item) => ({
    name: item.company.length > 10
      ? item.company.substring(0, 10)
      : item.company,
    score: item.trustScore,
  }));

  const verdictData = [
    {
      name: "Safe",
      value: investigations.filter(
        (i) => i.verdict === "SAFE"
      ).length,
    },
    {
      name: "Suspicious",
      value: investigations.filter(
        (i) => i.verdict === "SUSPICIOUS"
      ).length,
    },
    {
      name: "Scam",
      value: investigations.filter(
        (i) => i.verdict === "SCAM"
      ).length,
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-2">

      {/* Trust Trend */}

      <div className="rounded-3xl border bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-2xl font-bold">
          Trust Score Trend
        </h2>

        <ResponsiveContainer
          width="100%"
          height={300}
        >

          <LineChart data={trustData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Line
              dataKey="score"
              stroke="#2563eb"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* Verdict Pie */}

      <div className="rounded-3xl border bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-2xl font-bold">
          Investigation Distribution
        </h2>

        <ResponsiveContainer
          width="100%"
          height={300}
        >

          <PieChart>

            <Pie
              data={verdictData}
              dataKey="value"
              outerRadius={100}
              label
            >

              {verdictData.map((entry, index) => (

                <Cell
                  key={index}
                  fill={COLORS[index]}
                />

              ))}

            </Pie>

            <Legend />

            <Tooltip />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}