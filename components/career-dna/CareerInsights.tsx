"use client";

import {
  FolderKanban,
  GraduationCap,
  Building2,
  IndianRupee,
  TrendingUp,
} from "lucide-react";

interface Props {
  recommendedProjects: string[];
  recommendedCourses: string[];
  recommendedCompanies: string[];
  salaryPrediction: {
    current: string;
    future: string;
  };
}

export default function CareerInsights({
  recommendedProjects,
  recommendedCourses,
  recommendedCompanies,
  salaryPrediction,
}: Props) {

  return (

    <section className="space-y-8">

      {/* Salary Prediction */}

      <div className="rounded-3xl bg-gradient-to-r from-green-600 to-emerald-500 p-8 text-white shadow-xl">

        <div className="flex items-center gap-4">

          <IndianRupee className="h-10 w-10" />

          <div>

            <h2 className="text-3xl font-bold">

              AI Salary Prediction

            </h2>

            <p className="text-green-100">

              Estimated salary growth based on your Career DNA.

            </p>

          </div>

        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">

          <div className="rounded-2xl bg-white/10 p-6">

            <p className="text-green-100">

              Current Market Estimate

            </p>

            <h1 className="mt-3 text-5xl font-black">

              {salaryPrediction.current || "-"}

            </h1>

          </div>

          <div className="rounded-2xl bg-white/10 p-6">

            <p className="text-green-100">

              Future Potential

            </p>

            <h1 className="mt-3 text-5xl font-black">

              {salaryPrediction.future || "-"}

            </h1>

          </div>

        </div>

      </div>

      {/* Projects */}

      <div className="rounded-3xl bg-white p-8 shadow-xl">

        <div className="mb-6 flex items-center gap-3">

          <FolderKanban className="h-8 w-8 text-blue-600" />

          <h2 className="text-2xl font-bold">

            Recommended Projects

          </h2>

        </div>

        <div className="space-y-4">

          {recommendedProjects.length > 0 ? (

            recommendedProjects.map((item) => (

              <div
                key={item}
                className="rounded-2xl border border-slate-200 p-5"
              >

                {item}

              </div>

            ))

          ) : (

            <p className="text-slate-500">

              No recommendations available.

            </p>

          )}

        </div>

      </div>

      {/* Courses */}

      <div className="rounded-3xl bg-white p-8 shadow-xl">

        <div className="mb-6 flex items-center gap-3">

          <GraduationCap className="h-8 w-8 text-purple-600" />

          <h2 className="text-2xl font-bold">

            Recommended Courses

          </h2>

        </div>

        <div className="space-y-4">

          {recommendedCourses.length > 0 ? (

            recommendedCourses.map((item) => (

              <div
                key={item}
                className="rounded-2xl border border-slate-200 p-5"
              >

                {item}

              </div>

            ))

          ) : (

            <p className="text-slate-500">

              No courses recommended.

            </p>

          )}

        </div>

      </div>

      {/* Companies */}

      <div className="rounded-3xl bg-white p-8 shadow-xl">

        <div className="mb-6 flex items-center gap-3">

          <Building2 className="h-8 w-8 text-cyan-600" />

          <h2 className="text-2xl font-bold">

            Best Companies To Apply

          </h2>

        </div>

        <div className="grid gap-4 md:grid-cols-2">

          {recommendedCompanies.length > 0 ? (

            recommendedCompanies.map((company) => (

              <div
                key={company}
                className="flex items-center justify-between rounded-2xl border border-slate-200 p-5"
              >

                <span className="font-semibold">

                  {company}

                </span>

                <TrendingUp className="text-green-600" />

              </div>

            ))

          ) : (

            <p className="text-slate-500">

              No company recommendations available.

            </p>

          )}

        </div>

      </div>

    </section>

  );

}