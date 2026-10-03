"use client";

import {
  Trophy,
  FileText,
  GitBranch,
  Cpu,
  MessageCircle,
  FolderKanban,
  Briefcase,
  GitBranch as GithubIcon,
} from "lucide-react";

interface Props {
  data: {
    readiness: number;
    resumeScore: number;
    githubScore: number;
    technicalScore: number;
    communicationScore: number;
    projectScore: number;
    hiringProbability: number;
  };
}

export default function ScoreDashboard({
  data,
}: Props) {

  const cards = [
    {
      title: "Resume Score",
      value: data.resumeScore,
      icon: <FileText className="h-7 w-7" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "GitHub Score",
      value: data.githubScore,
      icon: <GithubIcon className="h-7 w-7" />,
      color: "from-slate-700 to-slate-900",
    },
    {
      title: "Technical",
      value: data.technicalScore,
      icon: <Cpu className="h-7 w-7" />,
      color: "from-violet-500 to-purple-600",
    },
    {
      title: "Communication",
      value: data.communicationScore,
      icon: <MessageCircle className="h-7 w-7" />,
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Projects",
      value: data.projectScore,
      icon: <FolderKanban className="h-7 w-7" />,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Hiring Probability",
      value: data.hiringProbability,
      icon: <Briefcase className="h-7 w-7" />,
      color: "from-pink-500 to-rose-600",
    },
  ];

  return (

    <section className="space-y-8">

      {/* Main Readiness */}

      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-10 text-white shadow-2xl">

        <div className="flex items-center justify-between">

          <div>

            <div className="flex items-center gap-4">

              <Trophy className="h-12 w-12" />

              <div>

                <h2 className="text-4xl font-black">

                  Job Readiness

                </h2>

                <p className="mt-2 text-blue-100">

                  Guardian AI Overall Career Readiness

                </p>

              </div>

            </div>

          </div>

          <div className="text-center">

            <h1 className="text-7xl font-black">

              {data.readiness}%

            </h1>

          </div>

        </div>

      </div>

      {/* Score Cards */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {cards.map((card) => (

          <div
            key={card.title}
            className="rounded-3xl bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >

            <div
              className={`inline-flex rounded-2xl bg-gradient-to-r ${card.color} p-4 text-white`}
            >
              {card.icon}
            </div>

            <h3 className="mt-5 text-lg font-semibold">

              {card.title}

            </h3>

            <div className="mt-5">

              <div className="mb-2 flex justify-between">

                <span className="text-slate-500">

                  AI Score

                </span>

                <span className="font-bold text-blue-600">

                  {card.value}%

                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-200">

                <div
                  className={`h-full rounded-full bg-gradient-to-r ${card.color}`}
                  style={{
                    width: `${card.value}%`,
                  }}
                />

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>

  );

}