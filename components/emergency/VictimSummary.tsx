"use client";

import type { ReactNode } from "react";
import {
  User,
  Building2,
  IndianRupee,
  Calendar,
  ShieldAlert,
  Phone,
  BadgeCheck,
  MapPin,
  Landmark,
  FileText,
} from "lucide-react";

interface Props {
  data: any;
  emergency?: any;
}

export default function VictimSummary({ data, emergency }: Props) {
  if (!data) {
    return (
      <section className="rounded-3xl bg-white p-10 text-center shadow">
        <h2 className="text-2xl font-bold">Loading Recovery Information...</h2>
      </section>
    );
  }

  const amount = emergency?.amount || data?.applicationFee || "No Payment";
  const bank = emergency?.bank || "SBI";
  const hasProof = emergency?.hasProof || "No";
  const hasEvidence = emergency?.hasEvidence || "No";
  const blocked = emergency?.blocked || "No";

  return (
    <section className="mt-16 rounded-3xl bg-gradient-to-br from-red-50 via-white to-orange-50 p-10 shadow-xl">
      <div className="text-center">
        <span className="rounded-full bg-red-100 px-5 py-2 text-sm font-semibold text-red-700">VICTIM SUMMARY</span>
        <h2 className="mt-5 text-4xl font-bold text-slate-900">Scam Investigation Summary</h2>
        <p className="mt-3 text-slate-600">Guardian AI is using your recovery questionnaire to generate a live emergency report.</p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card icon={<User className="h-8 w-8 text-blue-600" />} title="Victim" value={data?.victimName || "Guardian User"} />
        <Card icon={<Building2 className="h-8 w-8 text-purple-600" />} title="Fake Company" value={data?.fakeCompany || data?.company || "-"} />
        <Card icon={<IndianRupee className="h-8 w-8 text-red-600" />} title="Amount Lost" value={typeof amount === "number" ? `₹${amount}` : amount} />
        <Card icon={<Calendar className="h-8 w-8 text-green-600" />} title="Incident Date" value={data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : "-"} />
      </div>

      <div className="mt-12 rounded-3xl bg-white p-8 shadow-lg">
        <h3 className="mb-8 text-2xl font-bold">Recovery Details</h3>
        <div className="grid gap-8 lg:grid-cols-2">
          <Info icon={<ShieldAlert className="h-6 w-6 text-red-600" />} title="Scam Type" value={data?.jobRole || "Recruitment Scam"} />
          <Info icon={<Phone className="h-6 w-6 text-blue-600" />} title="Recruiter Contact" value={data?.phone || "Not Available"} />
          <Info icon={<BadgeCheck className="h-6 w-6 text-green-600" />} title="Current Status" value={data?.status || "-"} />
          <Info icon={<MapPin className="h-6 w-6 text-purple-600" />} title="Reported Location" value={data?.location || "Unknown"} />
          <Info icon={<Landmark className="h-6 w-6 text-indigo-600" />} title="Selected Bank" value={bank} />
          <Info icon={<FileText className="h-6 w-6 text-amber-600" />} title="Evidence Status" value={`${hasProof} proof • ${hasEvidence} evidence`} />
        </div>
      </div>

      <div className="mt-12 rounded-3xl bg-gradient-to-r from-red-600 to-orange-500 p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold">🤖 AI Summary</h2>
        <p className="mt-5 leading-8 text-red-100">
          Guardian AI analyzed the recruitment of <strong>{data?.company}</strong>. The current trust score is <strong>{data?.trustScore}%</strong> and the recovery workflow is active for <strong>{bank}</strong>.
          {blocked === "Yes" ? " The recruiter appears to have blocked communications, so legal and cyber-crime escalation is strongly recommended." : " The recovery plan is moving forward with evidence preservation and bank reporting."}
        </p>
      </div>
    </section>
  );
}

function Card({ icon, title, value }: { icon: ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-6 text-center shadow-lg">
      <div className="flex justify-center">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-slate-600">{title}</h3>
      <p className="mt-3 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Info({ icon, title, value }: { icon: ReactNode; title: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-5">
      <div>{icon}</div>
      <div>
        <h4 className="font-semibold text-slate-600">{title}</h4>
        <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}