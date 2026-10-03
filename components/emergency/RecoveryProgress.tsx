"use client";

import {
  CheckCircle2,
  Clock3,
  FileText,
  Landmark,
  ShieldCheck,
  Loader2,
} from "lucide-react";

interface Props {
  data: any;
  emergency?: any;
}

function buildProgress(data: any, emergency: any) {
  if (data?.status === "SAFE") {
    return [
      { title: "Recruitment Verified", status: "Completed", icon: ShieldCheck, color: "text-green-600", bg: "bg-green-100" },
      { title: "Career DNA Generated", status: "Completed", icon: FileText, color: "text-green-600", bg: "bg-green-100" },
      { title: "Resume Generated", status: "Completed", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
      { title: "Interview Completed", status: "Completed", icon: Loader2, color: "text-green-600", bg: "bg-green-100" },
      { title: "Ready To Apply", status: "Completed", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
    ];
  }

  return [
    { title: "Scam Detected", status: "Completed", icon: ShieldCheck, color: "text-red-600", bg: "bg-red-100" },
    { title: "Questionnaire Complete", status: emergency ? "Completed" : "In Progress", icon: FileText, color: emergency ? "text-green-600" : "text-blue-600", bg: emergency ? "bg-green-100" : "bg-blue-100" },
    { title: "Evidence Prepared", status: emergency?.hasProof === "Yes" || emergency?.hasEvidence === "Yes" ? "Completed" : "Pending", icon: ShieldCheck, color: emergency?.hasProof === "Yes" || emergency?.hasEvidence === "Yes" ? "text-green-600" : "text-amber-600", bg: emergency?.hasProof === "Yes" || emergency?.hasEvidence === "Yes" ? "bg-green-100" : "bg-amber-100" },
    { title: "Bank Notification", status: emergency?.bank ? "Completed" : "Pending", icon: Landmark, color: emergency?.bank ? "text-green-600" : "text-orange-600", bg: emergency?.bank ? "bg-green-100" : "bg-orange-100" },
    { title: "Cyber Crime Review", status: "In Progress", icon: Loader2, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Case Resolution", status: "Pending", icon: Clock3, color: "text-slate-500", bg: "bg-slate-100" },
  ];
}

export default function RecoveryProgress({
  data,
  emergency,
}: Props) {

  if (!data) {

    return (

      <section className="mt-16 rounded-3xl bg-white p-10 text-center shadow-xl">

        <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />

        <h2 className="mt-5 text-2xl font-bold">

          Loading Recovery Progress...

        </h2>

      </section>

    );

  }

  const progress = buildProgress(data, emergency);

  const completedSteps = progress.filter(
    (item) => item.status === "Completed"
  ).length;

  const percentage = Math.round(
    (completedSteps / progress.length) * 100
  );

  const progressColor =
    data.status === "SAFE"
      ? "bg-gradient-to-r from-green-500 to-emerald-600"
      : "bg-gradient-to-r from-red-500 to-orange-500";

  const badgeColor =
    data.status === "SAFE"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
      return (

<section
  className={`mt-16 rounded-3xl p-10 shadow-xl ${
    data.status === "SAFE"
      ? "bg-gradient-to-br from-green-50 via-white to-emerald-50"
      : "bg-gradient-to-br from-red-50 via-white to-orange-50"
  }`}
>

  {/* Header */}

  <div className="text-center">

    <span
      className={`rounded-full px-5 py-2 text-sm font-semibold ${
        data.status === "SAFE"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >

      {data.status === "SAFE"
        ? "CAREER PROGRESS"
        : "RECOVERY TRACKER"}

    </span>

    <h2 className="mt-5 text-4xl font-bold text-slate-900">

      {data.status === "SAFE"
        ? "Career Journey"
        : "Scam Recovery Progress"}

    </h2>

    <p className="mt-3 text-slate-600">

      {data.status === "SAFE"

        ? "Track your complete career preparation journey."

        : "Track every stage of your recovery process."}

    </p>

  </div>

  {/* Progress */}

  <div className="mt-12 rounded-3xl bg-white p-8 shadow-lg">

    <div className="flex items-center justify-between">

      <h3 className="text-2xl font-bold">

        Overall Progress

      </h3>

      <span
        className={`rounded-full px-5 py-2 font-bold ${badgeColor}`}
      >

        {percentage}%

      </span>

    </div>

    <div className="mt-6 h-5 rounded-full bg-slate-200">

      <div

        className={`h-5 rounded-full ${progressColor}`}

        style={{
          width: `${percentage}%`,
        }}

      />

    </div>

  </div>

  {/* Timeline */}

  <div className="mt-12 space-y-6">

    {progress.map((item, index) => {

      const Icon = item.icon;

      return (

        <div key={item.title}>

          <div className="flex items-center gap-5 rounded-3xl bg-white p-6 shadow-lg">

            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.bg}`}
            >

              <Icon
                className={`h-8 w-8 ${item.color} ${
                  item.status === "In Progress"
                    ? "animate-spin"
                    : ""
                }`}
              />

            </div>

            <div className="flex-1">

              <h3 className="text-xl font-bold">

                {item.title}

              </h3>

              <p className="mt-2 text-slate-500">

                {item.status}

              </p>

            </div>

            {item.status === "Completed" && (

              <CheckCircle2 className="h-8 w-8 text-green-600" />

            )}

          </div>

          {index !== progress.length - 1 && (

            <div className="ml-8 h-8 w-1 bg-slate-300" />

          )}

        </div>

      );

    })}

  </div>
    {/* AI Recommendation */}

  <div
    className={`mt-12 rounded-3xl p-8 text-white shadow-xl ${
      data.status === "SAFE"
        ? "bg-gradient-to-r from-green-600 to-emerald-500"
        : "bg-gradient-to-r from-red-600 to-orange-500"
    }`}
  >

    <h2 className="text-2xl font-bold">

      🤖 Guardian AI Recommendation

    </h2>

    <p className="mt-5 leading-8">

      {data.status === "SAFE"

        ? `Guardian AI successfully verified ${data.company} as a trusted recruitment. Your career preparation is progressing well. Continue improving your technical skills, complete your resume, practice interviews, and apply confidently through the official recruitment portal.`

        : `Guardian AI detected multiple scam indicators in ${data.company}. Preserve all available evidence including payment receipts, emails, offer letters, and chat history. Immediately contact your bank, report the incident through Cyber Crime Helpline (1930), and submit your AI-generated complaint for investigation.`}

    </p>

    <div className="mt-8 grid gap-4 md:grid-cols-2">

      <div className="rounded-2xl bg-white/10 p-5">

        <h3 className="font-bold">

          Company

        </h3>

        <p className="mt-2">

          {data.company}

        </p>

      </div>

      <div className="rounded-2xl bg-white/10 p-5">

        <h3 className="font-bold">

          Current Status

        </h3>

        <p className="mt-2">

          {data.status}

        </p>

      </div>

      <div className="rounded-2xl bg-white/10 p-5">

        <h3 className="font-bold">

          Trust Score

        </h3>

        <p className="mt-2">

          {data.trustScore}%

        </p>

      </div>

      <div className="rounded-2xl bg-white/10 p-5">

        <h3 className="font-bold">

          Recommended Action

        </h3>

        <p className="mt-2">

          {data.status === "SAFE"

            ? "Continue Career Preparation"

            : "Report to Cyber Crime"}

        </p>

      </div>

    </div>

  </div>

</section>

);
}