"use client";

import {
  Trophy,
  TrendingUp,
  Briefcase,
  IndianRupee,
  CheckCircle,
} from "lucide-react";

export default function PlacementResult({
  result,
}: {
  result: any;
}) {
  if (!result) return null;

  return (
    <div className="space-y-8">

      {/* Hero */}

      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-blue-600 to-cyan-600 p-10 text-white shadow-xl">

        <div className="flex items-center gap-4">

          <Trophy className="h-12 w-12" />

          <div>

            <h1 className="text-4xl font-bold">

              AI Placement Prediction

            </h1>

            <p className="mt-2 text-emerald-100">

              CareerGuardian AI Analysis

            </p>

          </div>

        </div>

      </div>

      {/* Cards */}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        <Card
          title="Placement Chance"
          value={`${result.placementChance}%`}
          color="text-green-600"
        />

        <Card
          title="AI Confidence"
          value={`${result.confidence}%`}
          color="text-blue-600"
        />

        <Card
          title="Expected Salary"
          value={result.salary}
          color="text-violet-600"
        />

        <Card
          title="Status"
          value={result.status}
          color="text-emerald-600"
        />

      </div>

      {/* Progress */}

      <div className="rounded-3xl bg-white p-8 shadow">

        <div className="flex items-center gap-3">

          <TrendingUp className="h-8 w-8 text-blue-600"/>

          <h2 className="text-3xl font-bold">

            Placement Readiness

          </h2>

        </div>

        <div className="mt-8">

          <Progress
            title="Technical Skills"
            value={result.skillsScore}
          />

          <Progress
            title="Projects"
            value={result.projectScore}
          />

          <Progress
            title="Communication"
            value={result.communicationScore}
          />

          <Progress
            title="Aptitude"
            value={result.aptitudeScore}
          />

        </div>

      </div>

      {/* Recommendations */}

      <div className="rounded-3xl bg-white p-8 shadow">

        <div className="flex items-center gap-3">

          <CheckCircle className="h-8 w-8 text-green-600"/>

          <h2 className="text-3xl font-bold">

            AI Recommendations

          </h2>

        </div>

        <div className="mt-8 space-y-4">

          {result.recommendations.map(
            (item: string, index: number) => (

              <div
                key={index}
                className="rounded-xl bg-green-50 p-4"
              >

                ✅ {item}

              </div>

            )
          )}

        </div>

      </div>

      {/* Salary */}

      <div className="rounded-3xl bg-white p-8 shadow">

        <div className="flex items-center gap-3">

          <IndianRupee className="h-8 w-8 text-green-600"/>

          <h2 className="text-3xl font-bold">

            Salary Prediction

          </h2>

        </div>

        <h1 className="mt-8 text-5xl font-bold text-green-600">

          {result.salary}

        </h1>

      </div>

      {/* Companies */}

<div className="rounded-3xl bg-white p-8 shadow">

  <div className="flex items-center gap-3">

    <Briefcase className="h-8 w-8 text-blue-600" />

    <h2 className="text-3xl font-bold">
      Best Matching Companies
    </h2>

  </div>

  <div className="mt-8 grid gap-4 md:grid-cols-2">

    {result.companies.map(
      (
        company: {
          name: string;
          role: string;
          match: number;
        },
        index: number
      ) => (

        <div
          key={index}
          className="rounded-2xl border border-slate-200 p-5"
        >

          <h3 className="text-xl font-bold">

            {company.name}

          </h3>

          <p className="mt-1 text-slate-500">

            {company.role}

          </p>

          <div className="mt-4 flex items-center justify-between">

            <span className="text-sm text-slate-500">
              Match Score
            </span>

            <span className="font-bold text-blue-600">

              {company.match}%

            </span>

          </div>

        </div>

      )
    )}

  </div>

</div>

    </div>
  );
}

function Card({
  title,
  value,
  color,
}: any) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow">

      <p className="text-slate-500">

        {title}

      </p>

      <h2 className={`mt-4 text-4xl font-bold ${color}`}>

        {value}

      </h2>

    </div>
  );
}

function Progress({
  title,
  value,
}: any) {
  return (
    <div className="mb-6">

      <div className="mb-2 flex justify-between">

        <span>{title}</span>

        <span>{value}%</span>

      </div>

      <div className="h-3 rounded-full bg-slate-200">

        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-blue-600"
          style={{
            width: `${value}%`,
          }}
        />

      </div>

    </div>
  );
}