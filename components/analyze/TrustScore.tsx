"use client";

interface TrustScoreProps {
  score: number;
  verdict: string;
}

export default function TrustScore({
  score,
  verdict,
}: TrustScoreProps) {

  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (score / 100) * circumference;

  const color =
    verdict === "SAFE" || verdict === "LOW RISK"
      ? "#16a34a"
      : verdict === "SUSPICIOUS" || verdict === "REVIEW"
      ? "#eab308"
      : "#dc2626";

  return (
    <div className="flex flex-col items-center">

      <div className="relative h-56 w-56">

        <svg
          className="-rotate-90"
          width="224"
          height="224"
        >
          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="14"
            fill="transparent"
          />

          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke={color}
            strokeWidth="14"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1.5s ease",
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">

          <h1 className="text-5xl font-extrabold">
            {score}%
          </h1>

          <p className="text-slate-500">
            Evidence-Adjusted Trust Score
          </p>

        </div>

      </div>

      <span
        className={`mt-6 rounded-full px-8 py-3 text-lg font-bold text-white ${
          verdict === "SAFE" || verdict === "LOW RISK"
            ? "bg-green-600"
            : verdict === "SUSPICIOUS" || verdict === "REVIEW"
            ? "bg-yellow-500"
            : "bg-red-600"
        }`}
      >
        {verdict}
      </span>

    </div>
  );
}
