"use client";

import {
  Bot,
  PhoneCall,
  Mail,
  MessageCircle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

export default function HelpCenter() {
  return (
    <section className="mt-16 rounded-3xl bg-gradient-to-br from-red-50 via-white to-orange-50 p-10 shadow-xl">

      {/* Heading */}

      <div className="text-center">

        <span className="rounded-full bg-red-100 px-5 py-2 text-sm font-semibold text-red-600">

          SUPPORT CENTER

        </span>

        <h2 className="mt-5 text-4xl font-bold text-slate-900">

          Still Need Help?

        </h2>

        <p className="mt-3 text-slate-600">

          Our Emergency Support Center is always ready to
          guide you through recruitment scam recovery.

        </p>

      </div>

      {/* Cards */}

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

        {/* AI Assistant */}

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow transition hover:-translate-y-2 hover:shadow-2xl">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">

            <Bot className="h-7 w-7 text-blue-600" />

          </div>

          <h3 className="mt-5 text-xl font-bold">

            AI Recovery Assistant

          </h3>

          <p className="mt-3 text-slate-600">

            Ask questions and receive AI-powered guidance
            to recover from recruitment scams.

          </p>

          <button className="mt-6 flex items-center gap-2 font-semibold text-blue-600">

            Start Chat

            <ArrowRight className="h-4 w-4" />

          </button>

        </div>

        {/* Helpline */}

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow transition hover:-translate-y-2 hover:shadow-2xl">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">

            <PhoneCall className="h-7 w-7 text-red-600" />

          </div>

          <h3 className="mt-5 text-xl font-bold">

            Cyber Helpline

          </h3>

          <p className="mt-3 text-slate-600">

            Immediate support for cyber fraud victims.

          </p>

          <h1 className="mt-6 text-3xl font-bold text-red-600">

            1930

          </h1>

        </div>

        {/* Email */}

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow transition hover:-translate-y-2 hover:shadow-2xl">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">

            <Mail className="h-7 w-7 text-green-600" />

          </div>

          <h3 className="mt-5 text-xl font-bold">

            Email Support

          </h3>

          <p className="mt-3 text-slate-600">

            Send documents and receive assistance from our
            support team.

          </p>

          <p className="mt-5 font-semibold text-green-700">

            support@careerguardian.ai

          </p>

        </div>

        {/* Live Chat */}

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow transition hover:-translate-y-2 hover:shadow-2xl">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100">

            <MessageCircle className="h-7 w-7 text-purple-600" />

          </div>

          <h3 className="mt-5 text-xl font-bold">

            Live Chat

          </h3>

          <p className="mt-3 text-slate-600">

            Connect with a support executive for
            recruitment-related guidance.

          </p>

          <button className="mt-6 rounded-xl bg-purple-600 px-5 py-3 text-white transition hover:bg-purple-700">

            Chat Now

          </button>

        </div>

        {/* FAQ */}

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow transition hover:-translate-y-2 hover:shadow-2xl">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">

            <HelpCircle className="h-7 w-7 text-yellow-600" />

          </div>

          <h3 className="mt-5 text-xl font-bold">

            Frequently Asked Questions

          </h3>

          <ul className="mt-5 space-y-2 text-slate-600">

            <li>• How do I report a scam?</li>

            <li>• Can I recover my money?</li>

            <li>• What evidence should I keep?</li>

            <li>• How to contact Cyber Crime?</li>

          </ul>

        </div>

        {/* Expert Help */}

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-red-600 to-orange-500 p-7 text-white shadow-xl">

          <h3 className="text-2xl font-bold">

            Need Expert Assistance?

          </h3>

          <p className="mt-4 leading-7 text-red-100">

            Our recovery guidance helps students understand
            the next steps after detecting recruitment scams.

          </p>

          <button className="mt-8 rounded-xl bg-white px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50">

            Contact Expert

          </button>

        </div>

      </div>

    </section>
  );
}