"use client";

export default function CareerMatches({
  careers,
}: {
  careers: any[];
}) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow">

      <h2 className="mb-8 text-3xl font-bold">
        Top Career Matches
      </h2>

      <div className="space-y-6">

        {careers.map((career, index) => (

          <div
            key={index}
            className="rounded-2xl border border-slate-200 p-5"
          >

            <div className="mb-3 flex justify-between">

              <h3 className="text-lg font-semibold">
                {career.role}
              </h3>

              <span className="font-bold text-blue-600">
                {career.score}%
              </span>

            </div>

            <div className="h-3 rounded-full bg-slate-200">

              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                style={{
                  width: `${career.score}%`,
                }}
              />

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}