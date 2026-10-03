import jsPDF from "jspdf";

export type ComplaintEvidence = {
  category: string;
  description?: string;
  name?: string;
  status?: string;
};

export type RecoveryComplaintData = {
  caseId: string;
  complaintDate: string;
  complainantName?: string;
  complainantPhone?: string;
  complainantEmail?: string;
  organization?: string;
  recruiter?: string;
  opportunity?: string;
  incidentDate?: string;
  incidentLocation?: string;
  involvedPhone?: string;
  involvedEmailOrWebsite?: string;
  paymentMethod?: string;
  amount?: string;
  transactionReference?: string;
  financialInstitution?: string;
  paymentDate?: string;
  incidentDescription?: string;
  additionalNotes?: string;
  evidence: ComplaintEvidence[];
  lostMoney: "YES" | "NO" | "NOT_SURE";
};

export type ComplaintSection = {
  number: number;
  title: string;
  rows?: [string, string][];
  paragraph?: string;
  bullets?: string[];
  evidence?: { number: string; type: string; description: string; status: string }[];
};

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const LEFT = 19;
const RIGHT = 19;
const BODY_WIDTH = PAGE_WIDTH - LEFT - RIGHT;
const BODY_TOP = 48;
const FOOTER_TOP = 263;
const NAVY: [number, number, number] = [22, 43, 74];
const BLUE: [number, number, number] = [38, 105, 174];
const INK: [number, number, number] = [36, 48, 64];
const MUTED: [number, number, number] = [94, 107, 124];
const LINE: [number, number, number] = [199, 211, 224];
const PALE: [number, number, number] = [244, 248, 252];

function value(input?: string | number | null) {
  const text = input === undefined || input === null ? "" : String(input).trim();
  return text || "Not provided";
}

function redactSecrets(input: string) {
  return input
    .replace(/\b(one[- ]time password|password|passcode|otp|upi pin|pin|cvv|cvc|bank login|login credentials|authentication token|access token)\b\s*(?:(?:is|:|=|-)\s*|\s+)[^\s,;.!?]+/gi, "$1 [redacted]")
    .replace(/\b(?:password|passcode|otp|upi pin|pin|cvv|cvc|bank login|authentication token|access token)\b/gi, "[sensitive detail omitted]");
}

function professionalizeDescription(description: string, amount?: string) {
  const clean = redactSecrets(description)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\bscamm\b/gi, "scam")
    .replace(/\bteh\b/gi, "the")
    .replace(/\bcredentails\b/gi, "credentials")
    .replace(/\bfrmed\b/gi, "framed")
    .trim();
  if (!clean) return "Not provided";

  const interviewContext = /interview/i.test(clean);
  const paymentRequest = /\b(ask(?:ed|ing)?|request(?:ed|ing)?|demand(?:ed|ing)?|pay(?:ment)?|fee)\b/i.test(clean);
  const credentialContext = /credential/i.test(clean);
  const hasLocationVisit = /\b(after|when|once)\b.{0,80}\b(visit(?:ed)?|place|location)\b|\b(visit(?:ed)?|place|location)\b.{0,80}\b(after|when)\b/i.test(clean);

  if (interviewContext && paymentRequest && credentialContext) {
    const clauses = [
      `The complainant states that an interview was ${/planned/i.test(clean) ? "planned" : "arranged"}${hasLocationVisit ? " and that the interaction took place after visiting the location" : ""}.`,
      "The interaction was described as resembling a genuine recruitment process.",
    ];
    const reportedAmount = value(amount) !== "Not provided"
      ? `INR ${amount}`
      : clean.match(/(?:\bINR\s*|\bRs\.?\s*)([\d,]+(?:\.\d{1,2})?)/i)?.[1]
        ? `INR ${clean.match(/(?:\bINR\s*|\bRs\.?\s*)([\d,]+(?:\.\d{1,2})?)/i)?.[1]}`
        : clean.match(/\b([\d,]+(?:\.\d{1,2})?)\b(?=.{0,40}\b(?:credential|pay|payment)\b)/i)?.[1]
          ? `approximately INR ${clean.match(/\b([\d,]+(?:\.\d{1,2})?)\b(?=.{0,40}\b(?:credential|pay|payment)\b)/i)?.[1]}`
          : "an amount not specified";
    clauses.push(`A payment of ${reportedAmount} was requested in connection with obtaining credentials.`);
    clauses.push("The complainant suspects that the payment request formed part of a fraudulent recruitment process.");
    return clauses.join(" ");
  }

  const normalized = clean
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/([.!?])(?=\S)/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim();
  const sentence = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return `The complainant states that ${sentence.replace(/[.!?]+$/, "")}.`;
}

export function buildRecoveryComplaint(data: RecoveryComplaintData) {
  const paymentIncident = data.lostMoney !== "NO" && Boolean(data.paymentMethod || data.amount);
  const subject = paymentIncident
    ? "Complaint regarding suspected recruitment fraud and a reported payment demand during a job opportunity process"
    : "Complaint regarding suspected recruitment fraud during a job opportunity process";
  const evidence = data.evidence.map((item, index) => ({
    number: String(index + 1),
    type: value(item.category),
    description: value(item.description || item.name),
    status: item.status === "Available in this session" ? "Available (local session only)" : value(item.status),
  }));
  const financialRows: [string, string][] = [
    ["Payment Method", value(data.paymentMethod)],
    ["Amount", value(data.amount) === "Not provided" ? "Not provided" : `INR ${data.amount}`],
    ["Transaction Reference", value(data.transactionReference)],
    ["Financial Institution", value(data.financialInstitution)],
    ["Date of Payment", value(data.paymentDate)],
  ];
  const communicationRows: [string, string][] = [
    ["Phone Number", value(data.involvedPhone)],
    ["Email / Website", value(data.involvedEmailOrWebsite)],
    ["WhatsApp", "Not provided"],
    ["Recruitment Platform", "Not provided"],
    ["Other Contact Channel", "Not provided"],
  ];
  const opening = "I am submitting this complaint regarding a suspected recruitment fraud incident. The following information is based on the details provided by the complainant and the supporting information available in the CareerGuardian AI recovery case. CareerGuardian AI has not independently verified every statement.";
  const declaration = "I confirm that the information provided in this complaint is accurate to the best of my knowledge. I understand that the concerned authority may request additional information or supporting evidence during its review.";
  const requestedAction = "I respectfully request the concerned authority to review the reported incident and supporting evidence, verify the information provided, investigate the reported activity where appropriate, and advise the complainant regarding the applicable reporting and recovery procedure.";

  const sections: ComplaintSection[] = [
    {
      number: 1,
      title: "COMPLAINANT DETAILS",
      rows: [
        ["Complainant Name", value(data.complainantName)],
        ["Contact Number", value(data.complainantPhone)],
        ["Email Address", value(data.complainantEmail)],
        ["Case ID", value(data.caseId)],
        ["Complaint Date", value(data.complaintDate)],
      ],
    },
    {
      number: 2,
      title: "INCIDENT DETAILS",
      rows: [
        ["Organization", value(data.organization)],
        ["Recruiter / Person", value(data.recruiter)],
        ["Job / Opportunity", value(data.opportunity)],
        ["Incident Date", value(data.incidentDate)],
        ["Incident Location", value(data.incidentLocation)],
        ["Contact Channel", value(data.involvedPhone || data.involvedEmailOrWebsite)],
      ],
    },
    {
      number: 3,
      title: "INCIDENT DESCRIPTION",
      paragraph: `${professionalizeDescription(data.incidentDescription || "", data.amount)}\n\nSource: Information provided by complainant${data.additionalNotes?.trim() ? `\n\nAdditional notes provided by complainant: ${redactSecrets(data.additionalNotes.trim())}` : ""}`,
    },
    { number: 4, title: "FINANCIAL / TRANSACTION DETAILS", rows: financialRows },
    { number: 5, title: "COMMUNICATION DETAILS", rows: communicationRows },
    {
      number: 6,
      title: "EVIDENCE REGISTER",
      evidence,
      paragraph: evidence.length ? undefined : "No evidence items were added to this case.",
    },
    { number: 7, title: "REQUEST FOR ACTION", paragraph: requestedAction, bullets: [
      "Review the reported incident.",
      "Examine the available evidence.",
      "Verify the reported organization/person and communication.",
      "Review the reported payment information, where applicable.",
      "Advise the complainant regarding appropriate next steps.",
      "Take appropriate action where warranted under applicable law.",
    ] },
    { number: 8, title: "DECLARATION", paragraph: declaration },
  ];

  return {
    caseId: value(data.caseId),
    complaintDate: value(data.complaintDate),
    subject,
    recipient: "The Appropriate Cyber Crime / Law Enforcement Authority",
    opening,
    sections,
    signature: {
      name: value(data.complainantName),
      phone: value(data.complainantPhone),
      email: value(data.complainantEmail),
      date: value(data.complaintDate),
    },
  };
}

export type RecoveryComplaint = ReturnType<typeof buildRecoveryComplaint>;

export function complaintText(data: RecoveryComplaintData) {
  const complaint = buildRecoveryComplaint(data);
  const blocks = [
    "CAREERGUARDIAN AI\nCYBER INCIDENT COMPLAINT\nRecruitment Fraud / Scam Report",
    `Case ID: ${complaint.caseId}\nComplaint Date: ${complaint.complaintDate}`,
    `TO\n${complaint.recipient}`,
    `SUBJECT: ${complaint.subject}`,
    `Respected Sir/Madam,\n\n${complaint.opening}`,
    ...complaint.sections.map((section) => {
      const rows = section.rows?.map(([label, item]) => `${label}: ${item}`).join("\n");
      const evidenceRows = section.evidence?.map((item) => `${item.number}. ${item.type} | ${item.description} | ${item.status}`).join("\n");
      const bullets = section.bullets?.map((item) => `- ${item}`).join("\n");
      return `${section.number}. ${section.title}\n${rows || ""}${section.paragraph ? `\n${section.paragraph}` : ""}${evidenceRows ? `\n${evidenceRows}` : ""}${bullets ? `\n${bullets}` : ""}`;
    }),
    `Yours faithfully,\n\n\n____________________________\n${complaint.signature.name}\nContact Number: ${complaint.signature.phone}\nEmail: ${complaint.signature.email}\nDate: ${complaint.signature.date}\nSignature: ________________________`,
  ];
  return blocks.join("\n\n");
}

export function generateComplaintPdf(data: RecoveryComplaintData) {
  const complaint = buildRecoveryComplaint(data);
  const doc = new jsPDF({ format: "a4", unit: "mm", compress: true });
  let y = BODY_TOP;

  const textLines = (text: string, width: number, fontSize = 9) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(text, width) as string[];
  };

  const newPage = () => {
    doc.addPage();
    y = BODY_TOP;
  };

  const ensureSpace = (height: number) => {
    if (y + height > FOOTER_TOP) newPage();
  };

  const sectionHeading = (number: number, title: string) => {
    ensureSpace(18);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...NAVY);
    doc.text(`${number}. ${title}`, LEFT, y);
    y += 3;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(LEFT, y, PAGE_WIDTH - RIGHT, y);
    y += 5;
  };

  const drawKeyValueTable = (rows: [string, string][]) => {
    const labelWidth = 48;
    const valueWidth = BODY_WIDTH - labelWidth;
    rows.forEach(([label, item]) => {
      const labelLines = textLines(label, labelWidth - 6, 8.1);
      const lines = textLines(item, valueWidth - 8, 8.7);
      const lineHeight = 4.3;
      let offset = 0;
      while (offset < lines.length) {
        const maxLines = Math.max(1, Math.floor((FOOTER_TOP - BODY_TOP - 8) / lineHeight));
        const chunk = lines.slice(offset, offset + maxLines);
        const height = Math.max(10, chunk.length * lineHeight + 5, labelLines.length * 3.8 + 5);
        ensureSpace(height);
        doc.setFillColor(...PALE);
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.25);
        doc.rect(LEFT, y, labelWidth, height, "FD");
        doc.rect(LEFT + labelWidth, y, valueWidth, height, "D");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.1);
        doc.setTextColor(...NAVY);
        doc.text(labelLines, LEFT + 3, y + 6);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.7);
        doc.setTextColor(...INK);
        doc.text(chunk, LEFT + labelWidth + 4, y + 5.8);
        y += height;
        offset += chunk.length;
        if (offset < lines.length) newPage();
      }
    });
  };

  const drawParagraph = (text: string, indent = 0) => {
    const lines = text.split("\n").flatMap((paragraph) => paragraph
      ? textLines(paragraph, BODY_WIDTH - indent, 9.2)
      : [""]);
    const lineHeight = 4.7;
    let offset = 0;
    while (offset < lines.length) {
      const capacity = Math.max(1, Math.floor((FOOTER_TOP - y - 3) / lineHeight));
      if (capacity === 0 || y + lineHeight > FOOTER_TOP) {
        newPage();
        continue;
      }
      const chunk = lines.slice(offset, offset + capacity);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.2);
      doc.setTextColor(...INK);
      doc.text(chunk, LEFT + indent, y);
      y += chunk.length * lineHeight + 3;
      offset += chunk.length;
      if (offset < lines.length) newPage();
    }
  };

  const drawEvidenceTable = (rows: NonNullable<ComplaintSection["evidence"]>) => {
    const widths = [11, 39, 99, BODY_WIDTH - 149];
    const headers = ["No.", "Evidence Type", "Description", "Status"];
    const drawRow = (cells: string[], isHeader = false) => {
      const wrapped = cells.map((cell, index) => textLines(cell, widths[index] - 4, isHeader ? 7.2 : 7.8));
      const lineHeight = 4;
      const height = Math.max(9, Math.max(...wrapped.map((lines) => lines.length)) * lineHeight + 4);
      ensureSpace(height);
      let x = LEFT;
      wrapped.forEach((lines, index) => {
        const fill: [number, number, number] = isHeader ? PALE : [255, 255, 255];
        doc.setFillColor(...fill);
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.25);
        doc.rect(x, y, widths[index], height, "FD");
        doc.setFont("helvetica", isHeader ? "bold" : "normal");
        doc.setFontSize(isHeader ? 7.2 : 7.8);
        doc.setTextColor(...(isHeader ? NAVY : INK));
        doc.text(lines, x + 2, y + 5.5);
        x += widths[index];
      });
      y += height;
    };
    drawRow(headers, true);
    rows.forEach((item) => drawRow([item.number, item.type, item.description, item.status]));
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text("TO", LEFT, y);
  y += 5;
  drawParagraph(complaint.recipient);
  y += 1;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text("SUBJECT:", LEFT, y);
  y += 4.5;
  drawParagraph(complaint.subject, 16);
  y += 1;
  drawParagraph("Respected Sir/Madam,");
  drawParagraph(complaint.opening);

  complaint.sections.forEach((section) => {
    sectionHeading(section.number, section.title);
    if (section.rows) drawKeyValueTable(section.rows);
    if (section.paragraph) drawParagraph(section.paragraph);
    if (section.evidence?.length) drawEvidenceTable(section.evidence);
    if (section.bullets?.length) {
      section.bullets.forEach((bullet) => {
        const lines = textLines(bullet, BODY_WIDTH - 8, 9);
        ensureSpace(lines.length * 4.7 + 2);
        doc.setFillColor(...BLUE);
        doc.circle(LEFT + 2, y - 1, 0.7, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...INK);
        doc.text(lines, LEFT + 6, y);
        y += lines.length * 4.7 + 2;
      });
    }
  });

  ensureSpace(48);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text("Yours faithfully,", LEFT, y);
  y += 17;
  doc.setDrawColor(...MUTED);
  doc.line(LEFT, y, LEFT + 72, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text(complaint.signature.name, LEFT, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text(`Contact Number: ${complaint.signature.phone}`, LEFT, y);
  y += 5;
  doc.text(`Email: ${complaint.signature.email}`, LEFT, y);
  y += 5;
  doc.text(`Date: ${complaint.signature.date}`, LEFT, y);
  y += 5;
  doc.text("Signature: ________________________", LEFT, y);

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, PAGE_WIDTH, 38, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...BLUE);
    doc.text("CAREERGUARDIAN AI", LEFT, 13);
    doc.setFontSize(15);
    doc.setTextColor(...NAVY);
    doc.text("CYBER INCIDENT COMPLAINT", LEFT, 22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text("Recruitment Fraud / Scam Report", LEFT, 29);
    doc.setFontSize(7.6);
    doc.text(`Case ID: ${complaint.caseId}`, PAGE_WIDTH - RIGHT, 13, { align: "right" });
    doc.text(`Complaint Date: ${complaint.complaintDate}`, PAGE_WIDTH - RIGHT, 19, { align: "right" });
    doc.setDrawColor(...BLUE);
    doc.setLineWidth(0.65);
    doc.line(LEFT, 35, PAGE_WIDTH - RIGHT, 35);

    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(LEFT, FOOTER_TOP, PAGE_WIDTH - RIGHT, FOOTER_TOP);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(...NAVY);
    doc.text("CareerGuardian AI", LEFT, FOOTER_TOP + 5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text("Protect • Verify • Recover • Succeed", LEFT, FOOTER_TOP + 10);
    doc.text(`Case ID: ${complaint.caseId}`, PAGE_WIDTH / 2, FOOTER_TOP + 5, { align: "center" });
    doc.text(`Page ${page} of ${totalPages}`, PAGE_WIDTH - RIGHT, FOOTER_TOP + 5, { align: "right" });
    doc.setFontSize(6.5);
    doc.text("Generated from information provided by the complainant.", LEFT, FOOTER_TOP + 16);
    doc.text("CareerGuardian AI does not constitute a law-enforcement authority or legal service.", LEFT, FOOTER_TOP + 20);
  }

  doc.save(`${complaint.caseId}-cyber-incident-complaint.pdf`);
}
