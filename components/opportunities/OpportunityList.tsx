"use client";

import OpportunityCard from "./OpportunityCard";

export default function OpportunityList({
  jobs,
}: {
  jobs: any[];
}) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-16 text-center shadow">

        <h2 className="text-3xl font-bold text-slate-700">
          No Opportunities Found
        </h2>

        <p className="mt-4 text-slate-500">
          Try changing your filters or search again.
        </p>

      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-bold">
            AI Recommended Opportunities
          </h2>

          <p className="mt-2 text-slate-500">
            Sorted by CareerGuardian AI Match Score
          </p>

        </div>

        <span className="rounded-full bg-blue-100 px-5 py-3 font-semibold text-blue-700">

          {jobs.length} Results

        </span>

      </div>

      {/* Cards */}

      <div className="space-y-8">

        {jobs.map((job, index) => (

          <div key={index}>

            <OpportunityCard job={job} />

          </div>

        ))}

      </div>

    </div>
  );
}