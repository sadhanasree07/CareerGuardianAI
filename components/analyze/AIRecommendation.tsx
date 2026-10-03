"use client";

interface Props {
  items: string[];
}

export default function AIRecommendation({
  items,
}: Props) {
  return (
    <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">

      <h2 className="mb-5 text-2xl font-bold text-green-700">
        🛡 AI Recommendation
      </h2>

      <div className="space-y-3">

        {items.map((item, index) => (

          <div
            key={index}
            className="flex items-center gap-3"
          >

            <span className="text-green-600 text-xl">
              ✔
            </span>

            <span>{item}</span>

          </div>

        ))}

      </div>

    </div>
  );
}