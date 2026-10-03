"use client";

import Link from "next/link";
import {
  ShieldAlert,
  FileText,
  FolderOpen,
  PhoneCall,
  Clock3,
  Bot,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";

const recoveryFeatures = [
  {
    icon: Bot,
    title: "AI Investigation",
    description: "AI asks intelligent questions to understand how the recruitment scam happened.",
  },
  {
    icon: FolderOpen,
    title: "Evidence Locker",
    description: "Store WhatsApp chats, offer letters, screenshots and payment proofs securely.",
  },
  {
    icon: FileText,
    title: "Complaint Generator",
    description: "Generate cyber crime complaint letters automatically.",
  },
  {
    icon: PhoneCall,
    title: "Emergency SOS",
    description: "Quick access to Cyber Helpline 1930 and emergency contacts.",
  },
];

export default function RecoverSection() {
  return (
    <section className="bg-slate-50 py-24">

      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="text-center">

          <span className="rounded-full bg-red-100 px-5 py-2 text-sm font-semibold text-red-700">

            RAISE A COMPLAINT

          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900">

            AI Emergency Recovery

          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">

            Report fraud, preserve evidence & start recovery.

          </p>

        </div>

        <div className="mt-20 grid gap-14 lg:grid-cols-2">

          {/* Left */}

          <div className="grid gap-5">

            {recoveryFeatures.map((feature) => {

              const Icon = feature.icon;

              return (

                <div
                  key={feature.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl"
                >

                  <div className="flex gap-5">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">

                      <Icon className="h-7 w-7 text-red-600" />

                    </div>

                    <div>

                      <h3 className="text-xl font-bold">

                        {feature.title}

                      </h3>

                      <p className="mt-2 leading-7 text-slate-600">

                        {feature.description}

                      </p>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

          {/* Right */}

          <div>

            <div className="rounded-[32px] bg-gradient-to-br from-red-600 to-orange-500 p-8 text-white shadow-2xl">

              <div className="flex items-center gap-3">

                <ShieldAlert className="h-10 w-10" />

                <div>

                  <h3 className="text-3xl font-bold">

                    Recovery Dashboard

                  </h3>

                  <p className="text-red-100">

                    Example Recovery Status

                  </p>

                </div>

              </div>

              <div className="mt-10 space-y-5">

                <Step
                  title="AI Investigation"
                  status="Completed"
                />

                <Step
                  title="Evidence Uploaded"
                  status="Completed"
                />

                <Step
                  title="Complaint Generated"
                  status="Ready"
                />

                <Step
                  title="Cyber Report"
                  status="Pending"
                />

                <Step
                  title="Recovery Progress"
                  status="In Progress"
                />

              </div>

              <div className="mt-10 rounded-2xl bg-white/10 p-5">

                <div className="flex items-center gap-3">

                  <Clock3 className="h-6 w-6" />

                  <span className="font-semibold">

                    AI Recommendation

                  </span>

                </div>

                <p className="mt-3 leading-7 text-red-100">

                  Report the incident immediately, preserve all evidence
                  and contact your bank if any payment has been made.

                </p>

              </div>

              <div className="mt-10 flex flex-wrap gap-4">

                <Link href="/emergency">

                  <button className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 font-semibold text-red-700">

                    Launch Recovery

                    <ArrowRight className="h-5 w-5" />

                  </button>

                </Link>

                <button className="flex items-center gap-3 rounded-2xl border border-white/30 px-6 py-4 font-semibold">

                  <PlayCircle className="h-5 w-5" />

                  Watch Demo

                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

function Step({
  title,
  status,
}: {
  title: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/10 p-5">

      <div className="flex items-center gap-3">

        <CheckCircle2 className="h-5 w-5" />

        <span>{title}</span>

      </div>

      <span className="font-semibold">

        {status}

      </span>

    </div>
  );
}