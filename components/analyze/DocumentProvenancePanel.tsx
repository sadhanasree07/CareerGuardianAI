"use client";

import { useState } from "react";
import { FileCheck2, Fingerprint, ShieldAlert, Link2, Landmark, CreditCard, Clock3 } from "lucide-react";
import { maskPaymentIdentifier, qrProcessingMessage, type DocumentProvenance } from "@/lib/documentProvenance";

type PaymentEvidence = {
  paymentRequested?: boolean;
  amount?: string | null;
  paymentReason?: string | null;
  upiIds?: string[];
  qrCodeMentioned?: boolean;
  qrStatus?: string;
  qrPayeeName?: string | null;
  qrAmount?: string | null;
  qrCurrency?: string | null;
  qrTransactionReference?: string | null;
  paymentUrl?: string | null;
  claimedOrganization?: string | null;
  organizationMatch?: string;
  verdict?: string;
};

function statusTone(status: string) {
  if (["MATCH", "VERIFIED", "VALID", "OFFICIAL", "SAFE"].includes(status)) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (["MISMATCH", "INVALID", "SUSPICIOUS", "HIGH RISK"].includes(status)) return "border-red-200 bg-red-50 text-red-800";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

function Status({ value }: { value: string }) {
  return <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusTone(value)}`}>{value}</span>;
}

function EvidenceRow({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.2fr)] items-start gap-x-3 border-b border-slate-100 py-2 last:border-0"><dt className="text-xs text-slate-500">{label}</dt><dd className="min-w-0 break-words text-right text-xs font-medium text-slate-800">{value}</dd></div>;
}

function display(value: unknown, fallback = "Not available") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function fileSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
}

function safeUrlHost(value: string) {
  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname}`;
  } catch {
    return value;
  }
}

export default function DocumentProvenancePanel({ result, payment }: { result?: DocumentProvenance | null; payment?: PaymentEvidence | null }) {
  const [activeTab, setActiveTab] = useState("Overview");
  if (!result) return null;
  const assessment = result.assessment;
  const metadata = result.metadata;
  const tabs = ["Overview", "File Properties", "Metadata", "Digital Signature", "Embedded Data"];
  const qrSummary = qrProcessingMessage(result.qr.status, payment?.qrStatus);
  const paymentIds = [...new Set(payment?.upiIds || [])].map(maskPaymentIdentifier).filter(Boolean);
  const title = assessment?.recruitmentTitle || result.facts.recruitmentTitle;
  const sourceStatus = assessment?.officialSource || "NOT VERIFIED";

  return (
    <section aria-labelledby="document-provenance-title" className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
        <div>
          <h2 id="document-provenance-title" className="flex items-center gap-2 font-bold text-slate-900"><FileCheck2 aria-hidden="true" className="h-5 w-5 text-teal-700" /> Document Properties</h2>
          <p className="mt-1 text-xs text-slate-500">Automatically extracted file properties and supporting evidence</p>
        </div>
        {assessment && <Status value={assessment.evidenceStatus} />}
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.9fr)]">
        <div className="min-w-0">
          <div role="tablist" aria-label="Document property sections" className="flex gap-1 overflow-x-auto border-b border-slate-200">
            {tabs.map((tab) => (
              <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold transition ${activeTab === tab ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Overview" && (
            <div className="grid gap-3 pt-4 sm:grid-cols-2">
              <InfoBlock title="File Information" icon={<FileCheck2 className="h-4 w-4 text-blue-700" />}>
                <EvidenceRow label="File type" value={result.fileInfo.mimeType || "Not available"} />
                <EvidenceRow label="File size" value={fileSize(result.fileInfo.sizeBytes)} />
                <EvidenceRow label="File name" value={result.fileInfo.name || "Not available"} />
                <div className="mt-2 rounded-md bg-slate-50 p-2.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600"><Fingerprint className="h-3.5 w-3.5" /> SHA-256 Evidence Fingerprint</p>
                  <p className="mt-1 break-all font-mono text-[11px] text-slate-700">{result.fileInfo.sha256 || "Fingerprint unavailable"}</p>
                </div>
              </InfoBlock>
              <InfoBlock title="Timestamps" icon={<Clock3 className="h-4 w-4 text-blue-700" />}>
                <EvidenceRow label="Document created" value={display(metadata.createdAt, "Metadata not available")} />
                <EvidenceRow label="Document modified" value={display(metadata.modifiedAt, "Metadata not available")} />
                <EvidenceRow label="File modified" value={result.fileInfo.modifiedAt ? new Date(result.fileInfo.modifiedAt).toLocaleString() : "Not available"} />
                <p className="mt-2 rounded-md bg-blue-50 p-2 text-[11px] leading-4 text-blue-900">File timestamps may differ from publication dates after download, conversion, scanning or forwarding. A difference alone is not a scam indicator.</p>
              </InfoBlock>
              <InfoBlock title="Document Metadata" icon={<FileCheck2 className="h-4 w-4 text-violet-700" />}>
                <div className="mb-2"><Status value={metadata.status === "AVAILABLE" ? "METADATA FOUND" : "METADATA NOT AVAILABLE"} /></div>
                <EvidenceRow label="Author" value={display(metadata.author, "Metadata not available")} />
                <EvidenceRow label="Creator" value={display(metadata.creator, "Metadata not available")} />
                <EvidenceRow label="Producer" value={display(metadata.producer, "Metadata not available")} />
                <EvidenceRow label="Document ID" value={display(metadata.documentId, "Metadata not available")} />
              </InfoBlock>
              <InfoBlock title="Digital Signature" icon={<ShieldAlert className="h-4 w-4 text-emerald-700" />}>
                <div className="mb-2"><Status value={result.signature.status} /></div>
                <EvidenceRow label="Signer" value={display(result.signature.signer)} />
                <EvidenceRow label="Certificate issuer" value={display(result.signature.certificateIssuer)} />
                <EvidenceRow label="Signing time" value={display(result.signature.signedAt)} />
                {result.signature.status === "UNABLE TO VERIFY" && <p className="mt-2 text-[11px] leading-4 text-slate-500">Signature presence is detected, but certificate and cryptographic validity cannot be checked here.</p>}
              </InfoBlock>
            </div>
          )}

          {activeTab === "File Properties" && (
            <InfoBlock title="File Properties" icon={<FileCheck2 className="h-4 w-4 text-blue-700" />}>
              <EvidenceRow label="File name" value={result.fileInfo.name || "Not available"} />
              <EvidenceRow label="File type" value={result.fileInfo.mimeType || "Not available"} />
              <EvidenceRow label="File size" value={fileSize(result.fileInfo.sizeBytes)} />
              <EvidenceRow label="Document created" value={display(metadata.createdAt, "Metadata not available")} />
              <EvidenceRow label="Document modified" value={display(metadata.modifiedAt, "Metadata not available")} />
              <EvidenceRow label="File modified" value={result.fileInfo.modifiedAt ? new Date(result.fileInfo.modifiedAt).toLocaleString() : "Not available"} />
              <div className="mt-3 rounded-md bg-slate-50 p-3"><p className="flex items-center gap-2 text-xs font-bold text-slate-600"><Fingerprint className="h-4 w-4" /> SHA-256</p><p className="mt-2 break-all font-mono text-xs text-slate-800">{result.fileInfo.sha256 || "Fingerprint unavailable"}</p></div>
            </InfoBlock>
          )}

          {activeTab === "Metadata" && (
            <InfoBlock title="Document Metadata" icon={<FileCheck2 className="h-4 w-4 text-violet-700" />}>
              {metadata.status === "UNAVAILABLE" ? <p className="text-sm text-slate-600">Metadata not available</p> : <>
                <EvidenceRow label="Author" value={display(metadata.author)} />
                <EvidenceRow label="Creator" value={display(metadata.creator)} />
                <EvidenceRow label="Producer" value={display(metadata.producer)} />
                <EvidenceRow label="Title" value={display(metadata.title)} />
                <EvidenceRow label="Subject" value={display(metadata.subject)} />
                <EvidenceRow label="Keywords" value={display(metadata.keywords)} />
                <EvidenceRow label="Document ID" value={display(metadata.documentId)} />
                <EvidenceRow label="Camera / device" value={display(metadata.camera)} />
                <EvidenceRow label="Software" value={display(metadata.software)} />
                <EvidenceRow label="GPS metadata" value={metadata.gpsMetadataPresent ? "Present (coordinates hidden)" : "Not embedded"} />
              </>}
              <p className="mt-3 text-xs leading-5 text-slate-500">Metadata is supporting evidence only and may change when a document is downloaded, converted, scanned, screenshotted or forwarded.</p>
            </InfoBlock>
          )}

          {activeTab === "Digital Signature" && (
            <InfoBlock title="Digital Signature" icon={<ShieldAlert className="h-4 w-4 text-amber-700" />}>
              <div className="mb-3"><Status value={result.signature.status} /></div>
              <EvidenceRow label="Signer" value={display(result.signature.signer)} />
              <EvidenceRow label="Certificate issuer" value={display(result.signature.certificateIssuer)} />
              <EvidenceRow label="Certificate status" value={result.signature.status === "UNABLE TO VERIFY" ? "Unable to verify" : result.signature.status === "NOT FOUND" ? "No signature found" : "Not checkable"} />
              <EvidenceRow label="Signature timestamp" value={display(result.signature.signedAt)} />
              <EvidenceRow label="Signer organization match" value={result.signature.signerOrganizationMatch} />
              <p className="mt-3 text-xs leading-5 text-slate-500">A signature alone does not establish that a recruitment notice is official. Cryptographic signature verification is not available in this application.</p>
            </InfoBlock>
          )}

          {activeTab === "Embedded Data" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoBlock title="Embedded Information" icon={<Link2 className="h-4 w-4 text-blue-700" />}>
                <EvidenceRow label="Embedded URLs" value={metadata.embeddedUrls.length ? `${metadata.embeddedUrls.length} found` : "None found"} />
                {metadata.embeddedUrls.length ? <ul className="mt-2 space-y-1">{metadata.embeddedUrls.map((url) => <li key={url} className="break-all text-xs text-blue-700">{url}</li>)}</ul> : <p className="mt-2 text-xs text-slate-500">No embedded URLs found.</p>}
                <EvidenceRow label="Notification number" value={display(result.facts.notificationNumber)} />
                <EvidenceRow label="Publication date" value={display(result.facts.publicationDate)} />
                <EvidenceRow label="Recruitment title" value={display(title)} />
              </InfoBlock>
              <InfoBlock title="QR Code Analysis" icon={<CreditCard className="h-4 w-4 text-pink-700" />}>
                <Status value={result.qr.status.replaceAll("_", " ")} />
                <p className="mt-2 text-xs text-slate-600">{qrSummary}</p>
                {payment?.qrCodeMentioned && <>
                  <EvidenceRow label="QR payee" value={payment.qrPayeeName || "Not in decoded payload"} />
                  <EvidenceRow label="Payment ID" value={paymentIds.length ? paymentIds.join(", ") : "Not extracted"} />
                  <EvidenceRow label="Amount / currency" value={[payment.qrAmount || payment.amount, payment.qrCurrency].filter(Boolean).join(" ") || "Not in decoded payload"} />
                  <EvidenceRow label="Transaction reference" value={payment.qrTransactionReference || "Not in decoded payload"} />
                </>}
              </InfoBlock>
            </div>
          )}
        </div>

        <aside className="min-w-0 space-y-3">
          <InfoBlock title="Official Source Cross-Verification" icon={<Landmark className="h-4 w-4 text-blue-700" />}>
            <div className="space-y-2">
              <CrossCheck label="Organization" value={`${display(assessment?.documentOrganization, "Not extracted")} / ${display(assessment?.claimedOrganization, "Not identified")}`} status="NOT VERIFIED" />
              <CrossCheck label="Notification No." value={display(assessment?.notificationNumberValue, "Not extracted")} status="NOT VERIFIED" />
              <CrossCheck label="Publication date" value={display(assessment?.publicationDateValue, "Not extracted")} status="NOT VERIFIED" />
              <CrossCheck label="Application dates" value={[assessment?.applicationOpeningDate, assessment?.applicationClosingDate].filter(Boolean).join(" – ") || "Not extracted"} status="NOT VERIFIED" />
              <CrossCheck label="Recruitment details" value={display(title, "Not extracted")} status="NOT VERIFIED" />
              <CrossCheck label="Official source" value={assessment?.officialSourceMessage || "Official source could not be verified at this time."} status={sourceStatus} />
              <CrossCheck label="Official website" value={display(assessment?.officialWebsite, "Not in verified-domain registry")} status={assessment?.officialWebsite ? "VERIFIED DOMAIN" : "NOT VERIFIED"} />
              <CrossCheck label="Application domain" value={assessment?.submittedApplicationUrl ? safeUrlHost(assessment.submittedApplicationUrl) : "Not extracted"} status={assessment?.applicationDomain || "UNVERIFIED"} />
            </div>
            <p className="mt-3 text-[11px] leading-4 text-slate-500">Official notice records are not currently available for independent publication-date or notification matching. {assessment?.metadataCaveat}</p>
          </InfoBlock>

          <InfoBlock title="Payment Information" icon={<CreditCard className="h-4 w-4 text-slate-700" />}>
            <div className="mb-2"><Status value={payment?.paymentRequested ? "PAYMENT REQUEST" : "NO PAYMENT REQUEST"} /></div>
            {!payment?.paymentRequested ? <p className="text-xs leading-5 text-slate-600">No payment request was detected. {qrSummary}</p> : <>
              <EvidenceRow label="Purpose" value={payment.paymentReason || "Not identified"} />
              <EvidenceRow label="Claimed organization" value={payment.claimedOrganization || "Not identified"} />
              <EvidenceRow label="QR payee" value={payment.qrPayeeName || "Not in decoded payload"} />
              <EvidenceRow label="UPI / VPA" value={paymentIds.length ? paymentIds.join(", ") : "Not extracted"} />
              <EvidenceRow label="Amount" value={payment.qrAmount || payment.amount || "Not in decoded payload"} />
              <EvidenceRow label="Currency" value={payment.qrCurrency || "Not in decoded payload"} />
              <CrossCheck label="Recipient match" value={payment.organizationMatch || "NOT VERIFIED"} status={assessment?.paymentIdentity || "NOT VERIFIED"} />
              {payment.verdict === "HIGH_RISK" && <CrossCheck label="Financial risk" value="Existing PayGuard high-risk result" status="HIGH RISK" />}
            </>}
          </InfoBlock>
        </aside>
      </div>
    </section>
  );
}

function InfoBlock({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-3.5">
    <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">{icon}{title}</h3>
    {children}
  </section>;
}

function CrossCheck({ label, value, status }: { label: string; value: string; status: string }) {
  return <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
    <div className="min-w-0"><p className="text-[11px] font-semibold text-slate-700">{label}</p><p className="break-words text-[11px] leading-4 text-slate-500">{value}</p></div>
    <Status value={status} />
  </div>;
}
