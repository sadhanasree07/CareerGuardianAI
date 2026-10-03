"use client";

import { useEffect, useState } from "react";

import {
  Building2,
  Briefcase,
  Clock3,
  ShieldCheck,
  BrainCircuit,
  Play,
  Code2,
} from "lucide-react";

interface Props {
  onStart: (interview: any) => void;
}

export default function InterviewSetup({
  onStart,
}: Props) {

  const [job, setJob] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {

  loadLatestVerification();

}, []);

async function loadLatestVerification() {
  try {

    const response = await fetch("/api/verify/latest");

    const result = await response.json();

    console.log("VERIFY API RESPONSE:", result);

    if (result.success) {

      setJob(result.data);

      console.log("JOB SET:", result.data);

    } else {

      console.log("No verification found");

    }

  } catch (err) {

    console.error(err);

  }
}

  async function startInterview() {
    console.log("Current Job State:", job);
    if (!job) {

      alert("No verified recruitment found.");

      return;

    }

    try {

      setLoading(true);

      const response =
        await fetch("/api/interview/start", {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(job),

        });

      const result =
        await response.json();

      if (!result.success) {

        alert("Interview generation failed.");

        return;

      }

      onStart(result.interview);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  }

  if (!job) {

    return (

      <div className="rounded-3xl bg-white p-10 text-center shadow">

        <h2 className="text-3xl font-bold">

          No Verified Recruitment

        </h2>

        <p className="mt-4 text-slate-500">

          Please verify a recruitment first.

        </p>

      </div>

    );

  }

  return (

    <div className="rounded-3xl bg-white p-8 shadow-xl">

      <div className="flex items-center gap-4">

        <BrainCircuit className="h-10 w-10 text-blue-600" />

        <div>

          <h2 className="text-3xl font-bold">

            Guardian AI Interview

          </h2>

          <p className="text-slate-500">

            Personalized interview generated for this recruitment.

          </p>

        </div>

      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        <Card
          icon={<Building2 />}
          title="Company"
          value={job.company}
        />

        <Card
          icon={<Briefcase />}
          title="Role"
          value={job.jobRole}
        />

        <Card
          icon={<Clock3 />}
          title="Duration"
          value="20 Minutes"
        />

        <Card
          icon={<ShieldCheck />}
          title="Difficulty"
          value="AI Generated"
        />

      </div>

      <div className="mt-8 rounded-3xl bg-slate-50 p-6">

        <h3 className="mb-4 text-xl font-bold">

          Required Skills

        </h3>

        <div className="flex flex-wrap gap-3">

          {(job.requiredSkills || []).map(
            (skill: string) => (

              <span
                key={skill}
                className="rounded-full bg-blue-100 px-4 py-2 font-semibold text-blue-700"
              >

                {skill}

              </span>

            )
          )}

        </div>

      </div>

      <button
        onClick={startInterview}
        disabled={loading}
        className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-5 text-lg font-bold text-white"

      >

        <Play className="h-6 w-6" />

        {loading
          ? "Generating AI Interview..."
          : "Start Guardian AI Interview"}

      </button>

    </div>

  );

}

function Card({
  icon,
  title,
  value,
}: any) {

  return (

    <div className="rounded-2xl border border-slate-200 p-6">

      <div className="mb-3 text-blue-600">

        {icon}

      </div>

      <p className="text-sm text-slate-500">

        {title}

      </p>

      <h3 className="mt-2 font-bold">

        {value || "-"}

      </h3>

    </div>

  );

}