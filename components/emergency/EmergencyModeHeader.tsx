"use client";

import {
  AlertTriangle,
  PhoneCall,
  Landmark,
  FileText,
  ShieldAlert,
} from "lucide-react";

interface Props {
  data: any;
  emergency: any;
  onCall1930?: () => void;
  onNotifyBank?: () => void;
  onGenerateComplaint?: () => void;
}

export default function EmergencyModeHeader({
  data,
  emergency,
  onCall1930,
  onNotifyBank,
  onGenerateComplaint,
}: Props) {

  const trust = data?.trustScore || 0;

  const scamProbability = 100 - trust;

  return (

    <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-red-900 via-red-700 to-red-600 p-10 text-white shadow-2xl">

      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">

        {/* Left */}

        <div>

          <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-5 py-2">

            <ShieldAlert className="h-6 w-6 animate-pulse text-yellow-300" />

            <span className="font-bold">

              EMERGENCY MODE ACTIVATED

            </span>

          </div>

          <h1 className="mt-6 text-5xl font-black">

            Recovery In Progress

          </h1>

          <p className="mt-4 max-w-2xl text-red-100">

            Guardian AI has prepared your recovery workflow.

            Follow every step to maximize the chance of recovering your money.

          </p>

        </div>

        {/* Right */}

        <div className="grid gap-4 md:grid-cols-2">

          <Card

            title="Money Lost"

            value={`₹${emergency?.amount || "0"}`}

          />

          <Card

            title="Scam Probability"

            value={`${scamProbability}%`}

          />

          <Card

            title="Recruiter"

            value={data?.company || "-"}

          />

          <Card

            title="Status"

            value={data?.status || "-"}

          />

        </div>

      </div>

      {/* Actions */}

      <div className="mt-10 grid gap-4 md:grid-cols-3">

        <button
          type="button"
          onClick={onCall1930}
          className="flex items-center justify-center gap-3 rounded-2xl bg-white py-5 font-bold text-red-700"
        >

          <PhoneCall className="h-6 w-6"/>

          Call 1930

        </button>

        <button
          type="button"
          onClick={onNotifyBank}
          className="flex items-center justify-center gap-3 rounded-2xl bg-yellow-400 py-5 font-bold text-red-800"
        >

          <Landmark className="h-6 w-6"/>

          Notify Bank

        </button>

        <button
          type="button"
          onClick={onGenerateComplaint}
          className="flex items-center justify-center gap-3 rounded-2xl bg-black py-5 font-bold text-white"
        >

          <FileText className="h-6 w-6"/>

          Generate Complaint

        </button>

      </div>

    </section>

  );

}

function Card({

  title,

  value,

}:{

  title:string;

  value:string;

}){

  return(

    <div className="rounded-2xl bg-white/10 p-5">

      <p className="text-sm text-red-100">

        {title}

      </p>

      <h2 className="mt-2 text-3xl font-bold">

        {value}

      </h2>

    </div>

  );

}