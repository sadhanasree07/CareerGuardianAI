import Link from "next/link";
import { ArrowRight, BrainCircuit } from "lucide-react";
import PremiumGate from "@/components/premium/PremiumGate";

export default function PremiumPage() {
  return (
    <PremiumGate>
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <section className="mx-auto max-w-6xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-700">PREMIUM UNLOCKED</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950">Your personal career assistant is ready.</h1>
          <p className="mt-3 max-w-2xl text-slate-600">Continue in AI Mentor to build your career profile, roadmap, and job-readiness plan.</p>
          <div className="mt-10 max-w-xl">
            <Link href="/ai-mentor" className="group block border border-slate-200 bg-white p-7 transition hover:border-cyan-500">
              <BrainCircuit className="h-8 w-8 text-cyan-700" />
              <h2 className="mt-5 text-2xl font-black text-slate-950">OPEN AI MENTOR</h2>
              <p className="mt-2 text-slate-600">Get personalized guidance based on your saved career context.</p>
              <span className="mt-6 inline-flex items-center gap-2 font-bold text-cyan-800">Open AI Mentor <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </Link>
          </div>
        </section>
      </main>
    </PremiumGate>
  );
}