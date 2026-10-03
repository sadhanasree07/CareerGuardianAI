"use client";

import Link from "next/link";
import {
  ShieldCheck,
  BrainCircuit,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

const layers = [
  {
    title: "Guardian Verify",
    subtitle: "Layer 1",
    description:
      "Detect fake jobs, internship scams and fraudulent recruitment using our 12-Layer AI Verification Engine.",
    button: "Explore Verify",
    href: "/analyze",
    color: "from-blue-600 to-cyan-500",
    bg: "bg-blue-50",
    icon: ShieldCheck,
  },
  {
    title: "Build Your Career",
    subtitle: "Layer 2",
    description:
      "Build your Career DNA, ATS Resume, Placement Readiness and AI-powered career roadmap.",
    button: "Build Your Career",
    href: "/career-dna",
    color: "from-emerald-600 to-green-500",
    bg: "bg-green-50",
    icon: BrainCircuit,
  },
  {
    title: "Raise a Complaint",
    subtitle: "Layer 3",
    description:
      "Report fraud, preserve evidence & start recovery.",
    button: "Raise a Complaint",
    href: "/emergency",
    color: "from-red-600 to-orange-500",
    bg: "bg-red-50",
    icon: ShieldAlert,
  },
];

export default function EcosystemSection() {
  return (
    <section
      id="ecosystem"
      className="bg-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">

          <span className="rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold text-blue-700">

            OUR AI ECOSYSTEM

          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900">

            One Platform.

            <br />

            Three Intelligent Solutions.

          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">

            CareerGuardian AI is built around three intelligent
            modules that protect, guide and support every student
            throughout their career journey.

          </p>

        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          {layers.map((layer) => {

            const Icon = layer.icon;

            return (

              <div
                key={layer.title}
                className={`rounded-[30px] ${layer.bg} border border-slate-200 p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl`}
              >

                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-r ${layer.color} text-white shadow-lg`}
                >

                  <Icon className="h-10 w-10" />

                </div>

                <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-slate-500">

                  {layer.subtitle}

                </p>

                <h3 className="mt-3 text-3xl font-bold text-slate-900">

                  {layer.title}

                </h3>

                <p className="mt-6 leading-8 text-slate-600">

                  {layer.description}

                </p>

                <Link href={layer.href}>

                  <button className="mt-10 flex items-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 font-semibold text-white transition hover:bg-blue-600">

                    {layer.button}

                    <ArrowRight className="h-5 w-5" />

                  </button>

                </Link>

              </div>

            );

          })}

        </div>

      </div>
    </section>
  );
}