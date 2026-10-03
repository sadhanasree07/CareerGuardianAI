"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  Clock3,
  BellRing,
  ShieldAlert,
  Users,
  Loader2,
} from "lucide-react";

function getTimeAgo(date: string) {
  const now = new Date();

  const reportDate =
    new Date(date);

  const diff =
    now.getTime() -
    reportDate.getTime();

  const minutes =
    Math.floor(diff / 60000);

  if (minutes < 60) {
    return `${minutes} minutes ago`;
  }

  const hours =
    Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hours ago`;
  }

  const days =
    Math.floor(hours / 24);

  return `${days} days ago`;
}

function getRiskStyle(level: string) {
  if (level === "HIGH") {
    return {
      color:
        "bg-red-100 text-red-600",

      border:
        "border-red-200",
    };
  }

  if (level === "MEDIUM") {
    return {
      color:
        "bg-orange-100 text-orange-600",

      border:
        "border-orange-200",
    };
  }

  return {
    color:
      "bg-yellow-100 text-yellow-700",

    border:
      "border-yellow-200",
  };
}

export default function CommunityAlerts() {
  const [alerts, setAlerts] =
    useState<any[]>([]);

  const [statistics, setStatistics] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const response =
          await fetch(
            "/api/community-alerts",
            {
              cache: "no-store",
            }
          );

        const result =
          await response.json();

        if (result.success) {
          setAlerts(
            result.alerts || []
          );

          setStatistics(
            result.statistics
          );
        }

      } catch (error) {
        console.error(
          "Community alert error:",
          error
        );

      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, []);

  return (
    <section className="mt-16 rounded-3xl bg-gradient-to-br from-orange-50 via-white to-red-50 p-10 shadow-xl">

      {/* HEADER */}

      <div className="text-center">

        <span className="rounded-full bg-red-100 px-5 py-2 text-sm font-semibold text-red-600">

          PEOPLE POWER SCAM LIST

        </span>

        <h2 className="mt-5 text-4xl font-bold text-slate-900">

          Community Scam Alerts

        </h2>

        <p className="mt-3 text-slate-600">

          Scam reports submitted by the
          CareerGuardian community.

          Companies are not automatically
          labeled as scams based on a
          single report.

        </p>

      </div>

      {/* LOADING */}

      {loading && (

        <div className="mt-12 flex justify-center">

          <Loader2 className="h-10 w-10 animate-spin text-red-600" />

        </div>

      )}

      {/* EMPTY STATE */}

      {!loading &&
        alerts.length === 0 && (

          <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">

            <ShieldAlert className="mx-auto h-12 w-12 text-green-500" />

            <h3 className="mt-4 text-xl font-bold text-slate-900">

              No Community Reports Yet

            </h3>

            <p className="mt-2 text-slate-500">

              The community has not submitted
              any suspicious recruitment reports.

            </p>

          </div>

        )}

      {/* ALERT CARDS */}

      <div className="mt-12 space-y-6">

        {alerts.map((alert) => {

          const style =
            getRiskStyle(
              alert.level
            );

          return (

            <div
              key={alert.company}
              className={`rounded-3xl border bg-white p-6 shadow transition hover:shadow-xl ${style.border}`}
            >

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div className="flex items-start gap-4">

                  <div className="rounded-2xl bg-red-100 p-4">

                    <ShieldAlert className="h-7 w-7 text-red-600" />

                  </div>

                  <div>

                    <h3 className="text-xl font-bold text-slate-900">

                      {alert.company}

                    </h3>

                    <p className="mt-2 text-slate-600">

                      {alert.description ||
                        "Community members reported suspicious recruitment activity related to this organization."}

                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Location: {alert.location || "Not provided"} · Categories: {(alert.categories || []).join(", ") || "Not specified"}
                    </p>

                    {/* REPORT COUNT */}

                    <div className="mt-4 flex flex-wrap items-center gap-4">

                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">

                        <Users className="h-4 w-4" />

                        {alert.reportCount}

                        {" "}

                        Community Reports

                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-500">

                        <Clock3 className="h-4 w-4" />

                        Latest:

                        {" "}

                        {getTimeAgo(
                          alert.latestReport
                        )}

                      </div>

                    </div>

                  </div>

                </div>

                {/* COMMUNITY LEVEL */}

                <div>

                  <span
                    className={`rounded-full px-5 py-2 text-sm font-bold ${style.color}`}
                  >

                    {alert.level === "HIGH"
                      ? "🔴 HIGH RISK"
                      : alert.level === "MEDIUM"
                      ? "🟡 COMMUNITY WARNING"
                      : "🟢 LOW REPORTS"}

                  </span>

                </div>

              </div>

              {/* IMPORTANT DISCLAIMER */}

              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">

                <strong className="text-slate-700">

                  Community Confidence:

                </strong>

                {" "}

                {alert.reportCount >= 6
                  ? "Multiple independent community reports detected. Extra caution is recommended."
                  : alert.reportCount >= 3
                  ? "Several community reports detected. Verify carefully before proceeding."
                  : "Limited community reports. This is not a confirmed scam classification."}

              </div>

            </div>

          );
        })}

      </div>

      {/* INFORMATION */}

      <div className="mt-12 rounded-3xl bg-gradient-to-r from-red-600 to-orange-500 p-8 text-white">

        <div className="flex items-center gap-4">

          <BellRing className="h-10 w-10" />

          <div>

            <h3 className="text-2xl font-bold">

              Community Intelligence,
              Stronger Protection

            </h3>

            <p className="mt-2 text-red-100">

              Reports from students help others
              identify potentially suspicious
              recruitment activity.

            </p>

          </div>

        </div>

      </div>

      {/* DYNAMIC STATISTICS */}

      <div className="mt-12 grid gap-6 md:grid-cols-3">

        <div className="rounded-2xl bg-white p-6 text-center shadow">

          <AlertTriangle className="mx-auto h-10 w-10 text-red-600" />

          <h2 className="mt-4 text-3xl font-bold text-red-600">

            {statistics?.totalReports || 0}

          </h2>

          <p className="mt-2 text-slate-600">

            Community Reports

          </p>

        </div>

        <div className="rounded-2xl bg-white p-6 text-center shadow">

          <ShieldAlert className="mx-auto h-10 w-10 text-orange-600" />

          <h2 className="mt-4 text-3xl font-bold text-orange-600">

            {statistics?.communityWarnings || 0}

          </h2>

          <p className="mt-2 text-slate-600">

            Community Warnings

          </p>

        </div>

        <div className="rounded-2xl bg-white p-6 text-center shadow">

          <BellRing className="mx-auto h-10 w-10 text-green-600" />

          <h2 className="mt-4 text-3xl font-bold text-green-600">

            {statistics?.highRiskCompanies || 0}

          </h2>

          <p className="mt-2 text-slate-600">

            High Risk Companies

          </p>

        </div>

      </div>

    </section>
  );
}