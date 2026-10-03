"use client";

import {
  BrainCircuit,
  Lightbulb,
  Target,
  TrendingUp,
  BookOpen,
  Building2,
  Rocket,
} from "lucide-react";

interface Props {
  insights: string[];
  companies: string[];
  roadmap: string[];
}

export default function GuardianInsights({
  insights,
  companies,
  roadmap,
}: Props) {

  return (

    <section className="space-y-8">

      {/* AI Recommendation */}

      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-8 text-white shadow-2xl">

        <div className="flex items-center gap-4">

          <BrainCircuit className="h-10 w-10"/>

          <div>

            <h2 className="text-3xl font-black">

              Guardian AI Insights

            </h2>

            <p className="mt-2 text-blue-100">

              Personalized recommendations based on your Career DNA,
              Resume, Interview performance and verified recruitment.

            </p>

          </div>

        </div>

      </div>

      {/* Recommendations */}

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-3xl bg-white p-8 shadow-xl">

          <div className="mb-6 flex items-center gap-3">

            <Lightbulb className="text-yellow-500"/>

            <h2 className="text-2xl font-bold">

              AI Recommendations

            </h2>

          </div>

          <div className="space-y-4">

            {insights.map((item,index)=>(

              <div
                key={index}
                className="flex items-center gap-4 rounded-2xl bg-blue-50 p-5"
              >

                <Target className="text-blue-600"/>

                <span className="font-medium">

                  {item}

                </span>

              </div>

            ))}

          </div>

        </div>

        {/* Roadmap */}

        <div className="rounded-3xl bg-white p-8 shadow-xl">

          <div className="mb-6 flex items-center gap-3">

            <Rocket className="text-purple-600"/>

            <h2 className="text-2xl font-bold">

              Next Learning Steps

            </h2>

          </div>

          <div className="space-y-4">

            {roadmap.map((item,index)=>(

              <div
                key={index}
                className="flex items-center gap-4 rounded-2xl bg-purple-50 p-5"
              >

                <BookOpen className="text-purple-600"/>

                <span>

                  {item}

                </span>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* Recommended Companies */}

      <div className="rounded-3xl bg-white p-8 shadow-xl">

        <div className="mb-6 flex items-center gap-3">

          <Building2 className="text-green-600"/>

          <h2 className="text-2xl font-bold">

            Recommended Companies

          </h2>

        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

          {companies.map((company,index)=>(

            <div
              key={index}
              className="flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition hover:shadow-lg"
            >

              <span className="font-semibold">

                {company}

              </span>

              <TrendingUp className="text-green-600"/>

            </div>

          ))}

        </div>

      </div>

    </section>

  );

}