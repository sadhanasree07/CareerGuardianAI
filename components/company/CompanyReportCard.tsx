"use client";

import { useState } from "react";

import {
  Building2,
  ShieldCheck,
  ShieldAlert,
  Users,
  Search,
  Globe,
  Mail,
  Lock,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
} from "lucide-react";

interface VerificationSummary {
  layer: number;
  title: string;
  passedPercentage: number;
  averageScore: number;
}

interface CompanyReport {
  companyName: string;
  location: string;
  trustScore: number;
  totalChecks: number;
  safeReports: number;
  suspiciousReports: number;
  scamReports: number;
  website?: string;
  verificationSummary?: VerificationSummary[];
}

export default function CompanyReportCard({
  company,
}: {
  company: CompanyReport;
}) {
  const [showVerification, setShowVerification] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);

  const safePercentage =
    company.totalChecks > 0
      ? Math.round(
          (company.safeReports / company.totalChecks) * 100
        )
      : 0;

  const suspiciousPercentage =
    company.totalChecks > 0
      ? Math.round(
          (company.suspiciousReports / company.totalChecks) * 100
        )
      : 0;

  const scamPercentage =
    company.totalChecks > 0
      ? Math.round(
          (company.scamReports / company.totalChecks) * 100
        )
      : 0;

  const status =
    company.trustScore >= 70
      ? "GENERALLY TRUSTED"
      : company.trustScore >= 40
      ? "REQUIRES CAUTION"
      : "HIGH RISK";

  const signal =
    company.trustScore >= 70
      ? {
          title: "SAFE SIGNAL",
          description:
            "Multiple verification signals indicate a generally trusted company profile.",
          color: "border-green-200 bg-green-50",
          text: "text-green-700",
        }
      : company.trustScore >= 40
      ? {
          title: "CAUTION SIGNAL",
          description:
            "Some verification signals require additional review before proceeding.",
          color: "border-orange-200 bg-orange-50",
          text: "text-orange-700",
        }
      : {
          title: "RISK SIGNAL",
          description:
            "Multiple risk signals were detected. Proceed only after careful verification.",
          color: "border-red-200 bg-red-50",
          text: "text-red-700",
        };

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-6">

        {/* Header */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-8 text-white shadow-xl">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                <Building2 className="h-9 w-9" />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                  CareerGuardian AI
                </p>

                <h1 className="mt-2 text-3xl font-black lg:text-4xl">
                  {company.companyName}
                </h1>

                <p className="mt-2 text-blue-100">
                  {company.location}
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-white/15 px-8 py-6 text-center backdrop-blur">
              <p className="text-sm text-blue-100">
                Guardian Trust Score
              </p>

              <div className="mt-1 text-5xl font-black">
                {company.trustScore}
                <span className="text-2xl">/100</span>
              </div>

              <div className="mt-3 inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-bold">
                {status}
              </div>
            </div>
          </div>
        </section>

        {/* Safe Signal */}
        <section
          className={`mt-8 rounded-3xl border p-6 ${signal.color}`}
        >
          <div className="flex items-center gap-4">
            <ShieldCheck
              className={`h-10 w-10 ${signal.text}`}
            />

            <div>
              <h2
                className={`text-xl font-black ${signal.text}`}
              >
                {signal.title}
              </h2>

              <p className="mt-1 text-slate-600">
                {signal.description}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Search className="h-6 w-6 text-blue-600" />}
            value={company.totalChecks}
            label="Student Checks"
          />

          <StatCard
            icon={<ShieldCheck className="h-6 w-6 text-green-600" />}
            value={company.safeReports}
            label="Safe Signals"
          />

          <StatCard
            icon={
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            }
            value={company.suspiciousReports}
            label="Suspicious Signals"
          />

          <StatCard
            icon={<ShieldAlert className="h-6 w-6 text-red-600" />}
            value={company.scamReports}
            label="Scam Reports"
          />
        </section>

        {/* Community Signals */}
        <section className="mt-8 grid gap-8 lg:grid-cols-2">

          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <Users className="h-7 w-7 text-blue-600" />

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Community Signals
                </h2>

                <p className="text-sm text-slate-500">
                  Based on verified community activity
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <SignalBar
                label="Safe Signals"
                value={safePercentage}
                bar="bg-green-500"
              />

              <SignalBar
                label="Suspicious Reports"
                value={suspiciousPercentage}
                bar="bg-orange-500"
              />

              <SignalBar
                label="Scam Reports"
                value={scamPercentage}
                bar="bg-red-500"
              />
            </div>
          </div>

          {/* AI Verification */}
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-blue-600" />

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  AI Verification
                </h2>

                <p className="text-sm text-slate-500">
                  Real results from the Guardian Verify Engine
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-3">
              <VerificationItem
                icon={<Building2 className="h-5 w-5" />}
                title="Company Verification"
                status="Analyzed"
              />

              <VerificationItem
                icon={<Globe className="h-5 w-5" />}
                title="Official Website"
                status={
                  company.website
                    ? "Available"
                    : "Not Available"
                }
              />

              <VerificationItem
                icon={<Lock className="h-5 w-5" />}
                title="Security Analysis"
                status="Checked"
              />

              <VerificationItem
                icon={<Mail className="h-5 w-5" />}
                title="Recruitment Contact"
                status="Analyzed"
              />

              <VerificationItem
                icon={<CreditCard className="h-5 w-5" />}
                title="Payment Risk"
                status="Checked"
              />
            </div>

            <button
              onClick={() =>
                setShowVerification(!showVerification)
              }
              className="mt-6 flex items-center gap-2 font-semibold text-blue-600 transition hover:text-blue-800"
            >
              {showVerification
                ? "Hide 12-Layer Verification"
                : "View Full 12-Layer Verification"}

              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </section>

        {/* 12 Layer Verification */}
        {showVerification && (
          <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-blue-600" />

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  12-Layer Verification Intelligence
                </h2>

                <p className="text-sm text-slate-500">
                  Based on all available company verification records
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {company.verificationSummary &&
              company.verificationSummary.length > 0 ? (
                company.verificationSummary.map((layer) => (
                  <div
                    key={layer.layer}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-600">
                        LAYER {layer.layer}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          layer.passedPercentage >= 70
                            ? "bg-green-100 text-green-700"
                            : layer.passedPercentage >= 40
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {layer.passedPercentage}% PASS
                      </span>
                    </div>

                    <h3 className="mt-3 font-bold text-slate-900">
                      {layer.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Average verification score:{" "}
                      {layer.averageScore}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">
                  No detailed verification layers available yet.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Community Alerts */}
        <section className="mt-8 rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Community Scam Intelligence
                </h2>

                <p className="mt-2 text-slate-600">
                  Report suspicious recruitment activity to help
                  protect other students.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIncidentForm(true)}
              className="whitespace-nowrap rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              Report an Incident
            </button>
          </div>
        </section>

        {/* Incident Form */}
        {showIncidentForm && (
          <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Report Recruitment Incident
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Help protect other students by reporting suspicious activity.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowIncidentForm(false)
                }
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form
  className="mt-6 space-y-4"
  onSubmit={async (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    const formData = new FormData(form);

    const incidentType =
      formData.get("incidentType");

    const description =
      formData.get("description");

    try {
      const response = await fetch(
        "/api/incidents",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            company: company.companyName,
            incidentType,
            description,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to submit incident."
        );

        return;
      }

      alert(
        "Incident reported successfully. Thank you for helping protect other students."
      );

      form.reset();

      setShowIncidentForm(false);

    } catch (error) {
      console.error(
        "Incident submission error:",
        error
      );

      alert(
        "Something went wrong. Please try again."
      );
    }
  }}
>
              <input
                type="text"
                value={company.companyName}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 p-3 text-slate-500"
              />

              <select
  name="incidentType"
  required
  className="w-full rounded-xl border border-slate-200 p-3"
>
  <option value="">
    Select incident type
  </option>

  <option value="Fake job offer">
    Fake job offer
  </option>

  <option value="Money or fee requested">
    Money or fee requested
  </option>

  <option value="Fake recruiter">
    Fake recruiter
  </option>

  <option value="Suspicious website">
    Suspicious website
  </option>

  <option value="Other">
    Other
  </option>
</select>

              <textarea
  name="description"
  required
  placeholder="Describe what happened..."
  rows={5}
  className="w-full rounded-xl border border-slate-200 p-3"
/>
              <button
                type="submit"
                className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                Submit Incident Report
              </button>
            </form>
          </section>
        )}

        {/* Innovation Flow */}
        <section className="mt-8 rounded-3xl bg-slate-900 p-8 text-white">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-7 w-7 text-cyan-400" />

            <h2 className="text-2xl font-bold">
              How Community Intelligence Works
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-5">
            <FlowItem
              number="01"
              title="Student Report"
              description="A user reports suspicious activity."
            />

            <FlowItem
              number="02"
              title="Evidence"
              description="Supporting information is collected."
            />

            <FlowItem
              number="03"
              title="AI Analysis"
              description="Patterns are analyzed."
            />

            <FlowItem
              number="04"
              title="Trust Signal"
              description="Verified signals update intelligence."
            />

            <FlowItem
              number="05"
              title="Protect Others"
              description="Future students are warned early."
            />
          </div>

          <div className="mt-8 rounded-2xl bg-white/10 p-5 text-center text-lg font-semibold text-cyan-100">
            One student's report can help protect the next thousand students.
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        {icon}

        <p className="text-sm font-medium text-slate-500">
          {label}
        </p>
      </div>

      <h3 className="mt-5 text-3xl font-black text-slate-900">
        {value}
      </h3>
    </div>
  );
}

function SignalBar({
  label,
  value,
  bar,
}: {
  label: string;
  value: number;
  bar: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-slate-700">
          {label}
        </span>

        <span className="font-bold text-slate-900">
          {value}%
        </span>
      </div>

      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${bar}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function VerificationItem({
  icon,
  title,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-3 text-slate-700">
        <div className="text-blue-600">
          {icon}
        </div>

        <span className="font-medium">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
        <CheckCircle2 className="h-4 w-4" />

        {status}
      </div>
    </div>
  );
}

function FlowItem({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-5">
      <span className="text-sm font-bold text-cyan-400">
        {number}
      </span>

      <h3 className="mt-3 font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-300">
        {description}
      </p>
    </div>
  );
}