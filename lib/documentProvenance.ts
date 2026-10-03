export type ProvenanceStatus = "MATCH" | "MISMATCH" | "NOT VERIFIED";
export type SignatureStatus = "VALID" | "INVALID" | "NOT FOUND" | "NOT CHECKABLE" | "UNABLE TO VERIFY";

export type DocumentFacts = {
  organization: string;
  notificationNumber: string;
  recruitmentTitle: string;
  publicationDate: string;
  applicationOpeningDate: string;
  applicationClosingDate: string;
  applicationUrl: string;
};

export type DocumentProvenance = {
  fileInfo: {
    name: string;
    mimeType: string;
    sizeBytes: number;
    sha256: string;
    modifiedAt: string | null;
  };
  metadata: {
    status: "AVAILABLE" | "UNAVAILABLE";
    createdAt: string;
    modifiedAt: string;
    author: string;
    creator: string;
    producer: string;
    title: string;
    subject: string;
    keywords: string;
    documentId: string;
    embeddedUrls: string[];
    camera: string;
    software: string;
    gpsMetadataPresent: boolean;
  };
  signature: {
    status: SignatureStatus;
    signer: string;
    certificateIssuer: string;
    signedAt: string;
    signerOrganizationMatch: ProvenanceStatus;
  };
  facts: DocumentFacts;
  qr: {
    status: "DECODED" | "QR_DETECTED_BUT_NOT_DECODED" | "NOT_DETECTED" | "UNAVAILABLE";
  };
  assessment?: {
    organization: ProvenanceStatus;
    claimedOrganization: string;
    documentOrganization: string;
    notificationNumber: ProvenanceStatus;
    notificationNumberValue: string;
    publicationDate: ProvenanceStatus;
    publicationDateValue: string;
    applicationOpeningDate: string;
    applicationClosingDate: string;
    recruitmentTitle: string;
    applicationUrl: string;
    officialWebsite: string;
    submittedApplicationUrl: string;
    recruitmentDetails: "MATCH" | "PARTIAL MATCH" | "MISMATCH" | "NOT VERIFIED";
    officialSource: "VERIFIED" | "NOT VERIFIED";
    officialSourceMessage: string;
    applicationDomain: "OFFICIAL" | "UNVERIFIED" | "SUSPICIOUS";
    paymentIdentity: "MATCH" | "MISMATCH" | "NOT VERIFIED" | "NOT APPLICABLE";
    evidenceStatus: "VERIFIED" | "REVIEW REQUIRED" | "HIGH RISK";
    metadataCaveat: string;
  };
};

const empty = (value: unknown) => typeof value === "string" ? value.trim() : "";

function normalized(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function compareDocumentClaim(documentValue: string, claimedValue: string): ProvenanceStatus {
  const document = normalized(documentValue);
  const claimed = normalized(claimedValue);
  if (!document || !claimed) return "NOT VERIFIED";
  if (document === claimed || document.includes(claimed) || claimed.includes(document)) return "MATCH";
  return "MISMATCH";
}

export function extractDocumentFacts(text: string): DocumentFacts {
  const organization = text.match(/(?:claimed\s+organization|organization|department|ministry|commission|recruitment\s+board)\s*[:#-]\s*([^\n]{2,100})/i)?.[1]?.trim() || "";
  const notificationNumber = text.match(/(?:notification|advertisement|advt\.?|recruitment)\s*(?:no\.?|number)?\s*[:#-]?\s*([a-z0-9][a-z0-9./-]{1,40})/i)?.[1] || "";
  const publicationDate = text.match(/(?:publication|published|issue|issued)\s*date\s*[:#-]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+[a-z]{3,9}\s+\d{4})/i)?.[1] || "";
  const applicationOpeningDate = text.match(/(?:application\s*(?:start|opening)|apply\s*from|opening)\s*date?\s*[:#-]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+[a-z]{3,9}\s+\d{4})/i)?.[1] || "";
  const applicationClosingDate = text.match(/(?:application\s*(?:closing|end)|last\s*date)\s*[:#-]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+[a-z]{3,9}\s+\d{4})/i)?.[1] || "";
  const applicationUrl = text.match(/https?:\/\/[^\s<>'")]+/i)?.[0]?.replace(/[),.;!?]+$/g, "") || "";
  const recruitmentTitle = text.match(/(?:recruitment for|post name|position)\s*[:#-]?\s*([^\n]{3,100})/i)?.[1]?.trim() || "";

  return { organization, notificationNumber, recruitmentTitle, publicationDate, applicationOpeningDate, applicationClosingDate, applicationUrl };
}

export function buildProvenanceAssessment(input: {
  provenance: DocumentProvenance;
  claimedOrganization: string;
  claimedNotificationNumber: string;
  governmentVerification?: {
    verificationStatus?: string;
    domainValidation?: { status?: string };
    notificationMatch?: { status?: string };
    recruitmentConsistency?: { status?: string };
  } | null;
  linkSentinel?: {
    urlsAnalyzed?: Array<{ domainAnalysis?: { domainMatch?: boolean; isTyposquatting?: boolean; isLookalike?: boolean; officialWebsite?: string | null } }>;
  } | null;
  existingVerdict?: string;
  paymentFraudDetection?: {
    paymentRequested?: boolean;
    qrCodeMentioned?: boolean;
    organizationMatch?: string;
    verdict?: string;
  } | null;
}): DocumentProvenance["assessment"] {
  const government = input.governmentVerification;
  const payment = input.paymentFraudDetection;
  const paymentIdentity = !payment?.qrCodeMentioned
    ? "NOT APPLICABLE"
    : payment.organizationMatch === "MATCH"
      ? "MATCH"
      : payment.organizationMatch === "MISMATCH"
        ? "MISMATCH"
        : "NOT VERIFIED";
  const domainStatus = government?.domainValidation?.status;
  const links = input.linkSentinel?.urlsAnalyzed || [];
  const verifiedLinkDomain = links.some((link) => link.domainAnalysis?.domainMatch === true);
  const suspiciousLinkDomain = links.some((link) => link.domainAnalysis?.isTyposquatting === true || link.domainAnalysis?.isLookalike === true);
  const applicationDomain = verifiedLinkDomain || domainStatus === "PASS" ? "OFFICIAL" : domainStatus === "FAIL" || suspiciousLinkDomain ? "SUSPICIOUS" : "UNVERIFIED";
  const officialSourceMessage = "Official source could not be verified at this time.";
  const criticalPayment = payment?.verdict === "HIGH_RISK" && payment.paymentRequested === true;
  const organization = compareDocumentClaim(input.provenance.facts.organization, input.claimedOrganization);
  const notificationNumber: ProvenanceStatus = "NOT VERIFIED";
  const strongMismatchCount = [applicationDomain === "SUSPICIOUS", paymentIdentity === "MISMATCH" && payment?.paymentRequested === true].filter(Boolean).length;
  const highRisk = input.existingVerdict === "HIGH RISK" || criticalPayment || (paymentIdentity === "MISMATCH" && payment?.paymentRequested === true) || strongMismatchCount >= 2;
  const evidenceStatus = highRisk ? "HIGH RISK" : "REVIEW REQUIRED";
  const officialWebsite = links.map((link) => (link as { domainAnalysis?: { officialWebsite?: string | null } }).domainAnalysis?.officialWebsite).find((value): value is string => typeof value === "string" && Boolean(value)) || "";

  return {
    organization: "NOT VERIFIED",
    claimedOrganization: input.claimedOrganization,
    documentOrganization: input.provenance.facts.organization,
    notificationNumber,
    notificationNumberValue: input.provenance.facts.notificationNumber || input.claimedNotificationNumber,
    publicationDate: "NOT VERIFIED",
    publicationDateValue: input.provenance.facts.publicationDate,
    applicationOpeningDate: input.provenance.facts.applicationOpeningDate,
    applicationClosingDate: input.provenance.facts.applicationClosingDate,
    recruitmentTitle: input.provenance.facts.recruitmentTitle,
    applicationUrl: input.provenance.facts.applicationUrl,
    officialWebsite,
    submittedApplicationUrl: input.provenance.facts.applicationUrl,
    recruitmentDetails: "NOT VERIFIED",
    officialSource: "NOT VERIFIED",
    officialSourceMessage,
    applicationDomain,
    paymentIdentity,
    evidenceStatus,
    metadataCaveat: "File metadata is supporting evidence only. It can change when a document is downloaded, converted, scanned, screenshotted, forwarded or edited; a metadata date difference alone is not evidence of fraud.",
  };
}

export function maskPaymentIdentifier(value: string) {
  const trimmed = empty(value);
  if (!trimmed) return "";
  const separator = trimmed.lastIndexOf("@");
  if (separator <= 0) return `${"•".repeat(Math.max(0, trimmed.length - 4))}${trimmed.slice(-4)}`;
  const username = trimmed.slice(0, separator);
  return `${username.slice(0, Math.min(2, username.length))}${"•".repeat(Math.max(3, username.length - 2))}${trimmed.slice(separator)}`;
}

export function digitalSignatureStatus(signatureFieldDetected: boolean, isPdf: boolean): DocumentProvenance["signature"]["status"] {
  if (!isPdf) return "NOT CHECKABLE";
  return signatureFieldDetected ? "UNABLE TO VERIFY" : "NOT FOUND";
}

export function qrProcessingMessage(scanStatus: DocumentProvenance["qr"]["status"], paymentQrStatus?: string) {
  if (scanStatus === "QR_DETECTED_BUT_NOT_DECODED" || paymentQrStatus === "QR_DETECTED_BUT_NOT_DECODED") return "QR detected but payment information could not be decoded.";
  if (scanStatus === "DECODED") return "QR detected and decoded.";
  if (scanStatus === "UNAVAILABLE" || paymentQrStatus === "UNAVAILABLE") return "QR scan unavailable; its presence could not be determined.";
  return "No QR code detected.";
}