"use client";

import {
  Brain,
  ShieldCheck,
  Activity,
  TrendingUp,
  Database,
  Cpu,
} from "lucide-react";

interface CommandCenterProps {
  total: number;
  latestScore: number;
  latestVerdict: string;
}

export default function CommandCenter({
  total,
  latestScore,
  latestVerdict,
}: CommandCenterProps) {
  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-8 text-white shadow-xl">

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

        {/* Left Side */}

        <div className="max-w-2xl">

          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">

            <Brain className="h-5 w-5" />

            <span className="font-semibold">
              CareerGuardian AI Command Center
            </span>

          </div>

          <h1 className="mt-6 text-4xl font-bold">
            Recruitment Intelligence Platform
          </h1>

          <p className="mt-4 text-blue-100 leading-7">
            Monitor AI-powered recruitment investigations,
            trust analysis, scam detection, verification engine
            and dashboard health in real time.
          </p>

        </div>

        {/* Right Side */}

        <div className="grid grid-cols-2 gap-4">

          <StatusCard
            icon={<Database className="h-6 w-6" />}
            title="Investigations"
            value={String(total)}
          />

          <StatusCard
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Latest Trust"
            value={`${latestScore}%`}
          />

          <StatusCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Verdict"
            value={latestVerdict}
          />

          <StatusCard
            icon={<Cpu className="h-6 w-6" />}
            title="AI Status"
            value="ONLINE"
          />

        </div>

      </div>

      {/* System Health */}

      <div className="mt-8 rounded-2xl bg-white/10 p-6 backdrop-blur">

        <div className="mb-5 flex items-center gap-2">

          <Activity className="h-5 w-5" />

          <h3 className="text-lg font-bold">
            System Health
          </h3>

        </div>

        <div className="grid gap-4 md:grid-cols-4">

          <HealthItem
            label="OCR Engine"
            status="Running"
          />

          <HealthItem
            label="Groq AI"
            status="Connected"
          />

          <HealthItem
            label="Verification"
            status="Healthy"
          />

          <HealthItem
            label="Dashboard API"
            status="Online"
          />

        </div>

      </div>

    </div>
  );
}

function StatusCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-5 backdrop-blur transition hover:bg-white/20">

      <div className="mb-3">
        {icon}
      </div>

      <p className="text-sm text-blue-100">
        {title}
      </p>

      <h2 className="mt-2 text-2xl font-bold break-words">
        {value}
      </h2>

    </div>
  );
}

function HealthItem({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <div className="rounded-xl bg-white/10 p-4">

      <div className="mb-3 flex items-center gap-2">

        <span className="h-3 w-3 rounded-full bg-green-400 animate-pulse"></span>

        <span className="font-semibold">
          {label}
        </span>

      </div>

      <p className="text-blue-100">
        {status}
      </p>

    </div>
  );
}