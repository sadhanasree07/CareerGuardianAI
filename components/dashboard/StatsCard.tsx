"use client";

import { LucideIcon, TrendingUp } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  color: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Top Color Line */}

      <div
        className={`absolute left-0 top-0 h-1 w-full ${color}`}
      />

      {/* Icon */}

      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 transition group-hover:scale-110">

        <Icon className="h-7 w-7 text-slate-700" />

      </div>

      {/* Value */}

      <h2 className="text-4xl font-bold text-slate-900">
        {value}
      </h2>

      {/* Title */}

      <h3 className="mt-2 text-lg font-semibold text-slate-800">
        {title}
      </h3>

      {/* Subtitle */}

      <p className="mt-2 text-sm text-slate-500">
        {subtitle}
      </p>

      {/* Footer */}

      <div className="mt-6 flex items-center gap-2 text-sm text-green-600">

        <TrendingUp className="h-4 w-4" />

        <span>Live AI Analytics</span>

      </div>

    </div>
  );
}