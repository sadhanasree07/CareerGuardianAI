"use client";

import { useEffect, useRef, useState } from "react";

import { useLanguage } from "@/src/context/LanguageContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ProgressCards from "@/components/dashboard/ProgressCards";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import GuardianInsights from "@/components/dashboard/GuardianInsights";
import QuickActions from "@/components/dashboard/QuickActions";
import Link from "next/link";
import { Trophy, ExternalLink, MapPin } from "lucide-react";

export default function DashboardPage() {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState<any>(null);
  const [premiumStatus, setPremiumStatus] = useState<{ credits: number; premiumUnlocked: boolean } | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const hasLoadedRef = useRef(false);

  useEffect(() => {

    if (hasLoadedRef.current) return;

    hasLoadedRef.current = true;
    loadDashboard();
    fetch("/api/premium/status", { cache: "no-store", credentials: "same-origin" })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (result?.success) {
          setPremiumStatus({ credits: Number(result.credits) || 0, premiumUnlocked: Boolean(result.premiumUnlocked) });
        }
      })
      .catch(() => undefined);
    fetch("/api/jobs/recommendations", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((result) => setRecommendedJobs((result?.jobs || []).slice(0, 4))).catch(() => undefined);

  }, []);

  async function loadDashboard() {

    try {

      const response = await fetch("/api/dashboard", {
        credentials: "same-origin",
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Your session has expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        throw new Error(`Dashboard request failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {

        setDashboard(result);

      }

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  }

  if (loading) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-slate-100">

        <div className="text-center">

          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

          <h1 className="text-3xl font-bold text-slate-900">

            {t("loadingGuardianDashboard")}

          </h1>

          <p className="mt-3 text-slate-600">

            {t("verifyingSecureSession")}

          </p>

        </div>

      </main>

    );

  }

  if (!dashboard) {

    return (

      <main className="flex min-h-screen items-center justify-center">

        <h1 className="text-3xl font-bold">

          {t("noDashboardDataFound")}

        </h1>

      </main>

    );

  }

  return (

    <main className="min-h-screen bg-slate-100">

      <section className="mx-auto max-w-7xl space-y-10 px-6 py-10">

        <DashboardHeader

          name={dashboard.career?.student?.name || "Student"}

          guardianScore={dashboard.guardianScore}

        />
        <Link
  href="/achievements"
  className="group block rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 p-6 text-white shadow-lg transition hover:scale-[1.02]"
>
  <div className="flex items-center justify-between">

    <div>

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
        <Trophy className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-2xl font-black">
        {t("skillBadges")}
      </h2>

      <p className="mt-2 text-white/80">
        {t("trackAchievements")}
      </p>

    </div>

    <span className="text-3xl transition group-hover:translate-x-1">
      →
    </span>

  </div>
</Link>

        <ProgressCards

          verificationScore={dashboard.verificationScore}

          careerScore={dashboard.careerScore}

          resumeScore={dashboard.resumeScore}

          interviewScore={dashboard.interviewScore}

          guardianScore={dashboard.guardianScore}

        />

        <section className="rounded-3xl border border-cyan-200 bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-700">CareerGuardian Premium</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                {premiumStatus?.premiumUnlocked ? "PREMIUM UNLOCKED" : "Unlock your Premium career hub"}
              </h2>
              <p className="mt-2 text-slate-600">
                {premiumStatus?.premiumUnlocked
                  ? "AI Mentor and Build Your Career are ready for you."
                  : `Earn 10 credits per valid verification. ${premiumStatus?.credits ?? "..."} of 100 credits collected.`}
              </p>
            </div>
            <Link
              href={premiumStatus?.premiumUnlocked ? "/ai-mentor" : "/verify"}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-cyan-800"
            >
              {premiumStatus?.premiumUnlocked ? "OPEN AI MENTOR" : "VERIFY TO EARN CREDITS"}
            </Link>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Premium unlock progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, premiumStatus?.credits ?? 0)}>
            <div className="h-full rounded-full bg-cyan-600 transition-all" style={{ width: `${Math.min(100, premiumStatus?.credits ?? 0)}%` }} />
          </div>
          <p className="mt-2 text-right text-sm font-semibold text-slate-500">{Math.min(100, premiumStatus?.credits ?? 0)} / 100 credits</p>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4"><div><p className="font-bold uppercase tracking-widest text-cyan-600">Career matches</p><h2 className="mt-1 text-3xl font-black text-slate-900">Recommended Opportunities</h2></div><Link href="/jobs" className="font-bold text-blue-600 hover:text-cyan-600">View All Opportunities</Link></div>
          {recommendedJobs.length === 0 ? <p className="mt-6 text-slate-500">Complete Career DNA to unlock matched openings.</p> : <div className="mt-6 grid gap-4 md:grid-cols-2">{recommendedJobs.map((job) => <div key={job._id} className="rounded-2xl border border-slate-100 p-5"><div className="flex justify-between gap-3"><div><p className="font-bold text-cyan-700">{job.company}</p><h3 className="mt-1 text-xl font-black text-slate-900">{job.jobTitle}</h3></div><span className="font-black text-emerald-600">{job.matchScore}%</span></div><p className="mt-3 flex items-center gap-1 text-sm text-slate-500"><MapPin className="h-4 w-4" />{job.location} • {job.employmentType}</p><button type="button" onClick={() => window.open(job.jobUrl, "_blank", "noopener,noreferrer")} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"><ExternalLink className="h-4 w-4" />View Opportunity</button></div>)}</div>}
        </section>
        

        <ActivityTimeline

          verificationCompleted={!!dashboard.verification}

          careerCompleted={!!dashboard.career}

          resumeCompleted={!!dashboard.resume}

          interviewCompleted={!!dashboard.interview}

        />

        <GuardianInsights

          insights={

            dashboard.career?.report?.weakAreas || []

          }

          companies={

            dashboard.career?.report?.recommendedCompanies || []

          }

          roadmap={

            dashboard.career?.report?.learningRoadmap?.map(

              (item: any) => `${item.week} - ${item.task}`

            ) || []

          }

        />

        <QuickActions premiumUnlocked={Boolean(premiumStatus?.premiumUnlocked)} />

      </section>

    </main>

  );

}