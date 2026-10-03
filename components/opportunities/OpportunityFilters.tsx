"use client";

import { Search } from "lucide-react";
import { useState } from "react";

export default function OpportunityFilters({
  onSearch,
}: {
  onSearch: (filters: any) => void;
}) {
  const [filters, setFilters] = useState({
    role: "Embedded Systems Engineer",
    location: "Chennai",
    type: "Internship",
    salary: "Any",
    domain: "Embedded Systems",
  });

  function update(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow">

      <h2 className="text-3xl font-bold">
        Find Opportunities
      </h2>

      <p className="mt-2 text-slate-500">
        Search AI-recommended internships and jobs.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {/* Role */}

        <div>

          <label className="mb-2 block font-medium">
            Role
          </label>

          <select
            name="role"
            value={filters.role}
            onChange={update}
            className="w-full rounded-xl border p-3"
          >
            <option>Embedded Systems Engineer</option>
            <option>IoT Developer</option>
            <option>VLSI Design Engineer</option>
            <option>PCB Design Engineer</option>
            <option>Software Engineer</option>
          </select>

        </div>

        {/* Location */}

        <div>

          <label className="mb-2 block font-medium">
            Location
          </label>

          <input
            name="location"
            value={filters.location}
            onChange={update}
            className="w-full rounded-xl border p-3"
            placeholder="Chennai"
          />

        </div>

        {/* Type */}

        <div>

          <label className="mb-2 block font-medium">
            Opportunity Type
          </label>

          <select
            name="type"
            value={filters.type}
            onChange={update}
            className="w-full rounded-xl border p-3"
          >
            <option>Internship</option>
            <option>Full Time</option>
            <option>Remote</option>
          </select>

        </div>

        {/* Salary */}

        <div>

          <label className="mb-2 block font-medium">
            Salary
          </label>

          <select
            name="salary"
            value={filters.salary}
            onChange={update}
            className="w-full rounded-xl border p-3"
          >
            <option>Any</option>
            <option>₹3–5 LPA</option>
            <option>₹5–8 LPA</option>
            <option>₹8–12 LPA</option>
            <option>₹12+ LPA</option>
          </select>

        </div>

        {/* Domain */}

        <div>

          <label className="mb-2 block font-medium">
            Skill Domain
          </label>

          <select
            name="domain"
            value={filters.domain}
            onChange={update}
            className="w-full rounded-xl border p-3"
          >
            <option>Embedded Systems</option>
            <option>IoT</option>
            <option>VLSI</option>
            <option>PCB Design</option>
            <option>AI / ML</option>
          </select>

        </div>

      </div>

      <button
        onClick={() => onSearch(filters)}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 py-4 text-lg font-semibold text-white hover:opacity-90"
      >
        <Search className="h-5 w-5" />

        Search Opportunities

      </button>

    </div>
  );
}