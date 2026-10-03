"use client";

import { useEffect, useState } from "react";
import { Activity, ShieldCheck } from "lucide-react";
import TrustLayer from "./TrustLayer";
import DownloadReportButton from "./DownloadReportButton";
import TrustScore from "./TrustScore";
import AIRecommendation from "./AIRecommendation";
import { generateRecommendation } from "@/lib/aiRecommendation";
import { runTrustEngine } from "@/lib/trustEngine";
import GuardianTrustCheck from "./GuardianTrustCheck";

const layers = [
  {
    title: "OCR Extraction",
    description: "Extracting recruitment details...",
  },
  {
    title: "Government Verification",
    description: "Checking official government notification...",
  },
  {
    title: "Website Verification",
    description: "Validating official website...",
  },
  {
    title: "Recruiter Email",
    description: "Checking recruiter email domain...",
  },
  {
    title: "Phone Verification",
    description: "Validating contact number...",
  },
  {
    title: "Salary Analysis",
    description: "Checking salary realism...",
  },
  {
    title: "Scam Keyword Detection",
    description: "Scanning suspicious keywords...",
  },
  {
    title: "HTTPS Security",
    description: "Checking website security...",
  },
  {
    title: "Application Fee",
    description: "Detecting illegal application fee...",
  },
  {
    title: "Education Verification",
    description: "Checking eligibility criteria...",
  },
  {
    title: "Job Role Verification",
    description: "Validating job designation...",
  },
  {
    title: "AI Final Trust Score",
    description: "Generating final AI verdict...",
  },
];

export default function TrustEngine({
  data,
}: {
  data: any;
}) {
  const [currentLayer, setCurrentLayer] = useState(0);
  const [guardianTrustCheck, setGuardianTrustCheck] = useState<any>(null);
  const verification = { ...(data?.verification || {}), ...(guardianTrustCheck || {}) };
  const reportData = { ...data, verification: { ...verification, ...(guardianTrustCheck ? { guardianTrustCheck } : {}) } };

  useEffect(() => {
    if (currentLayer >= layers.length) return;

    const timer = setTimeout(() => {
      setCurrentLayer((prev) => prev + 1);
    }, 650);

    return () => clearTimeout(timer);
  }, [currentLayer]);

  const progress = Math.min(
    (currentLayer / layers.length) * 100,
    100
  );

  const results = runTrustEngine(data);
  const primaryLayers = results.filter((layer) => /document|ocr|government|organization|notification|website|domain|financial|payment|qr/i.test(layer.name));
  const contextLayers = results.filter((layer) => /threat|communication|source|keyword|content|nlp|pattern/i.test(layer.name) && !/government|notification|domain|payment/i.test(layer.name));
  const categorizedLayers = new Set([...primaryLayers, ...contextLayers].map((layer) => layer.layer));
  const supportingLayers = results.filter((layer) => !categorizedLayers.has(layer.layer));

  const totalScore = results.reduce(
    (sum, item) => sum + item.score,
    0
  );

  const trustScore =
    verification?.trustScore ??
    Math.round((totalScore / 105) * 100);

  const verdict =
    verification?.verdict ??
    (trustScore >= 80
      ? "SAFE"
      : trustScore >= 60
      ? "SUSPICIOUS"
      : "SCAM");
  const recommendations = generateRecommendation(
  trustScore,
  data
);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-4 shadow-2xl sm:p-8">

      <div className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-300 ring-1 ring-cyan-300/30">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">RTIM / LIVE ANALYSIS</p>
            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              CareerGuardian AI Investigation
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Activity className="h-4 w-4 text-emerald-300" />
          {currentLayer >= layers.length ? "Analysis complete" : "Scanning live signals"}
        </div>

      </div>

      <div className="mb-8">

        <div className="mb-3 flex justify-between">

          <span className="font-semibold text-slate-300">
            Investigation Progress
          </span>

          <span className="font-bold text-cyan-300">
            {Math.round(progress)}%
          </span>

        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/10">

          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-300 transition-all duration-700"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

      <div className="grid gap-3 lg:grid-cols-2">

        {layers.map((layer, index) => (

          <TrustLayer
            key={index}
            title={results[index]?.name || layer.title}
            description={layer.description}
            status={
              index < currentLayer
                ? "completed"
                : index === currentLayer
                ? "running"
                : "pending"
            }
            passed={results[index]?.passed}
            state={(data?.verification?.layers || [])[index]?.state}
            message={results[index]?.message}
          />

        ))}

      </div>
            {currentLayer >= layers.length && (

        <div className="mt-10 rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-8">

          <div className="grid gap-8 lg:grid-cols-2">

            {/* Left */}

            <div>

              <h2 className="text-3xl font-bold text-slate-900">
                AI Investigation Completed
              </h2>

              <p className="mt-2 text-slate-600">
                CareerGuardian AI successfully completed all
                12 verification layers.
              </p>

              <div className="mt-8 space-y-4">

                <div className="rounded-2xl bg-white p-5 shadow">

                  <p className="text-sm text-slate-500">
                    Government Verification
                  </p>

                  <h3
                    className={`mt-2 text-2xl font-bold ${
                      results[1]?.passed
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {results[1]?.passed
                      ? "Verified"
                      : "Not Verified"}
                  </h3>

                </div>

                <div className="rounded-2xl bg-white p-5 shadow">

                  <p className="text-sm text-slate-500">
                    Scam Risk
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-red-500">
                    {verification?.riskScore ?? Math.max(0, 100 - trustScore)}%
                  </h3>

                </div>

                <div className="rounded-2xl bg-white p-5 shadow">

                  <p className="text-sm text-slate-500">
                    Final Verdict
                  </p>

                  <h3
                    className={`mt-2 text-2xl font-bold ${
                      verdict === "SAFE" || verdict === "LOW RISK"
                        ? "text-green-600"
                        : verdict === "SUSPICIOUS" || verdict === "REVIEW"
                        ? "text-yellow-500"
                        : "text-red-600"
                    }`}
                  >
                    {verdict}
                  </h3>

                </div>

              </div>

            </div>

            {/* Right */}

           <div className="flex flex-col items-center justify-center">

  <TrustScore
    score={trustScore}
    verdict={verdict}
  />

</div>

          </div>

          {/* Investigation Summary */}

          <div className="mt-10 rounded-2xl bg-white p-6 shadow">

            <h3 className="mb-6 text-2xl font-bold">
              12-Layer Investigation Report
            </h3>

            <div className="space-y-5">
              <LayerTier title="Tier 1 · Primary Government Authenticity Evidence" layers={primaryLayers} />
              <LayerTier title="Tier 2 · Threat & Context Intelligence" layers={contextLayers} />
              <LayerTier title="Tier 3 · Supporting Verification" layers={supportingLayers} />
            </div>

          </div>

          {/* AI Explanation */}

          <div className="mt-8 rounded-2xl bg-blue-50 p-6">

            <h3 className="mb-4 text-xl font-bold">
              WHY THIS RESULT?
            </h3>
            {data?.verification?.aiExplanation && (
              <p className="mb-5 rounded-xl bg-white p-4 text-slate-700">{data.verification.aiExplanation}</p>
            )}

            <div className="space-y-4 text-slate-700">
              <EvidenceGroup title="POSITIVE SIGNALS" items={data?.verification?.positiveSignals || []} empty="No positive evidence was independently confirmed." />
              <EvidenceGroup title="NEEDS VERIFICATION" items={data?.verification?.missingSignals || []} empty="No key information was marked missing." />
              <EvidenceGroup title="RISK SIGNALS" items={data?.verification?.negativeSignals || []} empty="No high-risk indicators detected in the submitted content." />
            </div>

          </div>
<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Scam Risk", verification?.riskScore],
              ["Verification Confidence", verification?.verificationConfidence],
              ["Source Confidence", verification?.sourceConfidence],
              ["Evidence Coverage", verification?.evidenceCoverage],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-2xl bg-white p-5 shadow">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{typeof value === "number" ? `${value}%` : "—"}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <h3 className="font-bold text-slate-900">Recommended next step</h3>
            <p className="mt-2 text-slate-700">{verification?.recommendedAction || "Verify the recruiter using contact details found independently."}</p>
            <p className="mt-2 text-sm text-slate-500">Reported source: {data?.verification?.sourceLabel || "Not provided"}</p>
          </div><AIRecommendation
  items={recommendations}
/>
          <GuardianTrustCheck
            initialVerification={data?.verification}
            opportunity={data}
            onComplete={setGuardianTrustCheck}
          />
          <DownloadReportButton data={reportData} />
        </div>

      )}

    </div>
  );
}

function LayerTier({ title, layers, defaultOpen = false }: { title: string; layers: Array<{ layer: number; name: string; message: string; passed: boolean; state?: string }>; defaultOpen?: boolean }) {
  if (!layers.length) return null;
  return (
    <details open={defaultOpen} className="rounded-xl border border-slate-200 bg-white p-4">
      <summary className="cursor-pointer font-bold text-slate-900">{title} <span className="ml-1 text-xs font-medium text-slate-500">({layers.length})</span></summary>
      <div className="mt-3 space-y-2">
        {layers.map((layer) => (
          <div key={layer.layer} className="grid gap-3 rounded-lg border border-slate-100 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0"><h4 className="text-sm font-semibold text-slate-800">{layer.name}</h4><p className="mt-1 break-words text-xs text-slate-500">{layer.message}</p></div>
            <span className={`w-fit rounded-full px-3 py-1 text-[11px] font-bold ${layer.state === "HIGH_RISK" ? "bg-red-100 text-red-800" : layer.state === "PASS" || (!layer.state && layer.passed) ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
              {layer.state === "HIGH_RISK" ? "HIGH RISK" : layer.state === "NOT_PROVIDED" ? "NOT PROVIDED" : layer.state === "NOT_APPLICABLE" ? "NOT APPLICABLE" : layer.state === "NOT_DETECTED" ? "NOT DETECTED" : layer.state === "NOT_VERIFIED" ? "NOT VERIFIED" : layer.state === "REVIEW" ? "REVIEW" : layer.passed ? "PASS" : "NOT VERIFIED"}
            </span>
          </div>
        ))}
      </div>
    </details>
  );
}

function EvidenceGroup({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div>
      <h4 className="font-bold">{title}</h4>
      {items.length ? <ul className="mt-1 list-disc pl-5">{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-1 text-sm text-slate-500">{empty}</p>}
    </div>
  );
}



