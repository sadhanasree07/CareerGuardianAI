"use client";

import {
  ArrowRight,
  Building2,
  Globe,
  Mail,
  Phone,
  BadgeIndianRupee,
  Calendar,
  FileText,
  MapPin,
  GraduationCap,
  Briefcase,
  Landmark,
  ShieldCheck,
} from "lucide-react";

interface ExtractedInfoProps {
  data: any;
}

export default function ExtractedInfo({ data }: ExtractedInfoProps) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">

        <div className="rounded-xl bg-green-100 p-3">
          <ShieldCheck className="h-7 w-7 text-green-600" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Extracted Recruitment Information
          </h2>

          <p className="text-slate-500">
            CareerGuardian AI successfully extracted the recruitment details.
          </p>
        </div>

      </div>

      {/* Information */}

      <div className="space-y-4">

        <InfoRow
          icon={<FileText className="h-5 w-5" />}
          title="Input Source"
          value={data?.inputType === "whatsapp" ? `WhatsApp Conversation — ${data?.inputMethod === "ocr" ? "OCR Extracted" : "Pasted Text"}` : data?.inputMethod === "ocr" ? "Recruitment Document — OCR Extracted" : data?.inputMethod === "text" ? "Recruitment Message — Pasted Text" : "Not recorded"}
        />

        <InfoRow
          icon={<Building2 className="h-5 w-5" />}
          title="Organization"
          value={data?.company || "Not Found"}
        />

        <InfoRow
          icon={<Briefcase className="h-5 w-5" />}
          title="Job Role"
          value={data?.jobRole || "Not Found"}
        />

        <InfoRow
          icon={<Landmark className="h-5 w-5" />}
          title="Department"
          value={data?.department || "Not Found"}
        />

        <InfoRow
          icon={<FileText className="h-5 w-5" />}
          title="Notification Number"
          value={data?.notificationNumber || "Not Found"}
        />

        <InfoRow
          icon={<Globe className="h-5 w-5" />}
          title="Website"
          value={data?.website || "Not Found"}
        />

        <InfoRow
          icon={<Mail className="h-5 w-5" />}
          title="Email"
          value={data?.email || "Not Found"}
        />

        <InfoRow
          icon={<Phone className="h-5 w-5" />}
          title="Phone"
          value={data?.phone || "Not Found"}
        />

        <InfoRow
          icon={<BadgeIndianRupee className="h-5 w-5" />}
          title="Salary"
          value={data?.salary || "Not Found"}
        />

        <InfoRow
          icon={<Calendar className="h-5 w-5" />}
          title="Application Deadline"
          value={data?.deadline || "Not Found"}
        />

        <InfoRow
          icon={<MapPin className="h-5 w-5" />}
          title="Location"
          value={data?.location || "Not Found"}
        />

        <InfoRow
          icon={<GraduationCap className="h-5 w-5" />}
          title="Education"
          value={data?.education || "Not Found"}
        />

        <InfoRow
          icon={<Briefcase className="h-5 w-5" />}
          title="Experience"
          value={data?.experience || "Not Found"}
        />

      </div>

      {/* Description */}

      <div className="mt-8 rounded-2xl border bg-slate-50 p-5">

        <h3 className="mb-2 font-semibold text-slate-800">
          Job Description
        </h3>

        <p className="text-sm leading-7 text-slate-600">
          {data?.description || "No description extracted."}
        </p>

      </div>
      <div className="mt-8 rounded-2xl border bg-slate-50 p-5">

  <h3 className="mb-4 text-xl font-bold">
    AI Verification Summary
  </h3>

  <div className="mb-6 grid grid-cols-2 gap-4">

    <div className="rounded-xl bg-white p-4 text-center shadow">

      <p className="text-sm text-slate-500">
        Evidence-Adjusted Trust Score
      </p>

      <h2 className="mt-2 text-4xl font-bold text-blue-600">
        {data?.verification?.trustScore ?? 0}%
      </h2>

    </div>

    <div className="rounded-xl bg-white p-4 text-center shadow">

      <p className="text-sm text-slate-500">
        Final Verdict
      </p>

      <h2
        className={`mt-2 text-2xl font-bold ${
          data?.verification?.verdict === "SAFE" || data?.verification?.verdict === "LOW RISK"
            ? "text-green-600"
            : data?.verification?.verdict === "SUSPICIOUS" || data?.verification?.verdict === "REVIEW"
            ? "text-yellow-600"
            : "text-red-600"
        }`}
      >
        {data?.verification?.verdict}
      </h2>

    </div>

  </div>

  <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {[
      ["Scam Risk", data?.verification?.riskScore],
      ["Verification Confidence", data?.verification?.verificationConfidence],
      ["Source Confidence", data?.verification?.sourceConfidence],
      ["Evidence Coverage", data?.verification?.evidenceCoverage],
    ].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-white p-4 text-center shadow"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{typeof value === "number" ? `${value}%` : "—"}</p></div>)}
  </div>

  <div className="space-y-3">

    {data?.verification?.layers?.map((layer: any) => (

      <div
        key={layer.layer}
        className="flex items-center justify-between rounded-xl border bg-white p-4"
      >

        <div>

          <h4 className="font-semibold">
            Layer {layer.layer}
          </h4>

          <p className="text-sm text-slate-500">
            {layer.title}
          </p>

        </div>

        <div className="text-right">

          <p
            className={`font-bold ${
              layer.state === "HIGH_RISK"
                ? "text-red-600"
                : layer.state === "PASS" || (!layer.state && layer.passed)
                ? "text-green-600"
                : "text-amber-700"
            }`}
          >
            {layer.state === "HIGH_RISK" ? "HIGH RISK" : layer.state === "NOT_PROVIDED" ? "NOT PROVIDED" : layer.state === "NOT_APPLICABLE" ? "N/A" : layer.state === "NOT_DETECTED" ? "NOT DETECTED" : layer.state === "NOT_VERIFIED" ? "NOT VERIFIED" : layer.state === "REVIEW" ? "REVIEW" : layer.passed ? "PASS" : "NOT VERIFIED"}
          </p>

          <p className="text-xs text-slate-500">
            {layer.message}
          </p>

        </div>

      </div>

    ))}

  </div>

</div>

      {/* Button */}

      <button
        className="mt-8 w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
      >
        Continue AI Investigation <ArrowRight aria-hidden="true" className="ml-2 inline h-5 w-5" />
      </button>

    </div>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

function InfoRow({
  icon,
  title,
  value,
}: InfoRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">

      <div className="flex items-center gap-3">

        <div className="rounded-lg bg-slate-100 p-2">
          {icon}
        </div>

        <span className="font-medium text-slate-700">
          {title}
        </span>

      </div>

      <span className="max-w-[55%] text-right font-semibold text-slate-900 break-words">
        {value}
      </span>

    </div>
  );
}


