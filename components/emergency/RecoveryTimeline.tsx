"use client";

import {
  FileSearch,
  FileText,
  ShieldCheck,
  Landmark,
  CheckCircle2,
  Clock3,
} from "lucide-react";

function buildTimeline(data: any, emergency: any) {
  const created = data?.createdAt ? new Date(data.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--";

  if (data?.status === "SAFE") {
    return [
      { title: "Recruitment Verified", description: "Guardian Verify confirmed the recruitment is authentic.", time: created, status: "Completed", icon: ShieldCheck, color: "bg-green-100 text-green-600" },
      { title: "Career DNA Generated", description: "Your profile has been matched with the verified recruitment.", time: "Completed", status: "Completed", icon: FileSearch, color: "bg-blue-100 text-blue-600" },
      { title: "Resume Ready", description: "Guardian AI generated your ATS Resume.", time: "Completed", status: "Completed", icon: FileText, color: "bg-indigo-100 text-indigo-600" },
      { title: "Interview Practice", description: "AI Interview completed successfully.", time: "Completed", status: "Completed", icon: CheckCircle2, color: "bg-green-100 text-green-600" },
      { title: "Ready To Apply", description: "You are now ready to apply confidently.", time: "Now", status: "Completed", icon: CheckCircle2, color: "bg-green-100 text-green-600" },
    ];
  }

  return [
    { title: "Scam Detected", description: "Guardian AI detected suspicious recruitment activity.", time: created, status: "Completed", icon: FileSearch, color: "bg-red-100 text-red-600" },
    { title: "Questionnaire Complete", description: emergency ? "Your recovery answers have been captured and used to personalize the dashboard." : "The recovery questionnaire is ready to complete.", time: emergency ? "Completed" : "Pending", status: emergency ? "Completed" : "Pending", icon: ShieldCheck, color: emergency ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600" },
    { title: "Complaint Generated", description: "Cyber Crime complaint prepared automatically.", time: "Ready", status: "Completed", icon: FileText, color: "bg-green-100 text-green-600" },
    { title: "Bank Notified", description: emergency?.bank ? `The recovery flow is targeting ${emergency.bank} fraud support.` : "Freeze suspicious transactions immediately.", time: emergency?.bank ? "In Progress" : "Pending", status: emergency?.bank ? "In Progress" : "Pending", icon: Landmark, color: emergency?.bank ? "bg-yellow-100 text-yellow-600" : "bg-slate-100 text-slate-600" },
    { title: "Recovery Process", description: "Cyber Crime investigation and recovery.", time: "Pending", status: "Pending", icon: Clock3, color: "bg-slate-100 text-slate-600" },
  ];
}

interface Props {
  data: any;
  emergency?: any;
}

export default function RecoveryTimeline({ data, emergency }: Props) {
  if (!data) return null;

  const timeline = buildTimeline(data, emergency);

  return (
    <section className="mt-16 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-10 shadow-xl">
      <div className="text-center">
        <span className="rounded-full bg-indigo-100 px-5 py-2 text-sm font-semibold text-indigo-700">RECOVERY TIMELINE</span>
        <h2 className="mt-5 text-4xl font-bold text-slate-900">Recovery Journey</h2>
        <p className="mt-3 text-slate-600">Track every important milestone from scam detection to successful recovery.</p>
      </div>

      <div className="relative mt-14">
        <div className="absolute left-8 top-0 h-full w-1 rounded-full bg-slate-200" />
        <div className="space-y-10">
          {timeline.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative flex gap-6">
                <div className={`z-10 flex h-16 w-16 items-center justify-center rounded-full ${step.color}`}>
                  <Icon className={`h-8 w-8 ${step.status === "In Progress" ? "animate-pulse" : ""}`} />
                </div>
                <div className="flex-1 rounded-3xl bg-white p-6 shadow-lg">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{step.title}</h3>
                      <p className="mt-2 text-slate-600">{step.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{step.time}</p>
                      <span className={`mt-2 inline-block rounded-full px-4 py-2 text-sm font-semibold ${step.status === "Completed" ? "bg-green-100 text-green-700" : step.status === "In Progress" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-600"}`}>
                        {step.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-14 rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <CheckCircle2 className="h-10 w-10" />
          <div>
            <h2 className="text-3xl font-bold">Recovery Status</h2>
            <p className="mt-3 leading-8 text-indigo-100">
              {data.status === "SAFE"
                ? `Guardian Verify confirmed that ${data.company} is a trusted recruitment. Continue building your Career DNA and prepare for interviews.`
                : `Guardian AI detected multiple scam indicators in ${data.company}. Preserve all evidence, contact your bank immediately, and report the incident through Cyber Crime (1930).`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}