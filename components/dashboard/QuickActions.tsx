"use client";

import Link from "next/link";
import {
  ShieldCheck,
  BrainCircuit,
  FileText,
  Mic2,
  LayoutDashboard,
  ArrowRight,
  Building2,
} from "lucide-react";

import { useLanguage } from "@/src/context/LanguageContext";

export default function QuickActions({ premiumUnlocked = false }: { premiumUnlocked?: boolean }) {
  const { t } = useLanguage();

  const actions = [
    {
      title: t("verifyRecruitment"),
      description: t("verifyRecruitmentDescription"),
      href: "/verify",
      icon: ShieldCheck,
      color: "from-green-500 to-emerald-600",
    },
    {
      title: t("aiMentor"),
      description: "Get personalized career guidance from Guardian AI.",
      href: "/ai-mentor",
      icon: BrainCircuit,
      color: "from-cyan-600 to-teal-500",
    },
    {
      title: t("resumeStudio"),
      description: t("resumeStudioDescription"),
      href: "/resume-builder",
      icon: FileText,
      color: "from-violet-600 to-purple-600",
    },
    {
      title: t("interviewAI"),
      description: t("interviewDescription"),
      href: "/interview",
      icon: Mic2,
      color: "from-orange-500 to-red-500",
    },
    {
      title: t("collegeDashboardTitle"),
      description: t("collegeDashboardDescription"),
      href: "/college-dashboard",
      icon: Building2,
      color: "from-indigo-600 to-blue-600",
    },
  ];

  return (

    <section className="rounded-3xl bg-white p-8 shadow-xl">

      <div className="flex items-center gap-3">

        <LayoutDashboard className="h-8 w-8 text-blue-600"/>

        <h2 className="text-3xl font-black">

          {t("quickActions")}

        </h2>

      </div>

      <p className="mt-3 text-slate-500">

        Quickly access every Guardian AI module.

      </p>

<div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-6">
        {actions.filter((action) => premiumUnlocked || action.href !== "/ai-mentor").map((action) => {

          const Icon = action.icon;

          return (

            <Link
              key={action.title}
              href={action.href}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >

              <div
                className={`inline-flex rounded-2xl bg-gradient-to-r ${action.color} p-4 text-white`}
              >

                <Icon className="h-8 w-8"/>

              </div>

              <h3 className="mt-6 text-2xl font-bold">

                {action.title}

              </h3>

              <p className="mt-3 leading-7 text-slate-600">

                {action.description}

              </p>

              <div className="mt-6 flex items-center gap-2 font-semibold text-blue-600">

                {t("openModule")}

                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-2"/>

              </div>

            </Link>

          );

        })}

      </div>

    </section>

  );

}