"use client";

export default function RoadmapTimeline({
  roadmap,
}: {
  roadmap: any[];
}) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow">

      <h2 className="mb-8 text-3xl font-bold">
        AI Career Roadmap
      </h2>

      <div className="space-y-6">

        {roadmap.map((item, index) => (

          <div
            key={index}
            className="flex items-start gap-5"
          >

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
              {index + 1}
            </div>

            <div className="rounded-2xl bg-slate-100 p-5 flex-1">

              <h3 className="font-semibold">
                {item.step}
              </h3>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}