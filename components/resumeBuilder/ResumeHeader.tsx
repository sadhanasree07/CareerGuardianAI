"use client";

import {
  FileText,
  Sparkles,
  ShieldCheck,
  BrainCircuit,
} from "lucide-react";

export default function ResumeHeader() {

  return (

    <section className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-10 text-white shadow-2xl">

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-5">

          <div className="rounded-3xl bg-white/20 p-5">

            <BrainCircuit className="h-12 w-12"/>

          </div>

          <div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">

              <ShieldCheck className="h-5 w-5"/>

              <span className="font-semibold">

                Guardian Resume Studio™

              </span>

            </div>

            <h1 className="text-5xl font-black">

              AI ATS Resume Generator

            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-blue-100">

              Guardian AI automatically creates an ATS-optimized resume
              by combining your verified recruitment, Career DNA,
              projects, skills and experience into a professional resume
              ready for recruiters.

            </p>

          </div>

        </div>

        <div className="rounded-3xl bg-white/15 p-6 backdrop-blur">

          <FileText className="mx-auto h-14 w-14"/>

          <h2 className="mt-4 text-center text-3xl font-black">

            ATS Ready

          </h2>

          <p className="mt-2 text-center text-blue-100">

            Optimized for recruiter screening systems.

          </p>

        </div>

      </div>

      <div className="mt-10 rounded-3xl bg-white/10 p-8 backdrop-blur">

        <div className="flex items-start gap-4">

          <Sparkles className="mt-1 h-7 w-7 text-yellow-300"/>

          <div>

            <h3 className="text-2xl font-bold">

              Guardian AI Resume Intelligence

            </h3>

            <p className="mt-3 leading-8 text-blue-100">

              ✓ Uses your verified recruitment to identify required skills.<br/>

              ✓ Uses your Career DNA report to improve your profile.<br/>

              ✓ Reorders projects and skills based on the target job.<br/>

              ✓ Generates an ATS-friendly professional summary.<br/>

              ✓ Improves resume keywords for maximum recruiter visibility.

            </p>

          </div>

        </div>

      </div>

    </section>

  );

}