"use client";

import {
  ShieldCheck,
  ShieldAlert,
  BrainCircuit,
  ArrowRight,
} from "lucide-react";
import { BANKS } from "@/app/data/banks";
import { useState } from "react";
interface Props {
  data: any;
  onStart?: () => void;
}
export default function EmergencyBanner({
  data,
  onStart,
}: Props) {

  const safe = data?.status === "SAFE";

  return (

    <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 text-white shadow-2xl">

      <div className="flex flex-col gap-10 p-10 lg:flex-row lg:items-center lg:justify-between">

        {/* LEFT */}

        <div className="max-w-3xl">

          <div className="inline-flex items-center gap-3 rounded-full bg-white/20 px-5 py-2 backdrop-blur">

            <BrainCircuit className="h-6 w-6" />

            <span className="font-bold">

              Raise a Complaint

            </span>

          </div>

          <h2 className="mt-6 text-5xl font-extrabold">

            Recover From Recruitment Scams

          </h2>

          <p className="mt-5 text-lg leading-8 text-blue-100">

            Guardian AI guides victims through complaint filing,
            evidence collection, legal guidance and recovery.

          </p>

        </div>

        {/* RIGHT */}

        <div className="rounded-3xl bg-white/10 p-8 backdrop-blur-xl">

          <div className="flex items-center gap-4">

            {safe ? (

              <ShieldCheck className="h-12 w-12 text-green-300" />

            ) : (

              <ShieldAlert className="h-12 w-12 text-red-300" />

            )}

            <div>

              <p className="text-sm uppercase tracking-wider">

                Verification Status

              </p>

              <h2 className="text-4xl font-black">

                {data?.status || "UNKNOWN"}

              </h2>

            </div>

          </div>

          <div className="mt-8">

            <p className="text-sm text-blue-100">

              Trust Score

            </p>

            <h2 className="text-5xl font-bold">

              {data?.trustScore ?? 0}%

            </h2>

          </div>

        </div>

      </div>

      {/* Bottom */}

      <div className="border-t border-white/10 bg-black/10 p-8">

        <button

  onClick={onStart}

  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-5 text-lg font-bold text-blue-700 transition hover:scale-[1.02]"

>

  <ArrowRight className="h-6 w-6" />

  Raise a Complaint

</button>

      </div>
    
    </section>

  );

}