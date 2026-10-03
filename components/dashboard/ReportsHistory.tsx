"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  FileText,
  Star,
  Eye,
  Trash2,
} from "lucide-react";

export default function ReportsHistory() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const res = await fetch("/api/reports/history");

      const json = await res.json();

      if (json.success) {
        setReports(json.reports);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-10 shadow">
        <h2 className="text-xl font-semibold">
          Loading Reports...
        </h2>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-bold">

            My AI Reports

          </h2>

          <p className="mt-2 text-slate-500">

            All your AI analyses are stored here.

          </p>

        </div>

        <span className="rounded-full bg-blue-100 px-4 py-2 font-semibold text-blue-700">

          {reports.length} Reports

        </span>

      </div>

      {reports.length === 0 ? (

        <div className="mt-12 text-center">

          <FileText className="mx-auto h-14 w-14 text-slate-300" />

          <h3 className="mt-4 text-2xl font-bold">

            No Reports Yet

          </h3>

          <p className="mt-2 text-slate-500">

            Generate a Career DNA, Resume, Placement or
            Recruitment report to see it here.

          </p>

        </div>

      ) : (

        <div className="mt-8 space-y-5">

          {reports.map((report) => (

            <div
              key={report._id}
              className="rounded-2xl border border-slate-200 p-6 hover:border-blue-500 transition"
            >

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <h3 className="text-xl font-bold">

                    {report.title}

                  </h3>

                  <p className="mt-2 text-slate-500">

                    {report.module}

                  </p>

                  <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-500">

                    <div className="flex items-center gap-2">

                      <Calendar className="h-4 w-4" />

                      {new Date(
                        report.createdAt
                      ).toLocaleDateString()}

                    </div>

                    <div className="flex items-center gap-2">

                      <Star className="h-4 w-4 text-yellow-500" />

                      Score: {report.score}

                    </div>

                  </div>

                </div>

                <div className="flex gap-3">

                  <button
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white"
                  >

                    <Eye className="h-5 w-5" />

                    View

                  </button>

                  <button
                    className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-white"
                  >

                    <Trash2 className="h-5 w-5" />

                    Delete

                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}