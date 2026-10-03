"use client";

import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Activity,
  BrainCircuit,
  ScanSearch,
} from "lucide-react";

export default function MainHero() {
  return (
    <section className="hero-command relative overflow-hidden">
      <div className="hero-command__grid" aria-hidden="true" />
      <div className="hero-command__beam hero-command__beam--one" aria-hidden="true" />
      <div className="hero-command__beam hero-command__beam--two" aria-hidden="true" />

      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="hero-copy">

          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-5 py-2">

            <ShieldCheck className="h-5 w-5 text-blue-600" />

            <span className="font-semibold text-blue-700">

              CareerGuardian AI Platform

            </span>

          </div>

          <h1 className="mt-8 text-5xl font-black leading-[0.98] tracking-tight text-white sm:text-7xl">

            Protect.

            <span className="text-cyan-300">

              Verify.

            </span>

            <br />

            Succeed.

          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">

            CareerGuardian AI protects students and job seekers
            from fake recruitment, internship scams and fraudulent
            job offers while helping them build successful careers.

          </p>

          <div className="mt-10 flex flex-wrap gap-4">

            <Link href="#ecosystem">

              <button className="flex items-center gap-3 rounded-2xl bg-cyan-300 px-8 py-4 text-lg font-bold text-slate-950 shadow-[0_0_35px_rgba(103,232,249,0.3)] transition hover:-translate-y-1 hover:bg-cyan-200">

                Get Started

                <ArrowRight className="h-5 w-5" />

              </button>

            </Link>

          </div>

          <div className="mt-12 flex flex-wrap gap-3 text-sm font-semibold text-slate-300"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2"><ShieldCheck className="h-4 w-4 text-emerald-300" />12-layer verification</span><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2"><BrainCircuit className="h-4 w-4 text-cyan-300" />AI career intelligence</span></div>

        </div>

        <div className="hero-console" aria-label="CareerGuardian AI live protection overview">
          <div className="hero-console__top"><span className="flex items-center gap-2 text-sm font-bold text-white"><span className="hero-live-dot" />GUARDIAN LIVE SYSTEM</span><span className="text-xs text-slate-400">RTIM / 12 LAYERS</span></div>
          <div className="hero-console__orb"><div className="hero-orbit hero-orbit--outer" /><div className="hero-orbit hero-orbit--inner" /><div className="hero-orb-core"><ShieldCheck className="h-12 w-12" /><span>TRUST<br />ENGINE</span></div><span className="hero-orb-label hero-orb-label--top">01 VERIFY</span><span className="hero-orb-label hero-orb-label--right">02 BUILD YOUR CAREER</span><span className="hero-orb-label hero-orb-label--bottom">03 RAISE A COMPLAINT</span></div>
          <div className="grid gap-3 sm:grid-cols-3"><div className="hero-metric"><ScanSearch className="h-4 w-4 text-cyan-300" /><strong>12</strong><span>active checks</span></div><div className="hero-metric"><Activity className="h-4 w-4 text-emerald-300" /><strong>LIVE</strong><span>risk signals</span></div><div className="hero-metric"><Sparkles className="h-4 w-4 text-amber-300" /><strong>AI</strong><span>career guidance</span></div></div>
        </div>

      </div>

    </section>
  );
}