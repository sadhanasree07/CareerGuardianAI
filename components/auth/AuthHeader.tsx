"use client";

import { ShieldCheck, Sparkles } from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";

export default function AuthHeader() {
  const { t } = useLanguage();
  return (
    <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 p-5 text-white shadow-xl sm:p-10">

      <div className="flex items-center gap-4 sm:gap-5">

        <div className="shrink-0 rounded-2xl bg-white/20 p-3 sm:p-4">

          <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10" />

        </div>

        <div className="min-w-0 flex-1">

          <h1 className="break-words text-2xl font-bold sm:text-4xl">

            {t("auth.welcome")}

          </h1>

          <p className="mt-2 text-lg text-blue-100">

            {t("auth.secureAccess")}

          </p>

        </div>

      </div>

      <div className="mt-6 rounded-2xl bg-white/10 p-4 sm:mt-8 sm:p-6">

        <div className="flex items-start gap-3">

          <Sparkles className="mt-0.5 h-6 w-6 shrink-0 text-yellow-300" />

          <p className="min-w-0 break-words">

            {t("auth.featureAccess")}

          </p>

        </div>

      </div>

    </div>
  );
}
