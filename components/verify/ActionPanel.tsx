"use client";

import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  FileText,
  GraduationCap,
  ShieldAlert,
  ShieldCheck,
  FileWarning,
  Siren,
} from "lucide-react";

interface Props {
  score: number;
}

export default function ActionPanel({
  score,
}: Props) {

  const safe = score >= 80;

  return (

    <section className="mt-8 rounded-3xl bg-white p-8 shadow-xl">

      <div className="mb-8 flex items-center gap-4">

        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
          safe ? "bg-green-100" : "bg-red-100"
        }`}>

          {safe ? (
            <ShieldCheck className="h-8 w-8 text-green-600" />
          ) : (
            <ShieldAlert className="h-8 w-8 text-red-600" />
          )}

        </div>

        <div>

          <h2 className="text-3xl font-bold">

            Recommended Next Step

          </h2>

          <p className="text-slate-500">

            Guardian AI Recommendation

          </p>

        </div>

      </div>

      {safe ? (

        <div className="rounded-3xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-8">

          <h2 className="text-4xl font-black text-green-700">

            Recruitment Verified

          </h2>

          <p className="mt-3 text-lg text-slate-600">

            Continue building your career using Guardian AI.

          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">

            <Card
              icon={<BrainCircuit className="h-8 w-8 text-blue-600" />}
              title="Career DNA"
              description="AI Career Profile"
            />

            <Card
              icon={<FileText className="h-8 w-8 text-blue-600" />}
              title="Resume Builder"
              description="ATS Resume"
            />

            <Card
              icon={<GraduationCap className="h-8 w-8 text-blue-600" />}
              title="Placement AI"
              description="Placement Prediction"
            />

          </div>

          <Link href="/career-dna">

            <button className="mt-10 flex items-center gap-3 rounded-2xl bg-green-600 px-8 py-4 text-lg font-bold text-white transition hover:scale-105 hover:bg-green-700">

              Continue to Career DNA

              <ArrowRight className="h-5 w-5" />

            </button>

          </Link>

        </div>

      ) : (

        <div className="rounded-3xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-8">

          <h2 className="text-4xl font-black text-red-700">

            Immediate Action Required

          </h2>

          <p className="mt-3 text-lg text-slate-600">

            Guardian AI recommends reporting this recruitment immediately.

          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">

            <Card
              icon={<FileWarning className="h-8 w-8 text-red-600" />}
              title="Complaint Letter"
              description="Auto Generate"
            />

            <Card
              icon={<ShieldAlert className="h-8 w-8 text-red-600" />}
              title="Cyber Crime"
              description="Report Scam"
            />

            <Card
              icon={<Siren className="h-8 w-8 text-red-600" />}
              title="Emergency"
              description="SOS Recovery"
            />

          </div>

          <Link href="/emergency">

            <button className="mt-10 flex items-center gap-3 rounded-2xl bg-red-600 px-8 py-4 text-lg font-bold text-white transition hover:scale-105 hover:bg-red-700">

              Raise a Complaint

              <ArrowRight className="h-5 w-5" />

            </button>

          </Link>

        </div>

      )}

    </section>

  );

}

function Card({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">

      <div className="mb-4">

        {icon}

      </div>

      <h3 className="text-xl font-bold">

        {title}

      </h3>

      <p className="mt-2 text-slate-500">

        {description}

      </p>

    </div>

  );

}