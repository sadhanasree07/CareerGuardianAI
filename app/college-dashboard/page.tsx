"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { useLanguage } from "@/src/context/LanguageContext";

import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  Search,
  ArrowLeft,
  Globe,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Users,
} from "lucide-react";

export default function CollegeDashboardPage() {
  const { t } = useLanguage();

  const [companies, setCompanies] =
    useState<any[]>([]);

  const [stats, setStats] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("ALL");

  const [refreshing, setRefreshing] =
    useState(false);

  async function loadDashboard(
    showRefresh = false
  ) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        "/api/college-dashboard",
        {
          cache: "no-store",
        }
      );

      const result =
        await response.json();

      if (result.success) {
        setCompanies(
          result.companies || []
        );

        setStats(
          result.stats || null
        );
      }

    } catch (error) {
      console.error(
        "College dashboard error:",
        error
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const filteredCompanies = useMemo(() => {
    return companies.filter(
      (company) => {
        const matchesSearch =
          company.company
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          company.jobRole
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesFilter =
          filter === "ALL"
            ? true
            : company.status === filter;

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );
  }, [
    companies,
    search,
    filter,
  ]);

  function getStatusStyle(
    status: string
  ) {
    if (status === "SAFE") {
      return {
        label: "SAFE",
        className:
          "bg-green-100 text-green-700",
        icon: (
          <CheckCircle2 className="h-4 w-4" />
        ),
      };
    }

    if (status === "SCAM") {
      return {
        label: "HIGH RISK",
        className:
          "bg-red-100 text-red-700",
        icon: (
          <XCircle className="h-4 w-4" />
        ),
      };
    }

    return {
      label: "REVIEW",
      className:
        "bg-yellow-100 text-yellow-700",
      icon: (
        <Clock className="h-4 w-4" />
      ),
    };
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">

        <div className="text-center">

          <Building2 className="mx-auto h-14 w-14 animate-pulse text-blue-600" />

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            {t("loadingGuardianDashboard")}
          </h2>

          <p className="mt-2 text-slate-500">
            {t("verifyingSecureSession")}
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* BACK */}

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-semibold text-slate-500 transition hover:text-slate-900"
        >

          <ArrowLeft className="h-4 w-4" />

          {t("back")} to Dashboard

        </Link>

        {/* HERO */}

        <div className="mt-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-700 p-8 text-white shadow-xl md:p-12">

          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-center">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold">

                <Building2 className="h-4 w-4" />

                PLACEMENT OFFICER VIEW

              </div>

              <h1 className="mt-6 text-4xl font-black md:text-5xl">

                College Recruitment
                <br />

                Intelligence Center

              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">

                Monitor verified recruiters, identify
                suspicious opportunities and help students
                make safer career decisions.

              </p>

            </div>

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">

              <p className="text-sm font-bold text-blue-100">

                RECRUITERS MONITORED

              </p>

              <p className="mt-3 text-5xl font-black">

                {stats?.totalRecruiters || 0}

              </p>

              <p className="mt-2 text-sm text-blue-100">

                Companies from live verification data

              </p>

              <button
                onClick={() =>
                  loadDashboard(true)
                }
                disabled={refreshing}
                className="mt-5 flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-bold text-blue-700 transition hover:scale-105 disabled:opacity-60"
              >

                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh Data"}

              </button>

            </div>

          </div>

        </div>

        {/* STATISTICS */}

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={
              <Building2 className="h-7 w-7 text-blue-600" />
            }
            value={
              stats?.totalRecruiters || 0
            }
            label="Total Recruiters"
          />

          <StatCard
            icon={
              <ShieldCheck className="h-7 w-7 text-green-600" />
            }
            value={
              stats?.safeRecruiters || 0
            }
            label="Safe Recruiters"
          />

          <StatCard
            icon={
              <AlertTriangle className="h-7 w-7 text-yellow-600" />
            }
            value={
              stats?.suspiciousRecruiters || 0
            }
            label="Require Review"
          />

          <StatCard
            icon={
              <ShieldAlert className="h-7 w-7 text-red-600" />
            }
            value={
              stats?.scamRecruiters || 0
            }
            label="High Risk Alerts"
          />

        </div>

        {/* TRUST SCORE */}

        <div className="mt-8 rounded-3xl bg-white p-7 shadow-sm">

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div className="flex items-center gap-5">

              <div className="rounded-2xl bg-blue-100 p-4">

                <TrendingUp className="h-7 w-7 text-blue-600" />

              </div>

              <div>

                <p className="text-sm font-bold text-slate-500">

                  AVERAGE RECRUITER TRUST SCORE

                </p>

                <h2 className="mt-1 text-4xl font-black text-slate-900">

                  {stats?.averageTrustScore || 0}%

                </h2>

              </div>

            </div>

            <div className="w-full max-w-md">

              <div className="h-4 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-700"
                  style={{
                    width: `${
                      stats?.averageTrustScore || 0
                    }%`,
                  }}
                />

              </div>

            </div>

          </div>

        </div>

        {/* RECRUITER DIRECTORY */}

        <div className="mt-12">

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

            <div>

              <div className="flex items-center gap-3">

                <Users className="h-7 w-7 text-blue-600" />

                <h2 className="text-3xl font-black text-slate-900">

                  Recruiter Directory

                </h2>

              </div>

              <p className="mt-2 text-slate-500">

                Live companies automatically collected from
                CareerGuardian AI verification activity.

              </p>

            </div>

          </div>

          {/* SEARCH + FILTER */}

          <div className="mt-8 flex flex-col gap-4 lg:flex-row">

            <div className="relative flex-1">

              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search company or job role..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-5 outline-none transition focus:border-blue-500"
              />

            </div>

            <div className="flex flex-wrap gap-3">

              {[
                "ALL",
                "SAFE",
                "SUSPICIOUS",
                "SCAM",
              ].map((item) => (

                <button
                  key={item}
                  onClick={() =>
                    setFilter(item)
                  }
                  className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
                    filter === item
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                  }`}
                >

                  {item === "ALL"
                    ? "All"
                    : item === "SUSPICIOUS"
                    ? "Review"
                    : item === "SCAM"
                    ? "High Risk"
                    : "Safe"}

                </button>

              ))}

            </div>

          </div>

          {/* COMPANY CARDS */}

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {filteredCompanies.map(
              (company) => {

                const status =
                  getStatusStyle(
                    company.status
                  );

                return (

                  <div
                    key={company._id}
                    className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">

                        <Building2 className="h-7 w-7 text-blue-600" />

                      </div>

                      <div
                        className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black ${status.className}`}
                      >

                        {status.icon}

                        {status.label}

                      </div>

                    </div>

                    <h3 className="mt-6 text-2xl font-black text-slate-900">

                      {company.company}

                    </h3>

                    <p className="mt-2 font-semibold text-blue-600">

                      {company.jobRole}

                    </p>

                    {/* TRUST */}

                    <div className="mt-6 rounded-2xl bg-slate-50 p-4">

                      <div className="flex items-center justify-between">

                        <p className="text-sm font-semibold text-slate-500">

                          Trust Score

                        </p>

                        <p className="text-lg font-black text-slate-900">

                          {company.trustScore}%

                        </p>

                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

                        <div
                          className={`h-full rounded-full ${
                            company.trustScore >= 80
                              ? "bg-green-500"
                              : company.trustScore >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${company.trustScore}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* DETAILS */}

                    <div className="mt-6 space-y-3 text-sm">

                      {company.website && (

                        <div className="flex items-center gap-3 text-slate-600">

                          <Globe className="h-4 w-4 text-slate-400" />

                          <span className="truncate">

                            {company.website}

                          </span>

                        </div>

                      )}

                      {company.email && (

                        <div className="flex items-center gap-3 text-slate-600">

                          <Mail className="h-4 w-4 text-slate-400" />

                          <span className="truncate">

                            {company.email}

                          </span>

                        </div>

                      )}

                      {company.phone && (

                        <div className="flex items-center gap-3 text-slate-600">

                          <Phone className="h-4 w-4 text-slate-400" />

                          <span>

                            {company.phone}

                          </span>

                        </div>

                      )}

                    </div>

                    {/* ACTIVITY */}

                    <div className="mt-6 border-t border-slate-100 pt-5">

                      <p className="text-sm text-slate-500">

                        Verified activity

                      </p>

                      <p className="mt-1 text-lg font-black text-slate-900">

                        {company.verificationCount} verification
                        {company.verificationCount !== 1
                          ? "s"
                          : ""}

                      </p>

                    </div>

                  </div>

                );
              }
            )}

          </div>

          {/* EMPTY */}

          {filteredCompanies.length === 0 && (

            <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm">

              <Search className="mx-auto h-12 w-12 text-slate-300" />

              <h3 className="mt-5 text-xl font-bold text-slate-900">

                No recruiters found

              </h3>

              <p className="mt-2 text-slate-500">

                Try changing your search or filter.

              </p>

            </div>

          )}

        </div>

      </section>

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

      <div className="flex items-center justify-between">

        <div>

          <p className="text-3xl font-black text-slate-900">

            {value}

          </p>

          <p className="mt-2 font-semibold text-slate-500">

            {label}

          </p>

        </div>

        <div className="rounded-2xl bg-slate-50 p-3">

          {icon}

        </div>

      </div>

    </div>
  );
}