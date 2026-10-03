"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

interface PremiumStatus {
  credits: number;
  premiumUnlocked: boolean;
}

export default function PremiumGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<PremiumStatus | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/premium/status", { cache: "no-store", credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Premium status unavailable");
        return response.json();
      })
      .then((result) => {
        if (active && result.success) {
          setStatus({ credits: Number(result.credits) || 0, premiumUnlocked: Boolean(result.premiumUnlocked) });
        }
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => { active = false; };
  }, []);

  if (failed) {
    return <main className="flex min-h-[60vh] items-center justify-center px-6"><p className="text-center font-semibold text-slate-700">Premium access could not be checked. Please refresh and try again.</p></main>;
  }

  if (!status) {
    return <main className="flex min-h-[60vh] items-center justify-center px-6"><p className="font-semibold text-slate-600">Checking Premium access...</p></main>;
  }

  if (!status.premiumUnlocked) {
    return (
      <main className="min-h-[60vh] px-6 py-16">
        <section className="mx-auto max-w-3xl border-y border-cyan-200 py-10">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-700">Premium access required</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Unlock your Premium career hub</h1>
          <p className="mt-3 text-slate-600">You have {status.credits} of 100 credits. Each valid verification earns 10 credits.</p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-cyan-600" style={{ width: `${Math.min(100, status.credits)}%` }} />
          </div>
          <Link href="/dashboard" className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-cyan-800">Return to dashboard</Link>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}