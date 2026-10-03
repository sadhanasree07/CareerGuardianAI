"use client";

import {
  ShieldCheck,
  BrainCircuit,
  FileText,
  Mic2,
  Trophy,
  CheckCircle2,
} from "lucide-react";

interface Props {
  verificationCompleted: boolean;
  careerCompleted: boolean;
  resumeCompleted: boolean;
  interviewCompleted: boolean;
}

export default function ActivityTimeline({
  verificationCompleted,
  careerCompleted,
  resumeCompleted,
  interviewCompleted,
}: Props) {

  const timeline = [

    {
      title: "Recruitment Verified",
      description:
        "Guardian AI verified the recruitment notification.",
      completed: verificationCompleted,
      icon: <ShieldCheck className="h-6 w-6" />,
    },

    {
      title: "Career DNA Generated",
      description:
        "AI analyzed your career readiness.",
      completed: careerCompleted,
      icon: <BrainCircuit className="h-6 w-6" />,
    },

    {
      title: "ATS Resume Created",
      description:
        "Guardian Resume Studio generated your resume.",
      completed: resumeCompleted,
      icon: <FileText className="h-6 w-6" />,
    },

    {
      title: "Interview Completed",
      description:
        "Guardian Interview AI evaluated your interview.",
      completed: interviewCompleted,
      icon: <Mic2 className="h-6 w-6" />,
    },

    {
      title: "Placement Ready",
      description:
        "Complete all modules to become placement ready.",
      completed:
        verificationCompleted &&
        careerCompleted &&
        resumeCompleted &&
        interviewCompleted,
      icon: <Trophy className="h-6 w-6" />,
    },

  ];

  return (

    <section className="rounded-3xl bg-white p-8 shadow-xl">

      <h2 className="text-3xl font-black">

        Guardian Journey

      </h2>

      <p className="mt-2 text-slate-500">

        Your complete placement progress.

      </p>

      <div className="mt-10">

        {timeline.map((item, index) => (

          <div
            key={item.title}
            className="relative flex gap-6 pb-10 last:pb-0"
          >

            {/* Timeline Line */}

            {index !== timeline.length - 1 && (

              <div className="absolute left-5 top-12 h-full w-1 bg-slate-200"/>

            )}

            {/* Icon */}

            <div
              className={`z-10 flex h-12 w-12 items-center justify-center rounded-full text-white ${
                item.completed
                  ? "bg-green-600"
                  : "bg-slate-400"
              }`}
            >

              {item.icon}

            </div>

            {/* Content */}

            <div className="flex-1 rounded-2xl border border-slate-200 p-6">

              <div className="flex items-center justify-between">

                <h3 className="text-xl font-bold">

                  {item.title}

                </h3>

                {item.completed ? (

                  <span className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">

                    <CheckCircle2 className="h-4 w-4"/>

                    Completed

                  </span>

                ) : (

                  <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">

                    Pending

                  </span>

                )}

              </div>

              <p className="mt-4 leading-7 text-slate-600">

                {item.description}

              </p>

            </div>

          </div>

        ))}

      </div>

    </section>

  );

}