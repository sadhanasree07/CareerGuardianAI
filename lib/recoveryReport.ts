import jsPDF from "jspdf";

type EvidenceData = {
  id?: string;
  category?: string;
  name?: string;
  description?: string;
  status?: string;
  addedAt?: string;
};

type TimelineData = { event?: string; date?: string };

type RecoveryReportInput = {
  caseId?: string;
  status?: string;
  incidentDate?: string;
  createdAt?: string;
  generatedAt?: string;
  organization?: string;
  recruiter?: string;
  jobTitle?: string;
  paymentMethod?: string;
  amount?: string | number;
  location?: string;
  phone?: string;
  email?: string;
  description?: string;
  notes?: string;
  lostMoney?: string;
  complainantName?: string;
  complainantPhone?: string;
  complainantEmail?: string;
  evidence?: EvidenceData[];
  timeline?: TimelineData[];
  transactionReference?: string;
  paymentDate?: string;
  institution?: string;
  contactChannel?: string;
  verification?: {
    trustScore?: number | string;
    verdict?: string;
    layers?: { layer?: number; title?: string; passed?: boolean; score?: number; message?: string }[];
    website?: string;
    email?: string;
    phone?: string;
  };
  completedSteps?: number[];
  actionLabels?: string[];
  complaintText?: string;
};

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const LEFT = 17;
const RIGHT = 193;
const WIDTH = RIGHT - LEFT;
const CONTENT_TOP = 36;
const CONTENT_BOTTOM = 270;
const NAVY: [number, number, number] = [18, 39, 69];
const BLUE: [number, number, number] = [32, 103, 178];
const INK: [number, number, number] = [39, 51, 66];
const MUTED: [number, number, number] = [100, 116, 139];
const LINE: [number, number, number] = [216, 224, 233];
const PALE: [number, number, number] = [246, 248, 251];
const GREEN: [number, number, number] = [29, 112, 78];
const AMBER: [number, number, number] = [166, 105, 19];
const RED: [number, number, number] = [174, 54, 56];

function safeText(value: unknown, fallback = "Not provided") {
  if (value === undefined || value === null || String(value).trim() === "") return fallback;
  return String(value)
    .replace(/\b(password|passcode|otp|one[- ]time password|pin|upi pin|cvv|cvc|security code|authentication token|access token)\s*[:=]\s*[^\s,;]+/gi, "$1: [REDACTED]")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .trim();
}

function formatDate(value?: string, withTime = false) {
  if (!value) return "Not provided";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return safeText(value);
  return withTime
    ? parsed.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function formatCurrency(value?: string | number) {
  if (value === undefined || value === null || String(value).trim() === "") return "Not provided";
  const normalized = String(value).trim().replace(/^(?:INR|Rs\.?|₹)\s*/i, "").replace(/,/g, "");
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) return "Not provided";
  return `INR ${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
}

function wrap(doc: jsPDF, value: unknown, width: number, fontSize: number, font: "normal" | "bold" = "normal") {
  doc.setFont("helvetica", font);
  doc.setFontSize(fontSize);
  const content = safeText(value).replace(/[₹]/g, "INR ").replace(/[•●]/g, "-");
  return doc.splitTextToSize(content, width) as string[];
}

function createReport(input: RecoveryReportInput) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  let y = CONTENT_TOP;

  function addPage() {
    doc.addPage();
    y = CONTENT_TOP;
  }

  function ensureSpace(height: number) {
    if (y + height > CONTENT_BOTTOM) addPage();
  }

  function sectionTitle(number: string, title: string) {
    ensureSpace(17);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BLUE);
    doc.text(number, LEFT, y + 4);
    doc.setFontSize(14);
    doc.setTextColor(...NAVY);
    doc.text(title.toUpperCase(), LEFT + 13, y + 4);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.35);
    doc.line(LEFT, y + 8, RIGHT, y + 8);
    y += 15;
  }

  function paragraph(value: unknown, options: { size?: number; color?: [number, number, number]; bold?: boolean; indent?: number } = {}) {
    const size = options.size ?? 9.5;
    const indent = options.indent ?? 0;
    const lines = wrap(doc, value, WIDTH - indent, size, options.bold ? "bold" : "normal");
    const lineHeight = size * 0.48;
    let offset = 0;
    while (offset < lines.length) {
      const available = Math.max(1, Math.floor((CONTENT_BOTTOM - y) / lineHeight));
      if (available < 1 || y + lineHeight > CONTENT_BOTTOM) {
        addPage();
        continue;
      }
      const pageLines = lines.slice(offset, offset + available);
      doc.setFont("helvetica", options.bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(...(options.color ?? INK));
      doc.text(pageLines, LEFT + indent, y);
      y += pageLines.length * lineHeight + 2;
      offset += pageLines.length;
      if (offset < lines.length) addPage();
    }
    if (lines.length === 0) y += lineHeight;
  }

  function infoGrid(items: [string, unknown][], columns = 2) {
    const gap = 3;
    const cellWidth = (WIDTH - (columns - 1) * gap) / columns;
    const labelSize = 7;
    const valueSize = 9;
    for (let index = 0; index < items.length; index += columns) {
      const group = items.slice(index, index + columns);
      const cells = group.map(([label, value]) => ({
        label,
        lines: wrap(doc, value, cellWidth - 8, valueSize, "bold"),
      }));
      const rowHeight = Math.max(14, ...cells.map((cell) => 8 + cell.lines.length * 4.6));
      ensureSpace(rowHeight + gap);
      cells.forEach((cell, columnIndex) => {
        const x = LEFT + columnIndex * (cellWidth + gap);
        doc.setFillColor(...PALE);
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, y, cellWidth, rowHeight, 1.3, 1.3, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(labelSize);
        doc.setTextColor(...MUTED);
        doc.text(safeText(cell.label).toUpperCase(), x + 4, y + 5);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(valueSize);
        doc.setTextColor(...INK);
        doc.text(cell.lines, x + 4, y + 10);
      });
      y += rowHeight + gap;
    }
  }

  function table(headers: string[], rows: string[][], widths: number[], statusColumn?: number) {
    const headerHeight = 9;
    const drawHeader = () => {
      doc.setFillColor(...NAVY);
      doc.rect(LEFT, y, WIDTH, headerHeight, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      let x = LEFT + 3;
      headers.forEach((header, index) => {
        doc.text(safeText(header).toUpperCase(), x, y + 5.8);
        x += widths[index];
      });
      y += headerHeight;
    };
    ensureSpace(headerHeight + 12);
    drawHeader();
    rows.forEach((row, rowIndex) => {
      const lineSets = row.map((value, index) => wrap(doc, value, widths[index] - 6, 8));
      const rowHeight = Math.max(10, ...lineSets.map((lines) => lines.length * 4.1 + 5));
      if (y + rowHeight > CONTENT_BOTTOM) {
        addPage();
        drawHeader();
      }
      if (rowIndex % 2 === 0) {
        doc.setFillColor(...PALE);
        doc.rect(LEFT, y, WIDTH, rowHeight, "F");
      }
      if (statusColumn !== undefined) {
        const status = row[statusColumn];
        const statusFill = status === "COMPLETED" ? [232, 246, 239] as [number, number, number]
          : status === "IN PROGRESS" ? [235, 243, 252] as [number, number, number]
            : [251, 245, 230] as [number, number, number];
        const statusX = LEFT + widths.slice(0, statusColumn).reduce((sum, width) => sum + width, 0);
        doc.setFillColor(...statusFill);
        doc.rect(statusX, y, widths[statusColumn], rowHeight, "F");
      }
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.25);
      doc.rect(LEFT, y, WIDTH, rowHeight, "S");
      let x = LEFT;
      lineSets.forEach((lines, index) => {
        if (index > 0) doc.line(x, y, x, y + rowHeight);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        const cellStatus = index === statusColumn ? row[index] : "";
        doc.setTextColor(...(cellStatus === "COMPLETED" ? GREEN : cellStatus === "IN PROGRESS" ? BLUE : cellStatus === "PENDING" ? AMBER : INK));
        doc.text(lines, x + 3, y + 5.5);
        x += widths[index];
      });
      y += rowHeight;
    });
    y += 4;
  }

  function callout(title: string, text: string, fill: [number, number, number] = PALE) {
    const lines = wrap(doc, text, WIDTH - 12, 9.5);
    const height = lines.length * 4.7 + 15;
    ensureSpace(height);
    doc.setFillColor(...fill);
    doc.setDrawColor(...LINE);
    doc.roundedRect(LEFT, y, WIDTH, height, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...NAVY);
    doc.text(safeText(title).toUpperCase(), LEFT + 6, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(lines, LEFT + 6, y + 12);
    y += height + 5;
  }

  const caseId = safeText(input.caseId);
  const company = safeText(input.organization);
  const job = safeText(input.jobTitle);
  const description = safeText(input.description);
  const evidence = input.evidence ?? [];
  const timeline = [...(input.timeline ?? [])]
    .filter((item) => item.event && item.date && !Number.isNaN(new Date(item.date).getTime()))
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
  const actionLabels = input.actionLabels?.length ? input.actionLabels : [
    "Secure transaction",
    "Notify financial institution",
    "Preserve evidence",
    "Generate complaint",
    "Report to authorities",
    "Share case",
    "Track recovery status",
  ];
  const completed = new Set(input.completedSteps ?? []);
  const activeStep = actionLabels.findIndex((_, index) => !completed.has(index + 1));
  const complaintFields = [
    ["Complainant", input.complainantName],
    ["Contact number", input.complainantPhone],
    ["Email address", input.complainantEmail],
    ["Organization", input.organization],
    ["Recruiter / person", input.recruiter],
    ["Job / opportunity", input.jobTitle],
    ["Payment method", input.paymentMethod],
    ["Amount involved", formatCurrency(input.amount)],
    ["Transaction reference", input.transactionReference],
    ["Financial institution", input.institution],
    ["Incident date", formatDate(input.incidentDate)],
    ["Payment date", formatDate(input.paymentDate)],
    ["Location", input.location],
    ["Contact channel", input.contactChannel || input.phone || input.email],
  ] as [string, unknown][];

  // Page 1: case overview.
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_WIDTH, 30, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("CAREERGUARDIAN AI", LEFT, 10);
  doc.setFontSize(18);
  doc.text("GUARDIAN RECOVERY REPORT", LEFT, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("Cyber Incident & Recovery Case Report", LEFT, 39);
  y = 48;
  infoGrid([
    ["Case ID", caseId],
    ["Status", safeText(input.status).replace(/_/g, " ")],
    ["Incident date", formatDate(input.incidentDate)],
    ["Report created", formatDate(input.generatedAt || new Date().toISOString())],
  ], 2);

  const amountText = formatCurrency(input.amount);
  const amountLines = wrap(doc, amountText, WIDTH - 12, 17, "bold");
  const amountCardHeight = Math.max(30, amountLines.length * 7.4 + 14);
  ensureSpace(amountCardHeight + 8);
  doc.setFillColor(237, 244, 251);
  doc.setDrawColor(191, 213, 235);
  doc.roundedRect(LEFT, y, WIDTH, amountCardHeight, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...BLUE);
  doc.text("AMOUNT INVOLVED", LEFT + 6, y + 8);
  doc.setFontSize(17);
  doc.setTextColor(...NAVY);
  doc.text(amountLines, LEFT + 6, y + 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`Payment method: ${safeText(input.paymentMethod)}`, RIGHT - 6, y + amountCardHeight - 4, { align: "right" });
  y += amountCardHeight + 8;
  sectionTitle("", "Incident summary");
  infoGrid([
    ["Organization", company],
    ["Recruiter / person", input.recruiter],
    ["Opportunity / role", job],
    ["Payment method", input.paymentMethod],
    ["Location", input.location],
    ["Contact channel", input.contactChannel || input.phone || input.email],
  ], 2);
  const summary = `CareerGuardian AI recorded a reported recruitment incident involving ${company}${job !== "Not provided" ? ` and the opportunity ${job}` : ""}. ${input.paymentMethod ? `The reported payment method is ${safeText(input.paymentMethod)}. ` : ""}${input.amount !== undefined && input.amount !== "" ? `The amount stated is ${amountText}. ` : ""}The recovery workflow was initiated using information supplied by the user. These details are user-reported and are not a legal finding.`;
  callout("Executive incident summary", summary, [248, 250, 252]);

  // Page 2: incident intelligence and conditional flow.
  addPage();
  sectionTitle("01", "Incident intelligence");
  infoGrid([
    ["Organization", company],
    ["Recruiter / person", input.recruiter],
    ["Job / opportunity", job],
    ["Incident date", formatDate(input.incidentDate)],
    ["Payment method", input.paymentMethod],
    ["Amount involved", amountText],
    ["Incident location", input.location],
    ["Contact channel", input.contactChannel || input.phone || input.email],
    ["Verification verdict", input.verification?.verdict],
    ["Verification trust score", input.verification?.trustScore === undefined ? undefined : `${input.verification.trustScore}%`],
  ], 2);
  sectionTitle("", "Incident description");
  paragraph(description, { size: 10 });
  paragraph("Source: Information provided by the complainant. This report does not independently validate the user's description.", { size: 7.5, color: MUTED });
  sectionTitle("", "Reported incident flow");
  const flow = [];
  if (input.organization || input.jobTitle) flow.push(`Recruitment opportunity${input.jobTitle ? `: ${safeText(input.jobTitle)}` : ""}`);
  if (/interview|call|contact|message|email|visit|meeting/i.test(description) || input.phone || input.email) flow.push("Interview / contact reported");
  flow.push("Incident reported by user");
  if (/request|asked|demand|fee|payment/i.test(description) || input.paymentMethod) flow.push("Payment request reported");
  if (input.lostMoney === "YES" || (Number(input.amount) > 0 && input.paymentMethod && input.paymentMethod !== "No money lost")) flow.push(`Payment reported${input.paymentMethod ? ` by ${safeText(input.paymentMethod)}` : ""}`);
  flow.push("Suspected recruitment fraud");
  flow.push("Recovery workflow initiated");
  flow.forEach((item, index) => {
    const flowLines = wrap(doc, item, WIDTH - 30, 8, "bold");
    const flowHeight = Math.max(9, flowLines.length * 4.1 + 3);
    ensureSpace(flowHeight + 3);
    const fill = index === flow.length - 1 ? [237, 244, 251] as [number, number, number] : PALE;
    doc.setFillColor(...fill);
    doc.setDrawColor(...LINE);
    doc.roundedRect(LEFT + 9, y, WIDTH - 18, flowHeight, 1.2, 1.2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...INK);
    doc.text(flowLines, LEFT + 14, y + 5.2);
    y += flowHeight + 2;
    if (index < flow.length - 1) {
      doc.setDrawColor(...BLUE);
      doc.line(PAGE_WIDTH / 2, y - 2, PAGE_WIDTH / 2, y + 1);
      y += 2;
    }
  });

  // Page 3: actual and pending timeline.
  addPage();
  sectionTitle("02", "Recovery timeline");
  const actualTimeline = timeline.length ? timeline : [];
  const expected = [
    ["Evidence uploaded", /evidence added|evidence upload/i],
    ["Bank notification generated", /bank notification prepared/i],
    ["Complaint generated", /complaint letter generated|complaint generated/i],
    ["Authority report generated", /authority report|cyber crime/i],
    ["Case shared", /case shared|whatsapp share/i],
    ["Recovery status updated", /status updated/i],
  ] as const;
  if (actualTimeline.length === 0) paragraph("No dated recovery actions have been recorded yet.", { color: MUTED });
  actualTimeline.forEach((item) => {
    ensureSpace(17);
    doc.setDrawColor(...BLUE);
    doc.setFillColor(...BLUE);
    doc.circle(LEFT + 3, y + 2, 1.6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(safeText(item.event), LEFT + 10, y + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(formatDate(item.date, true), LEFT + 10, y + 7);
    doc.setDrawColor(...LINE);
    doc.line(LEFT + 3, y + 4, LEFT + 3, y + 15);
    y += 17;
  });
  const recordedEvents = actualTimeline.map((item) => item.event || "").join(" | ");
  const pendingEvents = expected.filter(([, pattern]) => !pattern.test(recordedEvents));
  if (pendingEvents.length) {
    ensureSpace(10);
    y += 3;
    paragraph("PENDING ACTIONS", { size: 8, color: AMBER, bold: true });
    pendingEvents.forEach(([label]) => {
      ensureSpace(9);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...AMBER);
      doc.text(`- ${label}: PENDING`, LEFT + 2, y);
      y += 7;
    });
  }

  // Page 4: evidence actually added to this case.
  addPage();
  sectionTitle("03", "Evidence register");
  if (evidence.length === 0) {
    callout("No evidence items added", "No evidence items were added to this case. Supporting evidence can be added through the Recovery Layer. No files are represented as uploaded.");
  } else {
    const rows = evidence.map((item, index) => [
      String(index + 1).padStart(2, "0"),
      safeText(item.category || item.name),
      safeText(item.description, "No description provided"),
      safeText(item.status, "Available in this session"),
      formatDate(item.addedAt),
    ]);
    table(["Evidence ID", "Evidence type", "Description", "Status", "Added date"], rows, [20, 37, 58, 35, 26]);
    paragraph("Evidence status reflects the application session. File contents are not uploaded to persistent cloud storage by this recovery flow.", { size: 7.5, color: MUTED });
  }

  // Page 5: recovery action plan with truthful progress states.
  addPage();
  sectionTitle("04", "Recovery action plan");
  const actionRows = actionLabels.map((label, index) => {
    const state = completed.has(index + 1) ? "COMPLETED" : index === activeStep ? "IN PROGRESS" : "PENDING";
    return [String(index + 1).padStart(2, "0"), safeText(label), state];
  });
  table(["Step", "Recommended action", "Current status"], actionRows, [18, 108, 50], 2);
  callout("Important", "Action status is based on recorded user confirmations and application events. A pending action has not been verified as completed.");

  // Page 6: complaint dossier included in the recovery report.
  addPage();
  sectionTitle("05", "Cyber incident complaint / notification");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text("CAREERGUARDIAN AI", LEFT, y);
  y += 6;
  doc.setFontSize(14);
  doc.text("CYBER INCIDENT COMPLAINT", LEFT, y);
  y += 6;
  paragraph(`CASE REFERENCE: ${caseId}     COMPLAINT TYPE: Suspected Recruitment / Employment Fraud`, { size: 8.5, color: BLUE, bold: true });
  sectionTitle("1", "Complainant and case details");
  table(["Information", "Reported value"], complaintFields.map(([label, value]) => [label, safeText(value)]), [55, 121]);
  sectionTitle("2", "Incident statement");
  paragraph(`The complainant states: ${description}`, { size: 9.5 });
  sectionTitle("3", "Evidence submitted");
  if (evidence.length === 0) paragraph("No evidence items were added to this case.");
  else table(["No.", "Evidence type", "Description / status"], evidence.map((item, index) => [String(index + 1), safeText(item.category || item.name), `${safeText(item.description, "No description provided")} - ${safeText(item.status, "Available in this session")}`]), [15, 50, 111]);
  sectionTitle("4", "Request for action");
  paragraph("I respectfully request the appropriate authority to review the reported incident, examine the available information and supporting evidence, verify the reported organization/person and communication, review payment information where applicable, advise the complainant regarding appropriate next steps, and investigate the reported activity as appropriate.");
  sectionTitle("5", "Declaration");
  paragraph("I confirm that the information provided in this report is accurate to the best of my knowledge. I understand that the concerned authority may request additional information or supporting evidence during its review.");
  ensureSpace(34);
  paragraph("Yours faithfully,", { size: 9.5 });
  y += 3;
  doc.setDrawColor(...MUTED);
  doc.line(LEFT, y + 5, LEFT + 70, y + 5);
  y += 11;
  paragraph(safeText(input.complainantName), { size: 8.5 });
  paragraph(`Contact number: ${safeText(input.complainantPhone)}     Email: ${safeText(input.complainantEmail)}`, { size: 8 });
  paragraph(`Date: ${formatDate(new Date().toISOString())}     Signature: Not provided`, { size: 8 });
  y += 2;
  paragraph("This report is generated from information supplied by the user and system verification results. It is intended to assist with incident reporting and recovery documentation. It does not itself constitute a determination by a bank, law-enforcement authority, regulator, or court.", { size: 7, color: MUTED });

  const totalPages = doc.getNumberOfPages();
  const generatedAt = formatDate(input.generatedAt || new Date().toISOString());
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    if (page !== 1) {
      doc.setFillColor(...NAVY);
      doc.rect(0, 0, PAGE_WIDTH, 25, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text("CAREERGUARDIAN AI", LEFT, 10);
      doc.setFontSize(12);
      doc.text("GUARDIAN RECOVERY REPORT", LEFT, 18);
    }
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.35);
    doc.line(LEFT, 278, RIGHT, 278);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...NAVY);
    doc.text("CAREERGUARDIAN AI", LEFT, 284);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text("Cyber Incident & Recovery System", LEFT, 288);
    doc.text("Protect - Verify - Recover - Succeed", LEFT, 292);
    doc.text(`Case ID: ${caseId}`, PAGE_WIDTH / 2, 284, { align: "center" });
    doc.text(`Generated: ${generatedAt}`, PAGE_WIDTH / 2, 288, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);
    doc.text(`Page ${page} of ${totalPages}`, RIGHT, 288, { align: "right" });
  }

  return doc;
}

export function generateRecoveryReportPdf(input: RecoveryReportInput) {
  const report = createReport(input);
  const safeCaseId = safeText(input.caseId, "recovery-case").replace(/[^A-Za-z0-9_-]/g, "-");
  report.save(`${safeCaseId}-guardian-recovery-report.pdf`);
}

export type { RecoveryReportInput };