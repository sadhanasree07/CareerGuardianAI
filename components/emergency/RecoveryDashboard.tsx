"use client";

import { useState } from "react";

import {
  ShieldAlert,
  Building2,
  IndianRupee,
  Phone,
  Calendar,
  CreditCard,
  FileText,
  FolderOpen,
  Landmark,
  TriangleAlert,
  AlertTriangle,
} from "lucide-react";

import { BANKS } from "@/app/data/banks";

interface RecoveryReport {
  companyName?: string;
  recruiterName?: string;
  recruiterPhone?: string;
  recruiterEmail?: string;
  contactMethod?: string;
  amountPaid?: number;
  paymentMethod?: string;
  paymentDate?: string;
  scamDescription?: string;
}

interface Props {
  report: RecoveryReport;
  onComplaint: () => void;
  onEvidence: () => void;
}

export default function RecoveryDashboard({
  report,
  onComplaint,
  onEvidence,
}: Props) {

  const [bank, setBank] =
    useState<keyof typeof BANKS>("SBI");

  const bankData = BANKS[bank];

  const recoveryProgress = 20;

  function call1930() {

    window.location.href = "tel:1930";

  }

  function notifyBank() {

    window.open(
      bankData.website,
      "_blank"
    );

  }

  return (

    <section className="space-y-8">

      {/* Emergency Header */}

      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-red-900 via-red-700 to-red-500 text-white shadow-2xl">

        <div className="p-10">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-5 py-3">

                <TriangleAlert className="h-7 w-7 text-yellow-300"/>

                <span className="font-bold">

                  EMERGENCY MODE ACTIVATED

                </span>

              </div>

              <h1 className="mt-8 text-5xl font-black">

                Recovery In Progress

              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-red-100">

                Guardian AI has detected a recruitment scam.

                Complete every emergency step immediately to maximize the chance of recovering your money.

              </p>

            </div>

            <div className="rounded-3xl bg-white/10 p-8 backdrop-blur">

              <p className="text-red-100">

                Recovery Progress

              </p>

              <h2 className="mt-3 text-5xl font-black">

                {recoveryProgress}%

              </h2>

            </div>

          </div>

          <div className="mt-10">

            <div className="flex justify-between text-sm">

              <span>

                Emergency Workflow

              </span>

              <span>

                {recoveryProgress}%

              </span>

            </div>

            <div className="mt-3 h-4 rounded-full bg-red-900">

              <div

                className="h-4 rounded-full bg-yellow-400 transition-all"

                style={{

                  width: `${recoveryProgress}%`,

                }}

              />

            </div>

          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">

            <button

              onClick={call1930}

              className="rounded-2xl bg-white py-5 text-lg font-bold text-red-700 transition hover:scale-105"

            >

              📞 Call 1930

            </button>

            <button

              onClick={notifyBank}

              className="rounded-2xl bg-yellow-400 py-5 text-lg font-bold text-black transition hover:scale-105"

            >

              🏦 Notify Bank

            </button>

            <button

              onClick={onComplaint}

              className="rounded-2xl bg-black py-5 text-lg font-bold text-white transition hover:scale-105"

            >

              📄 Generate Complaint

            </button>

          </div>

        </div>

      </div>
            {/* Recovery Summary */}

      <div className="grid gap-6 lg:grid-cols-2">

        <InfoCard
          icon={<Building2 className="h-7 w-7 text-blue-600" />}
          title="Scam Company"
          value={report.companyName || "-"}
        />

        <InfoCard
          icon={<IndianRupee className="h-7 w-7 text-red-600" />}
          title="Money Lost"
          value={`₹ ${report.amountPaid || 0}`}
        />

        <InfoCard
          icon={<Phone className="h-7 w-7 text-green-600" />}
          title="Recruiter Phone"
          value={report.recruiterPhone || "-"}
        />

        <InfoCard
          icon={<CreditCard className="h-7 w-7 text-purple-600" />}
          title="Payment Method"
          value={report.paymentMethod || "-"}
        />

        <InfoCard
          icon={<Calendar className="h-7 w-7 text-orange-600" />}
          title="Payment Date"
          value={report.paymentDate || "-"}
        />

        <InfoCard
          icon={<Phone className="h-7 w-7 text-cyan-600" />}
          title="Contact Method"
          value={report.contactMethod || "-"}
        />

      </div>

      {/* AI Bank Recovery Assistant */}

      <div className="rounded-3xl bg-white p-8 shadow-xl">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-3xl font-bold">

              🏦 AI Bank Recovery Assistant

            </h2>

            <p className="mt-2 text-slate-500">

              Select your bank to instantly receive official fraud recovery information.

            </p>

          </div>

        </div>

        <div className="mt-8">

          <label className="font-semibold">

            Select Your Bank

          </label>

          <select

            value={bank}

            onChange={(e)=>

              setBank(
                e.target.value as keyof typeof BANKS
              )

            }

            className="mt-3 w-full rounded-2xl border border-slate-300 p-4"

          >

            {Object.keys(BANKS).map((item)=>(

              <option
                key={item}
                value={item}
              >

                {item}

              </option>

            ))}

          </select>

        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">

          <BankCard
            title="Fraud Helpline"
            value={bankData.helpline}
            color="blue"
          />

          <BankCard
            title="Fraud Email"
            value={bankData.fraudEmail}
            color="red"
          />

          <BankCard
            title="Official Website"
            value={bankData.website}
            color="green"
          />

          <div className="rounded-2xl bg-yellow-50 p-6">

            <h3 className="font-bold text-yellow-700">

              🚨 Report Fraud

            </h3>

            <button

              onClick={notifyBank}

              className="mt-5 rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black transition hover:bg-yellow-600"

            >

              Open Official Bank Website

            </button>

          </div>

        </div>

      </div>
            {/* Guardian AI Emergency Action Plan */}

      <div className="rounded-3xl bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 p-8 shadow-xl">

        <div className="flex items-center gap-4">

          <AlertTriangle className="h-10 w-10 text-red-600"/>

          <div>

            <h2 className="text-3xl font-bold text-red-700">

              🤖 Guardian AI Emergency Action Plan

            </h2>

            <p className="mt-2 text-slate-600">

              Based on your recovery information, Guardian AI has prepared the following emergency response workflow.

            </p>

          </div>

        </div>

        <div className="mt-10 space-y-5">

          <EmergencyStep

            step="1"

            title="Immediately Contact Cyber Crime"

            description="Call National Cyber Helpline (1930) immediately to report this recruitment scam."

            status="HIGH PRIORITY"

            color="red"

          />

          <EmergencyStep

            step="2"

            title={`Notify ${bank} Bank`}

            description="Request transaction freeze and report fraudulent payment."

            status="URGENT"

            color="orange"

          />

          <EmergencyStep

            step="3"

            title="Generate AI Complaint"

            description="Guardian AI has already prepared a professional cyber complaint."

            status="READY"

            color="blue"

          />

          <EmergencyStep

            step="4"

            title="Secure Your Evidence"

            description="Keep screenshots, payment proof, chats, offer letters and emails safely."

            status="IMPORTANT"

            color="purple"

          />

          <EmergencyStep

            step="5"

            title="Visit Cyber Crime Police"

            description="If required, visit the nearest Cyber Crime Police Station with all evidence."

            status="NEXT STEP"

            color="green"

          />

        </div>

      </div>

    </section>

  );

}

function BankCard({
  title,
  value,
  color,
}: any) {

  const bg =
    color === "blue"
      ? "bg-blue-50"
      : color === "red"
      ? "bg-red-50"
      : "bg-green-50";

  return (

    <div className={`${bg} rounded-2xl p-6`}>

      <h3 className="font-bold">

        {title}

      </h3>

      <p className="mt-3 break-all">

        {value}

      </p>

    </div>

  );

}

function InfoCard({
  icon,
  title,
  value,
}: any) {

  return (

    <div className="rounded-2xl border bg-white p-6 shadow">

      <div className="flex items-center gap-3">

        {icon}

        <h3 className="font-semibold">

          {title}

        </h3>

      </div>

      <h2 className="mt-4 text-2xl font-bold">

        {value}

      </h2>

    </div>

  );

}

function StatusCard({
  title,
  status,
  icon,
  color,
}: any) {

  const bg =
    color === "green"
      ? "bg-green-50"
      : color === "blue"
      ? "bg-blue-50"
      : "bg-orange-50";

  return (

    <div className={`${bg} rounded-3xl p-8`}>

      {icon}

      <h3 className="mt-5 text-2xl font-bold">

        {title}

      </h3>

      <p className="mt-2">

        {status}

      </p>

    </div>

  );

}

function MiniCard({
  title,
  value,
}: any) {

  return (

    <div className="rounded-2xl bg-white/10 p-6 text-center">

      <p className="text-blue-100">

        {title}

      </p>

      <h2 className="mt-4 text-3xl font-black">

        {value}

      </h2>

    </div>

  );

}

function EmergencyStep({ step, title, description, status, color }: any) {
  const border =
    color === "red"
      ? "border-red-200"
      : color === "orange"
      ? "border-orange-200"
      : color === "blue"
      ? "border-blue-200"
      : color === "purple"
      ? "border-purple-200"
      : "border-green-200";

  return (
    <div className={`rounded-2xl border ${border} bg-white p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Step {step}</p>
          <h3 className="mt-2 text-xl font-bold">{title}</h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">{status}</p>
        </div>
      </div>
      <p className="mt-4 text-slate-600">{description}</p>
    </div>
  );
}