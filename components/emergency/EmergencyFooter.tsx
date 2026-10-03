"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  Phone,
  Globe,
  Heart,
} from "lucide-react";

export default function EmergencyFooter() {
  return (
    <footer className="mt-16 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">

      <div className="mx-auto max-w-7xl px-8 py-12">

        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand */}

          <div>

            <div className="flex items-center gap-3">

              <div className="rounded-2xl bg-red-600 p-3">

                <ShieldCheck className="h-6 w-6" />

              </div>

              <div>

                <h2 className="text-xl font-bold">

                  CareerGuardian AI

                </h2>

                <p className="text-sm text-slate-300">

                  Raise a Complaint

                </p>

              </div>

            </div>

            <p className="mt-5 text-sm leading-7 text-slate-300">

              Protecting students from fake recruitment
              scams through AI-powered detection,
              recovery guidance and cyber safety.

            </p>

          </div>

          {/* Services */}

          <div>

            <h3 className="mb-4 text-lg font-semibold">

              Services

            </h3>

            <ul className="space-y-3 text-sm text-slate-300">

              <li>AI Scam Detection</li>

              <li>Complaint Generator</li>

              <li>Evidence Locker</li>

              <li>Recovery Assistance</li>

              <li>Legal Guidance</li>

            </ul>

          </div>

          {/* Emergency */}

          <div>

            <h3 className="mb-4 text-lg font-semibold">

              Emergency Help

            </h3>

            <div className="space-y-4">

              <div className="flex items-center gap-3">

                <Phone className="h-5 w-5 text-red-400" />

                <span>Cyber Helpline : 1930</span>

              </div>

              <div className="flex items-center gap-3">

                <Mail className="h-5 w-5 text-red-400" />

                <span>
                  support@careerguardian.ai
                </span>

              </div>

              <div className="flex items-center gap-3">

                <Globe className="h-5 w-5 text-red-400" />

                <span>
                  www.careerguardian.ai
                </span>

              </div>

            </div>

          </div>

          {/* Quick Links */}

          <div>

            <h3 className="mb-4 text-lg font-semibold">

              Quick Links

            </h3>

            <div className="flex flex-col gap-3">

              <Link
                href="/"
                className="hover:text-red-400"
              >
                Home
              </Link>

              <Link
                href="/analyze"
                className="hover:text-red-400"
              >
                Analyze Recruitment
              </Link>

              <Link
                href="/dashboard"
                className="hover:text-red-400"
              >
                Dashboard
              </Link>

              <Link
                href="/profile"
                className="hover:text-red-400"
              >
                My Profile
              </Link>

            </div>

          </div>

        </div>

        {/* Bottom */}

        <div className="mt-10 border-t border-slate-700 pt-6">

          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">

            <p className="text-sm text-slate-400">

              © 2026 CareerGuardian AI.
              All Rights Reserved.

            </p>

            <div className="flex items-center gap-2 text-sm text-slate-400">

              Made with

              <Heart className="h-4 w-4 fill-red-500 text-red-500" />

              for Student Safety

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
}