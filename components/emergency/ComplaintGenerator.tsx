"use client";

import { FileText, Copy, Download, Send, CheckCircle2, Printer } from "lucide-react";

interface Props {
  data: any;
  emergency?: any;
}

export default function ComplaintGenerator({ data, emergency }: Props) {
  if (!data) return null;

  const today = new Date().toLocaleDateString();
  const applicantName = data?.userName || data?.name || "Guardian AI User";
  const company = data?.company || "Unknown Company";
  const amount = emergency?.amount || data?.applicationFee || 0;
  const bank = emergency?.bank || "SBI";
  const proof = emergency?.hasProof || "No";
  const evidence = emergency?.hasEvidence || "No";
  const blocked = emergency?.blocked || "No";

  const complaint = `
To,
The Cyber Crime Cell,

Subject:
Complaint regarding Fake Recruitment Scam

Respected Sir/Madam,

I wish to report that I became a victim of an online recruitment scam detected by Guardian AI.

Victim Name:
${applicantName}

Company Name:
${company}

Recruiter Details:
${data?.phone || "Not Available"}

Bank Used:
${bank}

Amount Lost:
₹${amount}

Payment Proof Available:
${proof}

Evidence Available:
${evidence}

Recruiter Blocked:
${blocked}

Trust Score:
${data?.trustScore}%

Guardian Verdict:
${data?.status}

Incident Date:
${today}

Description:
Guardian AI detected suspicious recruitment indicators and this complaint is being submitted for official investigation.

I request the department to investigate this matter and take appropriate legal action.

Thank You.

Sincerely,
${applicantName}
`;

  function copyComplaint() {
    navigator.clipboard.writeText(complaint).catch(() => {});
    alert("Complaint copied successfully.");
  }

  function downloadComplaint() {
    const blob = new Blob([complaint], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${company || "complaint"}_Cyber_Complaint.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printComplaint() {
    window.print();
  }

  function submitComplaint() {
    window.open("https://cybercrime.gov.in", "_blank", "noopener,noreferrer");
  }

  return (
    <section id="complaint" className={`mt-16 rounded-3xl p-10 shadow-xl ${data.status === "SAFE" ? "bg-gradient-to-br from-green-50 via-white to-emerald-50" : "bg-gradient-to-br from-red-50 via-white to-orange-50"}`}>
      <div className="text-center">
        <span className={`rounded-full px-5 py-2 text-sm font-semibold ${data.status === "SAFE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {data.status === "SAFE" ? "AI REPORT GENERATOR" : "AI CYBER COMPLAINT"}
        </span>
        <h2 className="mt-5 text-4xl font-bold text-slate-900">{data.status === "SAFE" ? "Guardian AI Report" : "Cyber Crime Complaint"}</h2>
        <p className="mt-3 text-slate-600">{data.status === "SAFE" ? `Guardian AI verified ${company}. This report can be submitted as proof of verification.` : `Guardian AI generated a professional cyber crime complaint using the investigation details.`}</p>
      </div>

      <div className="mt-12 overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="flex items-center gap-4 border-b p-6">
          <div className={`rounded-2xl p-3 ${data.status === "SAFE" ? "bg-green-100" : "bg-red-100"}`}>
            <FileText className={`h-8 w-8 ${data.status === "SAFE" ? "text-green-600" : "text-red-600"}`} />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Generated Report</h3>
            <p className="text-slate-500">Official-style complaint ready for action</p>
          </div>
        </div>

        <textarea readOnly value={complaint} className="h-[450px] w-full resize-none border-none p-8 font-mono text-[15px] leading-7 text-slate-700 outline-none" />
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-4">
        <button type="button" onClick={copyComplaint} className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700">
          <Copy className="h-5 w-5" />
          Copy
        </button>
        <button type="button" onClick={downloadComplaint} className="flex items-center justify-center gap-3 rounded-2xl bg-green-600 py-4 text-lg font-semibold text-white transition hover:bg-green-700">
          <Download className="h-5 w-5" />
          Download
        </button>
        <button type="button" onClick={printComplaint} className="flex items-center justify-center gap-3 rounded-2xl bg-slate-700 py-4 text-lg font-semibold text-white transition hover:bg-slate-800">
          <Printer className="h-5 w-5" />
          Print
        </button>
        <button type="button" onClick={submitComplaint} className={`flex items-center justify-center gap-3 rounded-2xl py-4 text-lg font-semibold text-white transition ${data.status === "SAFE" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
          <Send className="h-5 w-5" />
          {data.status === "SAFE" ? "Verified" : "Submit"}
        </button>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 text-center shadow-lg">
          <CheckCircle2 className={`mx-auto h-10 w-10 ${data.status === "SAFE" ? "text-green-600" : "text-red-600"}`} />
          <h3 className="mt-4 text-xl font-bold">Guardian Verdict</h3>
          <p className="mt-3 text-slate-600">{data.status}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 text-center shadow-lg">
          <FileText className="mx-auto h-10 w-10 text-blue-600" />
          <h3 className="mt-4 text-xl font-bold">Trust Score</h3>
          <p className="mt-3 text-2xl font-bold text-slate-600">{data.trustScore}%</p>
        </div>
        <div className="rounded-2xl bg-white p-6 text-center shadow-lg">
          <Send className="mx-auto h-10 w-10 text-purple-600" />
          <h3 className="mt-4 text-xl font-bold">Company</h3>
          <p className="mt-3 font-semibold text-slate-600">{company}</p>
        </div>
      </div>
    </section>
  );
}