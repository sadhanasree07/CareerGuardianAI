"use client";

import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface Investigation {
  company: string;
  trustScore: number;
  verdict: string;
  date: string;
}

export default function InvestigationTable() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setInvestigations(data.investigations || []);
      });
  }, []);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="mb-6 text-2xl font-bold">
        Recent Investigations
      </h2>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="py-4 text-left">Company</th>

              <th className="text-center">Trust</th>

              <th className="text-center">Status</th>

              <th className="text-right">Date</th>

            </tr>

          </thead>

          <tbody>

            {investigations.map((item, index) => (

              <tr
                key={index}
                className="border-b hover:bg-slate-50"
              >

                <td className="py-5 font-medium">
                  {item.company}
                </td>

                <td className="text-center font-bold">
                  {item.trustScore}%
                </td>

                <td className="text-center">

                  {item.verdict === "SAFE" && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                      <ShieldCheck className="h-4 w-4" />
                      SAFE
                    </span>
                  )}

                  {item.verdict === "SCAM" && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                      <XCircle className="h-4 w-4" />
                      SCAM
                    </span>
                  )}

                  {item.verdict === "SUSPICIOUS" && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                      <AlertTriangle className="h-4 w-4" />
                      REVIEW
                    </span>
                  )}

                </td>

                <td className="text-right text-slate-500">
                  {item.date}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}