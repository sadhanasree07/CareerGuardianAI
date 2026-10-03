import { digitalSignatureStatus, extractDocumentFacts, type DocumentProvenance } from "@/lib/documentProvenance";

const blankMetadata: DocumentProvenance["metadata"] = {
  status: "UNAVAILABLE",
  createdAt: "",
  modifiedAt: "",
  author: "",
  creator: "",
  producer: "",
  title: "",
  subject: "",
  keywords: "",
  documentId: "",
  embeddedUrls: [],
  camera: "",
  software: "",
  gpsMetadataPresent: false,
};

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function metadataValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(metadataValue).filter(Boolean).join(", ");
  return "";
}

function pdfDate(value: unknown) {
  const date = metadataValue(value);
  const match = date.match(/^D:(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?/);
  return match ? [match[1], match[2], match[3]].filter(Boolean).join("-") : date;
}

export async function inspectUploadedDocument(
  file: File,
  qrStatus: DocumentProvenance["qr"]["status"],
  claimedOrganization = "",
  claimedNotificationNumber = "",
): Promise<{ provenance: DocumentProvenance; extractedText: string }> {
  let sha256 = "";
  let metadata = { ...blankMetadata };
  let signature: DocumentProvenance["signature"] = {
    status: digitalSignatureStatus(false, file.type === "application/pdf"),
    signer: "",
    certificateIssuer: "",
    signedAt: "",
    signerOrganizationMatch: "NOT VERIFIED",
  };
  let extractedText = "";

  try {
    const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
    sha256 = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  } catch {
    sha256 = "";
  }

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    try {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const loadingTask = pdfjs.getDocument({ data: await file.arrayBuffer() });
      const pdf = await loadingTask.promise;
      try {
        const { info, metadata: pdfMetadata } = await pdf.getMetadata();
        const infoValues = info as Record<string, unknown>;
        const xmp = {
          author: metadataValue(pdfMetadata?.get?.("dc:creator")),
          createdAt: metadataValue(pdfMetadata?.get?.("xmp:CreateDate")),
          modifiedAt: metadataValue(pdfMetadata?.get?.("xmp:ModifyDate")),
          producer: metadataValue(pdfMetadata?.get?.("pdf:Producer")),
          title: metadataValue(pdfMetadata?.get?.("dc:title")),
          subject: metadataValue(pdfMetadata?.get?.("dc:description")),
          documentId: metadataValue(pdfMetadata?.get?.("xmpMM:InstanceID")) || metadataValue(pdfMetadata?.get?.("dc:identifier")),
        };
        const fields = await pdf.getFieldObjects();
        const signatureFields = Object.values(fields || {}).flat().filter((field) => {
          const typedField = field as Record<string, unknown>;
          return typedField.fieldType === "Sig" || typedField.type === "signature";
        });
        signature = {
          status: digitalSignatureStatus(signatureFields.length > 0, true),
          signer: "",
          certificateIssuer: "",
          signedAt: "",
          signerOrganizationMatch: "NOT VERIFIED",
        };

        const embeddedUrls = new Set<string>();
        const textParts: string[] = [];
        for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, 40) && textParts.join("\n").length < 30000; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const [content, annotations] = await Promise.all([
            page.getTextContent(),
            page.getAnnotations(),
          ]);
          for (const item of content.items) {
            const str = (item as { str?: unknown }).str;
            if (typeof str === "string" && str) textParts.push(str);
          }
          for (const annotation of annotations) {
            const url = textValue((annotation as { url?: unknown }).url);
            if (/^https?:\/\//i.test(url)) embeddedUrls.add(url.slice(0, 2000));
          }
        }
        extractedText = textParts.join(" ").slice(0, 30000);
        for (const url of extractedText.match(/https?:\/\/[^\s<>'")]+/gi) || []) {
          embeddedUrls.add(url.replace(/[),.;!?]+$/g, "").slice(0, 2000));
        }
        const creator = textValue(infoValues.Creator);
        const producer = textValue(infoValues.Producer) || xmp.producer;
        const rawId = Array.isArray(pdf.fingerprints) ? pdf.fingerprints[0] : "";
        metadata = {
          status: Object.values(infoValues).some(Boolean) || Object.values(xmp).some(Boolean) ? "AVAILABLE" : "UNAVAILABLE",
          createdAt: pdfDate(infoValues.CreationDate) || pdfDate(xmp.createdAt),
          modifiedAt: pdfDate(infoValues.ModDate) || pdfDate(xmp.modifiedAt),
          author: textValue(infoValues.Author) || xmp.author,
          creator,
          producer,
          title: textValue(infoValues.Title) || xmp.title,
          subject: textValue(infoValues.Subject) || xmp.subject,
          keywords: textValue(infoValues.Keywords),
          documentId: textValue(rawId) || xmp.documentId,
          embeddedUrls: [...embeddedUrls].slice(0, 20),
          camera: "",
          software: creator,
          gpsMetadataPresent: false,
        };
      } finally {
        await loadingTask.destroy();
      }
    } catch {
      metadata = { ...blankMetadata };
      signature = { ...signature, status: "NOT CHECKABLE" };
    }
  } else if (file.type.startsWith("image/")) {
    try {
      const exifr = await import("exifr");
      const exif = await exifr.parse(file, { gps: true, xmp: true, iptc: true }) as Record<string, unknown> | undefined;
      if (exif) {
        const createdAt = metadataValue(exif.DateTimeOriginal) || metadataValue(exif.CreateDate) || metadataValue(exif.DateCreated);
        const modifiedAt = metadataValue(exif.ModifyDate) || metadataValue(exif.DateTime);
        const camera = [textValue(exif.Make), textValue(exif.Model)].filter(Boolean).join(" ");
        const software = textValue(exif.Software);
        metadata = {
          ...blankMetadata,
          status: Object.values(exif).some((value) => value !== undefined && value !== null && value !== "") ? "AVAILABLE" : "UNAVAILABLE",
          createdAt,
          modifiedAt,
          author: textValue(exif.Artist) || textValue(exif.Creator),
          creator: textValue(exif.Creator),
          producer: "",
          title: textValue(exif.Title) || textValue(exif.ImageDescription),
          subject: textValue(exif.Subject),
          keywords: "",
          documentId: "",
          embeddedUrls: [],
          camera,
          software,
          gpsMetadataPresent: exif.GPSLatitude !== undefined || exif.GPSLongitude !== undefined,
        };
      }
    } catch {
      metadata = { ...blankMetadata };
    }
  }

  const facts = extractDocumentFacts(extractedText);
  const organization = textValue(claimedOrganization);
  if (organization && extractedText.toLowerCase().includes(organization.toLowerCase())) facts.organization = organization;
  if (!facts.notificationNumber && claimedNotificationNumber && extractedText.toLowerCase().includes(claimedNotificationNumber.toLowerCase())) {
    facts.notificationNumber = textValue(claimedNotificationNumber);
  }

  return {
    provenance: {
      fileInfo: {
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        sha256,
        modifiedAt: file.lastModified ? new Date(file.lastModified).toISOString() : null,
      },
      metadata,
      signature,
      facts,
      qr: { status: qrStatus },
    },
    extractedText,
  };
}

export async function renderPdfPagesForOcr(file: File, maxPages = 12): Promise<string[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjs.getDocument({ data: await file.arrayBuffer() });
  const pdf = await loadingTask.promise;
  const images: string[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, maxPages); pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.25 });
      const canvas = globalThis.document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext("2d");
      if (!context) continue;
      await page.render({ canvasContext: context, viewport, canvas }).promise;
      images.push(canvas.toDataURL("image/jpeg", 0.78).split(",")[1]);
      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    await loadingTask.destroy();
  }
  return images;
}
