"use client";

import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  PlayCircle,
  ScanSearch,
  Building2,
  Globe,
  BrainCircuit,
  BadgeCheck,
} from "lucide-react";

export default function VerifySection() {
  return (
    <section className="bg-slate-50 py-24">

      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="text-center">

          <span className="rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold text-blue-700">

            GUARDIAN VERIFY

          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900">

            AI Recruitment Verification

          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">

            Detect fake recruitment notifications, internship scams,
            fraudulent HR messages and suspicious job offers before
            sharing your personal information.

          </p>

        </div>

        {/* Layout */}

        <div className="mt-20 grid items-center gap-16 lg:grid-cols-2">

          {/* Left */}

          <div>

            <div className="space-y-6">

              <Feature
                icon={ScanSearch}
                title="OCR Document Extraction"
                description="Extracts company name, recruiter, salary, links and contact details."
              />

              <Feature
                icon={Building2}
                title="Company Verification"
                description="Checks company authenticity against trusted sources."
              />

              <Feature
                icon={Globe}
                title="Website & Domain Analysis"
                description="Identifies fake domains and phishing recruitment portals."
              />

              <Feature
                icon={BrainCircuit}
                title="12-Layer AI Verification"
                description="Multiple intelligent security layers generate a Trust Score."
              />

              <Feature
                icon={BadgeCheck}
                title="AI Verdict"
                description="SAFE • SUSPICIOUS • SCAM with explanation."
              />

            </div>

            <div className="mt-10 flex flex-wrap gap-5">

              <Link href="/analyze">

                <button className="flex items-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition hover:bg-blue-700">

                  Verify Now

                  <ArrowRight className="h-5 w-5" />

                </button>

              </Link>

              <button className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-8 py-4 font-semibold text-slate-700 transition hover:border-blue-500 hover:text-blue-600">

                <PlayCircle className="h-5 w-5" />

                Watch Demo

              </button>

            </div>

          </div>

          {/* Right */}

          <div>

            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl">

              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white">

                <div className="flex items-center gap-3">

                  <ShieldCheck className="h-8 w-8" />

                  <div>

                    <h3 className="text-2xl font-bold">

                      Live Verification

                    </h3>

                    <p className="text-blue-100">

                      Example Analysis

                    </p>

                  </div>

                </div>

              </div>

              <div className="space-y-5 p-6">

                <Status
                  label="Company"
                  value="Verified"
                  color="green"
                />

                <Status
                  label="Domain"
                  value="Official"
                  color="green"
                />

                <Status
                  label="Salary"
                  value="Validated"
                  color="blue"
                />

                <Status
                  label="Recruiter"
                  value="Verified"
                  color="green"
                />

                <Status
                  label="Trust Score"
                  value="92 / 100"
                  color="blue"
                />

              </div>

              <div className="bg-slate-50 p-6">

                <div className="flex items-center justify-between">

                  <span className="font-semibold">

                    AI Verdict

                  </span>

                  <span className="rounded-full bg-green-100 px-4 py-2 text-green-700 font-semibold">

                    SAFE

                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: any) {
  return (
    <div className="flex gap-5 rounded-2xl bg-white p-5 shadow">

      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">

        <Icon className="h-7 w-7 text-blue-600" />

      </div>

      <div>

        <h3 className="text-xl font-bold">

          {title}

        </h3>

        <p className="mt-2 text-slate-600">

          {description}

        </p>

      </div>

    </div>
  );
}

function Status({
  label,
  value,
  color,
}: any) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">

      <span className="font-medium">

        {label}

      </span>

      <span
        className={`font-bold ${
          color === "green"
            ? "text-green-600"
            : "text-blue-600"
        }`}
      >

        {value}

      </span>

    </div>
  );
}