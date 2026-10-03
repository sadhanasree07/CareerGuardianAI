"use client";

import {
  Building2,
  MapPin,
  IndianRupee,
  Briefcase,
  ArrowUpRight,
} from "lucide-react";

export default function OpportunityCard({
  job,
}: {
  job: any;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow transition hover:shadow-xl hover:border-blue-500">

      {/* Company */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="rounded-2xl bg-blue-100 p-4">

            <Building2 className="h-8 w-8 text-blue-600" />

          </div>

          <div>

            <h2 className="text-2xl font-bold">

              {job.company}

            </h2>

            <p className="text-slate-500">

              {job.role}

            </p>

          </div>

        </div>

        <span className="rounded-full bg-green-100 px-4 py-2 font-semibold text-green-700">

          {job.match}% Match

        </span>

      </div>

      {/* Details */}

      <div className="mt-8 grid gap-5 md:grid-cols-3">

        <div className="flex items-center gap-3">

          <MapPin className="h-5 w-5 text-blue-600"/>

          <span>{job.location}</span>

        </div>

        <div className="flex items-center gap-3">

          <IndianRupee className="h-5 w-5 text-green-600"/>

          <span>{job.salary}</span>

        </div>

        <div className="flex items-center gap-3">

          <Briefcase className="h-5 w-5 text-violet-600"/>

          <span>{job.type}</span>

        </div>

      </div>

      {/* Skills */}

      <div className="mt-8">

        <p className="mb-3 font-semibold">

          Required Skills

        </p>

        <div className="flex flex-wrap gap-2">

          {job.skills.map(
            (skill: string, index: number) => (

              <span
                key={index}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm"
              >

                {skill}

              </span>

            )
          )}

        </div>

      </div>

      {/* Description */}

      <div className="mt-8 rounded-2xl bg-slate-50 p-5">

        <p className="leading-7 text-slate-600">

          {job.description}

        </p>

      </div>

      {/* Apply */}

      <div className="mt-8 flex gap-4">

        <button
          className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 py-4 font-semibold text-white hover:opacity-90"
        >

          <ArrowUpRight className="h-5 w-5"/>

          Apply Now

        </button>

        <button
          className="rounded-2xl border border-slate-300 px-6 py-4 hover:bg-slate-100"
        >

          Save

        </button>

      </div>

    </div>
  );
}