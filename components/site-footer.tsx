"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  ArrowRight,
  Globe,
  Mail,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";

export function SiteFooter() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <footer className="mt-24">

      {/* CTA */}

      {pathname !== "/" && <section className="mx-auto max-w-7xl px-6">

        <div className="overflow-hidden rounded-[40px] bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 px-10 py-20 text-center text-white shadow-2xl">

          <div className="mx-auto max-w-4xl">

            <div className="mb-8 flex justify-center">

              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20">

                <ShieldCheck className="h-10 w-10" />

              </div>

            </div>

            <h2 className="text-5xl font-bold leading-tight">

              {t("footer.ctaTitle")}

            </h2>

            <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-blue-100">

              {t("footer.ctaDescription")}

            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-5">

              <Link href="/analyze">

                <button className="rounded-full bg-white px-10 py-5 text-lg font-bold text-blue-700 transition duration-300 hover:scale-105 hover:shadow-xl">

                  {t("footer.analyzeRecruitment")}

                  <ArrowRight className="ml-2 inline h-5 w-5" />

                </button>

              </Link>

              <Link href="/signup">

                <button className="rounded-full border border-white px-10 py-5 text-lg font-bold transition duration-300 hover:bg-white hover:text-blue-700">

                  {t("footer.createAccount")}

                </button>

              </Link>

            </div>

          </div>

        </div>

      </section>}

      {/* Footer */}

      <div className="mt-20 border-t border-slate-200 bg-white">

        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">

          {/* Logo */}

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white">

                <ShieldCheck className="h-6 w-6" />

              </div>

              <div>

                <h3 className="text-2xl font-bold">

                  CareerGuardian AI

                </h3>

                <p className="text-sm text-slate-500">

                  {t("footer.platformTagline")}

                </p>

              </div>

            </div>

            <p className="mt-6 leading-8 text-slate-600">

              {t("footer.mission")}

            </p>

          </div>

          {/* Platform */}

          <div>

            <h3 className="mb-5 text-lg font-bold">

              {t("footer.platform")}

            </h3>

            <ul className="space-y-3 text-slate-600">

              <li>{t("footer.trustEngine")}</li>

              <li>{t("careerDNA")}</li>

              <li>{t("footer.resumeIntelligence")}</li>

              <li>{t("footer.placementPredictor")}</li>

              <li>{t("footer.aiMentor")}</li>

              <li>{t("footer.opportunityRadar")}</li>

            </ul>

          </div>

          {/* Features */}

          <div>

            <h3 className="mb-5 text-lg font-bold">

              {t("footer.aiFeatures")}

            </h3>

            <ul className="space-y-3 text-slate-600">

              <li>{t("footer.ocr")}</li>

              <li>{t("footer.scamDetection")}</li>

              <li>{t("footer.governmentVerification")}</li>

              <li>{t("footer.companyValidation")}</li>

              <li>{t("footer.aiRecommendations")}</li>

            </ul>

          </div>

          {/* Contact */}

          <div>

            <h3 className="mb-5 text-lg font-bold">

              {t("footer.connect")}

            </h3>

            <div className="space-y-4">

              <a
                href="#"
                className="flex items-center gap-3 text-slate-600 transition hover:text-blue-600"
              >

                <Globe className="h-5 w-5" />

                {t("footer.website")}

              </a>

              <a
                href="mailto:support@careerguardian.ai"
                className="flex items-center gap-3 text-slate-600 transition hover:text-blue-600"
              >

                <Mail className="h-5 w-5" />

                {t("footer.emailSupport")}

              </a>

              <a
                href="#"
                className="flex items-center gap-3 text-slate-600 transition hover:text-blue-600"
              >

                <ExternalLink className="h-5 w-5" />

                {t("footer.documentation")}

              </a>

            </div>

          </div>

        </div>

        <div className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">

          © 2026 CareerGuardian AI • {t("footer.copyrightTagline")}

        </div>

      </div>

    </footer>
  );
}