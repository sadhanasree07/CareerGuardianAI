"use client";

import {
  ShieldCheck,
  BrainCircuit,
  FileText,
  Mic2,
  Trophy,
  ArrowRight,
} from "lucide-react";

interface Props {
  verificationScore: number;
  careerScore: number;
  resumeScore: number;
  interviewScore: number;
  guardianScore: number;
}

export default function ProgressCards({
  verificationScore,
  careerScore,
  resumeScore,
  interviewScore,
  guardianScore,
}: Props) {

  const cards = [

    {
      title: "Verified Recruitment",
      score: verificationScore,
      color: "from-green-500 to-emerald-600",
      icon: <ShieldCheck className="h-8 w-8" />,
      description: "Recruitment successfully verified",
    },

    {
      title: "Career DNA",
      score: careerScore,
      color: "from-blue-600 to-cyan-500",
      icon: <BrainCircuit className="h-8 w-8" />,
      description: "AI Career Intelligence Report",
    },

    {
      title: "ATS Resume",
      score: resumeScore,
      color: "from-violet-600 to-purple-600",
      icon: <FileText className="h-8 w-8" />,
      description: "Guardian Resume Studio",
    },

    {
      title: "Interview AI",
      score: interviewScore,
      color: "from-orange-500 to-red-500",
      icon: <Mic2 className="h-8 w-8" />,
      description: "Mock Interview Performance",
    },

    {
      title: "Placement Ready",
      score: guardianScore,
      color: "from-pink-500 to-rose-600",
      icon: <Trophy className="h-8 w-8" />,
      description: "Overall Guardian Score",
    },

  ];

  return (

    <section>

      <div className="mb-8">

        <h2 className="text-3xl font-black text-slate-900">

          Placement Progress

        </h2>

        <p className="mt-2 text-slate-500">

          Track your overall placement journey.

        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">

        {cards.map((card) => (

          <div
            key={card.title}
            className="rounded-3xl bg-white p-6 shadow-xl transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >

            <div
              className={`inline-flex rounded-2xl bg-gradient-to-r ${card.color} p-4 text-white`}
            >

              {card.icon}

            </div>

            <h3 className="mt-6 text-xl font-bold">

              {card.title}

            </h3>

            <p className="mt-2 text-sm text-slate-500">

              {card.description}

            </p>

            <h1 className="mt-8 text-5xl font-black">

              {card.score}%

            </h1>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">

              <div
                className={`h-full rounded-full bg-gradient-to-r ${card.color}`}
                style={{
                  width: `${card.score}%`,
                }}
              />

            </div>

            <button
              className="mt-6 flex items-center gap-2 font-semibold text-blue-600"
            >

              View Details

              <ArrowRight className="h-4 w-4"/>

            </button>

          </div>

        ))}

      </div>

    </section>

  );

}