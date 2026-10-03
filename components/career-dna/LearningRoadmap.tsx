"use client";

import {
  CalendarDays,
  CheckCircle2,
  Rocket,
} from "lucide-react";

interface RoadmapItem {
  week: string;
  task: string;
}

interface Props {
  roadmap: RoadmapItem[];
}

export default function LearningRoadmap({
  roadmap,
}: Props) {

  return (

    <section className="rounded-3xl bg-white p-8 shadow-xl">

      <div className="flex items-center gap-4">

        <div className="rounded-2xl bg-blue-100 p-4">

          <Rocket className="h-8 w-8 text-blue-600" />

        </div>

        <div>

          <h2 className="text-3xl font-bold">

            Guardian AI Learning Roadmap

          </h2>

          <p className="text-slate-500">

            Personalized weekly roadmap to improve your Career DNA.

          </p>

        </div>

      </div>

      <div className="mt-10 space-y-6">

        {roadmap.length > 0 ? (

          roadmap.map((item, index) => (

            <div
              key={index}
              className="flex gap-5 rounded-3xl border border-slate-200 p-6 transition hover:border-blue-300 hover:shadow-md"
            >

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">

                <CalendarDays className="h-7 w-7 text-blue-600" />

              </div>

              <div className="flex-1">

                <div className="flex items-center justify-between">

                  <h3 className="text-xl font-bold">

                    {item.week}

                  </h3>

                  <CheckCircle2 className="text-green-600" />

                </div>

                <p className="mt-3 leading-7 text-slate-600">

                  {item.task}

                </p>

              </div>

            </div>

          ))

        ) : (

          <div className="rounded-2xl bg-slate-50 p-8 text-center">

            <h3 className="text-xl font-semibold">

              No Roadmap Generated

            </h3>

            <p className="mt-2 text-slate-500">

              Guardian AI couldn't generate a learning roadmap.

            </p>

          </div>

        )}

      </div>

    </section>

  );

}