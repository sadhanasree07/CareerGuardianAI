import Link from "next/link";
import {
  PlayCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  isLoggedIn: boolean;
}

export function HeroSection({
  isLoggedIn,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-white">

      {/* Background Glow */}

      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-44 -z-10 flex justify-center"
      >
        <div className="h-[520px] w-[1000px] rounded-full bg-gradient-to-r from-blue-200 via-cyan-100 to-violet-200 blur-3xl opacity-80" />
      </div>

      <div className="mx-auto max-w-screen-2xl px-6 pt-24 pb-20 lg:px-10">

        <div className="mx-auto max-w-5xl text-center">

          {/* Badge */}

          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-5 py-2 text-sm font-semibold text-blue-700 shadow-sm">

            <Sparkles className="h-4 w-4" />

            AI Recruitment Trust Engine (RTIM™)

          </span>

          {/* Heading */}

          <h1 className="mt-8 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 lg:text-6xl">

            Stop Fake Government

            <br />

            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 bg-clip-text text-transparent">

              Job & Internship Scams

            </span>

            <br />

            Before They Stop Your Career.

          </h1>

          {/* Subtitle */}

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-9 text-slate-600 lg:text-xl">

            Upload a recruitment notification, WhatsApp message,
            Telegram post, official website, PDF or email.

            <br />

            CareerGuardian AI investigates every recruitment using our

            <span className="font-semibold text-blue-700">

              {" "}Recruitment Trust Intelligence Matrix (RTIM™)

            </span>

            {" "}and instantly determines whether the opportunity is

            <span className="font-semibold text-green-600">

              {" "}genuine

            </span>

            {" "}or

            <span className="font-semibold text-red-600">

              {" "}fraudulent.

            </span>

          </p>

          {/* CTA Buttons */}

          <div className="mt-12 flex flex-wrap items-center justify-center gap-5">

  {isLoggedIn ? (

    <>
      <Link href="/dashboard">

        <Button
          size="lg"
          className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-6 text-lg font-semibold shadow-lg"
        >
          Dashboard
        </Button>

      </Link>

      <Link href="/analyze">

        <Button
          size="lg"
          variant="outline"
          className="rounded-full px-8 py-6 text-lg font-semibold"
        >
          Analyze Recruitment
        </Button>

      </Link>

    </>

  ) : (

    <>
      <Link href="/signup">

        <Button
          size="lg"
          className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-6 text-lg font-semibold shadow-lg"
        >
          Get Started
        </Button>

      </Link>

      <Link href="/login">

        <Button
          size="lg"
          variant="outline"
          className="rounded-full px-8 py-6 text-lg font-semibold"
        >
          Login
        </Button>

      </Link>

    </>

  )}

</div>

          {/* Highlights */}

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-600">

            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow">

              <ShieldCheck className="h-4 w-4 text-green-600" />

              Government Verification

            </div>

            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow">

              <ShieldCheck className="h-4 w-4 text-green-600" />

              AI Scam Detection

            </div>

            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow">

              <ShieldCheck className="h-4 w-4 text-green-600" />

              12-Layer Trust Score

            </div>

            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow">

              <ShieldCheck className="h-4 w-4 text-green-600" />

              Career Protection

            </div>

          </div>

        </div>

{/* Recruitment Trust Engine Preview */}

<div className="mx-auto mt-24 max-w-7xl">

  <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">

    {/* Header */}

    <div className="flex items-center justify-between border-b bg-gradient-to-r from-slate-50 to-white px-8 py-6">

      <div className="flex items-center gap-4">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg">

          <ShieldCheck className="h-6 w-6" />

        </div>

        <div>

          <h3 className="text-xl font-bold text-slate-900">

            Recruitment Trust Engine

          </h3>

          <p className="text-sm text-slate-500">

            AI Powered Investigation Dashboard

          </p>

        </div>

      </div>

      <span className="rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-700">

        ● LIVE ANALYSIS

      </span>

    </div>

    {/* Body */}

    <div className="bg-slate-50 p-8">

      {/* Cards */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Trust */}

        <div className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">

          <p className="text-sm text-slate-500">

            Recruitment Trust

          </p>

          <h2 className="mt-4 text-5xl font-bold text-green-600">

            96%

          </h2>

          <p className="mt-3 text-slate-500">

            Genuine Recruitment

          </p>

        </div>

        {/* Verification */}

        <div className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">

          <p className="text-sm text-slate-500">

            Government Portal

          </p>

          <h2 className="mt-4 text-4xl font-bold text-blue-600">

            VERIFIED

          </h2>

          <p className="mt-3 text-slate-500">

            Official Notification Found

          </p>

        </div>

        {/* Risk */}

        <div className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">

          <p className="text-sm text-slate-500">

            Scam Probability

          </p>

          <h2 className="mt-4 text-5xl font-bold text-red-500">

            4%

          </h2>

          <p className="mt-3 text-slate-500">

            Very Low Risk

          </p>

        </div>

      </div>

      {/* Progress */}

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

        <div className="mb-5 flex items-center justify-between">

          <span className="text-lg font-semibold">

            RTIM™ Investigation Progress

          </span>

          <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">

            92%

          </span>

        </div>

        <div className="h-4 overflow-hidden rounded-full bg-slate-200">

          <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600"></div>

        </div>

        {/* Analysis Grid */}

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          {[
            "OCR Analysis",
            "NLP Analysis",
            "Government Verification",
            "Domain Verification",
            "Email Verification",
            "Phone Verification",
            "QR Validation",
            "Timeline Analysis",
            "Company Registry",
            "Document Authenticity",
            "Salary Pattern",
            "Scam Intelligence",
          ].map((item) => (

            <div
              key={item}
              className="rounded-2xl border bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700 transition hover:bg-green-100"
            >

              ✅ {item}

            </div>

          ))}

        </div>

      </div>

    </div>

  </div>

</div>

      </div>

    </section>
  );
}