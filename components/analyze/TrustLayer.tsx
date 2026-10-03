"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";

interface TrustLayerProps {
  title: string;
  description: string;
  status: "pending" | "running" | "completed";
  passed?: boolean;
  message?: string;
  state?: string;
}

export default function TrustLayer({
  title,
  description,
  status,
  passed,
  message,
  state,
}: TrustLayerProps) {
  const label = state === "HIGH_RISK" ? "HIGH RISK" : state === "NOT_PROVIDED" ? "NOT PROVIDED" : state === "NOT_APPLICABLE" ? "N/A" : state === "NOT_DETECTED" ? "NOT DETECTED" : state === "NOT_VERIFIED" ? "NOT VERIFIED" : state === "REVIEW" ? "REVIEW" : passed ? "PASS" : "NOT VERIFIED";
  const positive = state === "PASS" || (!state && passed);
  const risk = state === "HIGH_RISK";
  return (
    <div className={`rounded-2xl border p-5 shadow-sm transition-all duration-500 ${
      status === "running"
        ? "border-cyan-300 bg-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.16)]"
        : status === "completed"
        ? positive
          ? "border-emerald-200 bg-emerald-50/80"
          : risk ? "border-red-200 bg-red-50/80" : "border-amber-200 bg-amber-50/80"
        : "border-slate-200 bg-white/80"
    }`}>

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-4">

          {status === "completed" &&
            (positive ? (
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            ) : risk ? (
              <XCircle className="h-7 w-7 text-red-600" />
            ) : (
              <span className="h-7 w-7 rounded-full border-2 border-amber-500" />
            ))}

          {status === "running" && (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-lg shadow-cyan-600/25">
              <Loader2 className="h-5 w-5 animate-spin" />
            </span>
          )}

          {status === "pending" && (
            <div className="h-7 w-7 rounded-full border-2 border-slate-300" />
          )}

          <div className="min-w-0">

            <h3 className="font-semibold text-slate-900">
              {title}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {status === "completed"
                ? message
                : description}
            </p>

          </div>

        </div>

        {status === "completed" && (
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              positive
                ? "bg-green-100 text-green-700"
                : risk ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
            }`}
          >
            {label}
          </span>
        )}

        {status === "running" && (
          <span className="rounded-full bg-cyan-600 px-3 py-1 text-sm font-semibold text-white shadow-sm">
            Running
          </span>
        )}

        {status === "pending" && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-500">
            Waiting
          </span>
        )}

      </div>

    </div>
  );
}
