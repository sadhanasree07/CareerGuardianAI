"use client";

import {
  Building2,
  MapPin,
  IndianRupee,
  Clock,
  Users,
  BadgeCheck,
  ExternalLink,
} from "lucide-react";

export default function OpportunityDetails({
  job,
}: {
  job: any;
}) {
  if (!job) return null;

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="rounded-2xl bg-blue-100 p-4">

            <Building2 className="h-8 w-8 text-blue-600" />

          </div>

          <div>

            <h1 className="text-3xl font-bold">

              {job.company}

            </h1>

            <p className="text-slate-500">

              {job.role}

            </p>

          </div>

        </div>

        <span className="rounded-full bg-green-100 px-5 py-3 font-bold text-green-700">

          {job.match}% AI Match

        </span>

      </div>

      {/* Info */}

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

        <Info
          icon={<MapPin className="h-5 w-5 text-blue-600" />}
          title="Location"
          value={job.location}
        />

        <Info
          icon={<IndianRupee className="h-5 w-5 text-green-600" />}
          title="Salary"
          value={job.salary}
        />

        <Info
          icon={<Clock className="h-5 w-5 text-orange-600" />}
          title="Experience"
          value={job.experience}
        />

        <Info
          icon={<Users className="h-5 w-5 text-violet-600" />}
          title="Job Type"
          value={job.type}
        />

      </div>

      {/* Description */}

      <section className="mt-10">

        <h2 className="mb-4 text-2xl font-bold">

          Job Description

        </h2>

        <div className="rounded-2xl bg-slate-50 p-6 leading-8 text-slate-700">

          {job.description}

        </div>

      </section>

      {/* Eligibility */}

      <section className="mt-10">

        <h2 className="mb-4 text-2xl font-bold">

          Eligibility

        </h2>

        <div className="space-y-3">

          {job.eligibility?.map(
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

      </section>

      {/* Skills */}

      <section className="mt-10">

        <h2 className="mb-4 text-2xl font-bold">

          Required Skills

        </h2>

        <div className="flex flex-wrap gap-3">

          {job.skills?.map(
            (skill: string, index: number) => (

              <span
                key={index}
                className="rounded-full bg-blue-100 px-5 py-2"
              >

                {skill}

              </span>

            )
          )}

        </div>

      </section>

      {/* AI Match */}

      <section className="mt-10">

        <div className="flex items-center gap-3">

          <BadgeCheck className="h-7 w-7 text-green-600" />

          <h2 className="text-2xl font-bold">

            AI Match Analysis

          </h2>

        </div>

        <div className="mt-6">

          <div className="mb-3 flex justify-between">

            <span>Career Match</span>

            <span>{job.match}%</span>

          </div>

          <div className="h-4 rounded-full bg-slate-200">

            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
              style={{
                width: `${job.match}%`,
              }}
            />

          </div>

        </div>

      </section>

      {/* Apply */}

      <div className="mt-10">

        <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 py-4 text-lg font-semibold text-white">

          <ExternalLink className="h-5 w-5"/>

          Apply Now

        </button>

      </div>

    </div>
  );
}

function Info({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">

      <div className="flex items-center gap-2">

        {icon}

        <span className="text-sm text-slate-500">

          {title}

        </span>

      </div>

      <h3 className="mt-3 text-lg font-semibold">

        {value}

      </h3>

    </div>
  );
}