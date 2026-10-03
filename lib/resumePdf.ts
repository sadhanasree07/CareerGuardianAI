import { jsPDF } from "jspdf";
import type { ResumeData, ResumeStyle } from "@/components/resumeBuilder/resumeTypes";
import { getResumeSectionOrder, sortResumeEntries } from "./mapProfileToResume";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const PAGE_MARGIN = 4;
const SIDEBAR_WIDTH = 72;
const SIDEBAR_COLOR: [number, number, number] = [20, 39, 68];
const BOTTOM = PAGE_HEIGHT - 15;

type PdfCommand =
  | { type: "text"; text: string; x: number; y: number; size: number; bold: boolean; color: [number, number, number]; align?: "left" | "right" }
  | { type: "line"; x1: number; x2: number; y: number; color: [number, number, number] }
  | { type: "dot"; x: number; y: number; color: [number, number, number] };
interface TextFlow { pages: PdfCommand[][]; readonly y: number; write: (text: string, size?: number, options?: WriteOptions) => void; heading: (text: string) => void; marker: () => void; }
interface WriteOptions { bold?: boolean; color?: [number, number, number]; indent?: number; gap?: number; align?: "left" | "right"; }

function cleanText(value: string): string {
  return value.normalize("NFKD").replace(/\p{M}/gu, "")
    .replace(/[\u2010-\u2015]/g, "-").replace(/[\u2022\u25CF]/g, "-")
    .replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\u2026/g, "...")
    .replace(/[^\x09\x0A\x0D\x20-\xFF]/g, "?");
}

export function safeResumeFilename(name: string): string {
  const safe = name.normalize("NFKD").replace(/[^\w -]/g, "").trim().replace(/[\s-]+/g, "_").slice(0, 70);
  return `CareerGuardian_Resume_${safe || "Candidate"}.pdf`;
}

function createFlow(doc: jsPDF, x: number, width: number, startY: number, bottom: number, defaultColor: [number, number, number]): TextFlow {
  const pages: PdfCommand[][] = [[]];
  let page = 0;
  let y = startY;
  const pushPage = () => { page += 1; pages[page] = []; y = 15; };
  const ensure = (height: number) => { if (y + height > bottom) pushPage(); };
  const write = (value: string, size = 9.3, options: WriteOptions = {}) => {
    const { bold = false, color = defaultColor, indent = 0, gap = 1.1, align = "left" } = options;
    doc.setFontSize(size);
    const wrapped = doc.splitTextToSize(cleanText(value), width - indent) as string[];
    const lineHeight = size * 0.42 + 1.1;
    for (const line of wrapped) {
      ensure(lineHeight);
      pages[page].push({ type: "text", text: line, x: x + indent, y, size, bold, color, align });
      y += lineHeight;
    }
    y += gap;
  };
  const heading = (text: string) => {
    ensure(14);
    y += 2;
    pages[page].push({ type: "text", text: cleanText(text.toUpperCase()), x, y, size: 10.4, bold: true, color: defaultColor });
    y += 2.3;
    pages[page].push({ type: "line", x1: x, x2: x + width, y, color: defaultColor });
    y += 5;
  };
  const marker = () => { ensure(8); pages[page].push({ type: "dot", x: x + 1, y: y - 1.5, color: [54, 79, 111] }); };
  return { pages, get y() { return y; }, write, heading, marker };
}

function validPhotoData(photoDataUrl?: string): boolean {
  return !!photoDataUrl && /^data:image\/(png|jpeg);base64,/i.test(photoDataUrl);
}

export function createResumePdf(data: ResumeData, photoDataUrl?: string, style: ResumeStyle = "professional-navy"): jsPDF {
  if (style === "ats-safe") return createAtsSafePdf(data);
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const sideFlow = createFlow(doc, 8, 58, 57, BOTTOM, [244, 247, 251]);

  const contact = [
    ["Phone", data.phone], ["Email", data.email], ["Location", data.location],
    ["LinkedIn", data.linkedin], ["GitHub", data.github], ["Portfolio", data.portfolio],
  ].filter((item) => item[1].trim());
  if (contact.length) {
    sideFlow.heading("Contact");
    contact.forEach(([label, value]) => sideFlow.write(`${label}: ${value}`, 7.8, { color: [232, 238, 246], gap: 1.2 }));
  }

  const education = data.education.filter((item) => Object.values(item).some((value) => value.trim()));
  if (education.length) {
    sideFlow.heading("Education");
    education.forEach((item) => {
      if (item.degree) sideFlow.write(item.degree, 8.3, { bold: true, color: [255, 255, 255], gap: 0.5 });
      if (item.institution) sideFlow.write(item.institution, 7.8, { color: [232, 238, 246], gap: 0.5 });
      const dates = [item.startDate, item.endDate].filter(Boolean).join(" - ");
      if (dates) sideFlow.write(dates, 7.4, { color: [190, 205, 222], gap: 0.5 });
      if (item.grade) sideFlow.write(item.grade, 7.8, { color: [232, 238, 246], gap: 2 });
    });
  }
  if (data.technicalSkills.length || data.developmentSkills.length || data.softSkills.length) {
    sideFlow.heading("Skills");
    if (data.technicalSkills.length) {
      sideFlow.write("Technical", 7.8, { bold: true, color: [190, 205, 222], gap: 0.5 });
      data.technicalSkills.forEach((skill) => sideFlow.write(`- ${skill}`, 7.7, { color: [232, 238, 246], gap: 0.5 }));
    }
    if (data.developmentSkills.length) {
      sideFlow.write("Development", 7.8, { bold: true, color: [190, 205, 222], gap: 0.5 });
      data.developmentSkills.forEach((skill) => sideFlow.write(`- ${skill}`, 7.7, { color: [232, 238, 246], gap: 0.5 }));
    }
    if (data.softSkills.length) {
      sideFlow.write("Soft Skills", 7.8, { bold: true, color: [190, 205, 222], gap: 0.5 });
      data.softSkills.forEach((skill) => sideFlow.write(`- ${skill}`, 7.7, { color: [232, 238, 246], gap: 0.5 }));
    }
  }
  const languages = data.languages.filter((language) => language.trim());
  if (languages.length) {
    sideFlow.heading("Languages");
    languages.forEach((language) => sideFlow.write(`- ${language}`, 7.7, { color: [232, 238, 246], gap: 0.5 }));
  }

  const mainX = SIDEBAR_WIDTH + 13;
  const mainWidth = PAGE_WIDTH - mainX - 12;
  const mainFlow = createFlow(doc, mainX, mainWidth, 15, BOTTOM, [38, 49, 66]);
  const addHeaderText = (value: string, y: number, size: number, bold: boolean, color: [number, number, number]) => {
    doc.setFontSize(size);
    const wrapped = doc.splitTextToSize(cleanText(value), mainWidth) as string[];
    const lineHeight = size * 0.42 + 1.1;
    wrapped.forEach((line, index) => mainFlow.pages[0].push({ type: "text", text: line, x: mainX, y: y + index * lineHeight, size, bold, color }));
    return y + wrapped.length * lineHeight;
  };
  let headerY = addHeaderText(data.name.toUpperCase(), 24, 21, true, [23, 34, 53]);
  if (data.title.trim()) headerY = addHeaderText(data.title.toUpperCase(), headerY + 2, 10.5, true, [57, 75, 100]);
  headerY += 3;
  mainFlow.pages[0].push({ type: "line", x1: mainX, x2: mainX + mainWidth, y: headerY, color: [207, 216, 227] });
  const contentFlow = createFlow(doc, mainX, mainWidth, headerY + 7, BOTTOM, [38, 49, 66]);

  const experience = sortResumeEntries(data.experience.filter((item) => [item.organization, item.role, item.location, item.startDate, item.endDate, item.description].some((value) => value.trim())));
  const projects = data.projects.filter((item) => Object.values(item).some((value) => value.trim()));
  const workExperience = experience.filter((item) => item.type === "experience");
  const internships = experience.filter((item) => item.type === "internship");
  const renderers: Record<string, () => void> = {
    summary: () => { if (data.professionalSummary.trim()) { contentFlow.heading("Profile"); contentFlow.write(data.professionalSummary, 9.2, { gap: 2 }); } },
    experience: () => { renderEmployment("Experience", workExperience); },
    internships: () => { renderEmployment("Internships", internships); },
    skills: () => { contentFlow.heading("Skills"); [...data.technicalSkills, ...data.softSkills].forEach((value) => contentFlow.write(`- ${value}`, 9.2, { gap: 1 })); },
    education: () => { contentFlow.heading("Education"); data.education.forEach((item) => { if (item.degree) contentFlow.write(item.degree, 9.4, { bold: true, gap: .5 }); if (item.institution) contentFlow.write(item.institution, 9, { gap: .5 }); const dates = [item.startDate, item.endDate].filter(Boolean).join(" - "); if (dates) contentFlow.write(dates, 8.3, { color: [103,116,134], gap: .5 }); if (item.location || item.grade) contentFlow.write([item.location, item.grade].filter(Boolean).join(" · "), 8.5, { gap: 2 }); }); },
    languages: () => { contentFlow.heading("Languages"); contentFlow.write(data.languages.filter(Boolean).join(", "), 9.2); },
    projects: () => { if (projects.length) { contentFlow.heading("Projects"); projects.forEach((item) => { if (item.title) contentFlow.write(item.title, 9.1, { bold: true, gap: 0.6 }); if (item.technologies) contentFlow.write(`Technologies: ${item.technologies}`, 8, { color: [92, 105, 122], gap: 0.5 }); if (item.role) contentFlow.write(`Role: ${item.role}`, 8, { color: [92, 105, 122], gap: 0.5 }); if (item.description) contentFlow.write(item.description, 8.8, { indent: 2, gap: 0.6 }); if (item.link) contentFlow.write(item.link, 7.8, { color: [57, 75, 100], gap: 3 }); }); } },
    certifications: () => { const values = data.certifications.filter((value) => value.trim()); if (values.length) { contentFlow.heading("Certifications"); values.forEach((value) => contentFlow.write(`- ${value}`, 8.8, { indent: 2, gap: 1 })); } },
    achievements: () => { const values = data.achievements.filter((value) => value.trim()); if (values.length) { contentFlow.heading("Achievements"); values.forEach((value) => contentFlow.write(`- ${value}`, 8.8, { indent: 2, gap: 1 })); } },
    references: () => { const values = data.references.filter((value) => value.trim()); if (values.length) { contentFlow.heading("Reference"); values.forEach((value) => contentFlow.write(value, 8.8, { gap: 2 })); } },
  };
  const renderEmployment = (heading: string, entries: typeof experience) => { if (!entries.length) return; contentFlow.heading(heading); entries.forEach((item) => { contentFlow.marker(); const title = [item.role, item.organization].filter(Boolean).join(" | "); if (title) contentFlow.write(title, 9.1, { bold: true, indent: 4, gap: 0.5 }); const dates = [item.startDate, item.endDate].filter(Boolean).join(" - "); if (dates) contentFlow.write(dates, 7.8, { color: [103, 116, 134], indent: 4, gap: 0.5 }); if (item.location) contentFlow.write(item.location, 8, { color: [103, 116, 134], indent: 4, gap: 0.5 }); if (item.description) contentFlow.write(item.description, 8.8, { indent: 6, gap: 3 }); }); };
  getResumeSectionOrder(data).forEach((key) => renderers[key]?.());

  const hasResumeContent = [data.name, data.title, ...contact.map((item) => item[1]), data.professionalSummary,
    ...data.education.flatMap(Object.values), ...data.technicalSkills, ...data.developmentSkills, ...data.softSkills,
    ...data.projects.flatMap(Object.values), ...data.experience.flatMap((item) => [item.organization, item.role, item.location, item.startDate, item.endDate, item.description]), ...data.certifications,
    ...data.achievements, ...data.languages, ...data.references].some((value) => value.trim());
  if (!hasResumeContent) contentFlow.write("Your profile and Career DNA details will appear here when available.", 9, { color: [103, 116, 134] });

  const pageCount = Math.max(sideFlow.pages.length, contentFlow.pages.length);
  const initials = data.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || " ";
  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    if (pageIndex > 0) doc.addPage("a4", "portrait");
    doc.setFillColor(255, 255, 255); doc.roundedRect(PAGE_MARGIN, PAGE_MARGIN, PAGE_WIDTH - PAGE_MARGIN * 2, PAGE_HEIGHT - PAGE_MARGIN * 2, 3, 3, "F");
    doc.setFillColor(...SIDEBAR_COLOR); doc.roundedRect(PAGE_MARGIN, PAGE_MARGIN, SIDEBAR_WIDTH, PAGE_HEIGHT - PAGE_MARGIN * 2, 3, 3, "F");
    doc.rect(SIDEBAR_WIDTH - 3, PAGE_MARGIN, 5, PAGE_HEIGHT - PAGE_MARGIN * 2, "F");
    if (pageIndex === 0) {
      doc.setDrawColor(238, 243, 249); doc.setLineWidth(1.1);
      if (validPhotoData(photoDataUrl)) {
        try { doc.addImage(photoDataUrl!, "PNG", 22, 13, 31, 31, undefined, "FAST"); }
        catch { drawInitials(); }
      } else drawInitials();
    }
    drawCommands(sideFlow.pages[pageIndex] || []); drawCommands(mainFlow.pages[pageIndex] || []); drawCommands(contentFlow.pages[pageIndex] || []);
  }
  return doc;

  function drawInitials() {
    doc.setFillColor(230, 236, 244); doc.circle(37.5, 28.5, 15.3, "F");
    doc.setDrawColor(255, 255, 255); doc.setLineWidth(1.2); doc.circle(37.5, 28.5, 15.3, "S");
    doc.setFont("helvetica", "bold"); doc.setFontSize(17); doc.setTextColor(30, 53, 84); doc.text(initials, 37.5, 30.5, { align: "center" });
  }
  function drawCommands(commands: PdfCommand[]) {
    for (const command of commands) {
      if (command.type === "line") { doc.setDrawColor(...command.color); doc.setLineWidth(0.25); doc.line(command.x1, command.y, command.x2, command.y); }
      else if (command.type === "dot") { doc.setFillColor(...command.color); doc.circle(command.x, command.y, 0.8, "F"); }
      else { doc.setFont("helvetica", command.bold ? "bold" : "normal"); doc.setFontSize(command.size); doc.setTextColor(...command.color); doc.text(command.text, command.x, command.y, { align: command.align || "left" }); }
    }
  }
}

function createAtsSafePdf(data: ResumeData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const margin = 18;
  const width = PAGE_WIDTH - margin * 2;
  const flow = createFlow(doc, margin, width, 15, PAGE_HEIGHT - margin, [30, 41, 59]);
  const contacts = [["Email", data.email], ["Phone", data.phone], ["Location", data.location], ["LinkedIn", data.linkedin], ["GitHub", data.github], ["Portfolio", data.portfolio]].filter(([, value]) => !!value.trim());
  let headerY = 25;
  const writeHeader = (value: string, size: number, bold: boolean, color: [number, number, number]) => {
    doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(size); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(cleanText(value), width) as string[];
    lines.forEach((line) => { doc.text(line, margin, headerY); headerY += size * .42 + 1.1; });
  };
  if (data.name) writeHeader(data.name, 21, true, [23, 34, 53]);
  if (data.title) { headerY += 1.5; writeHeader(data.title, 11, true, [57, 75, 100]); }
  if (contacts.length) { headerY += 2; writeHeader(contacts.map(([label, value]) => `${label}: ${value}`).join("  |  "), 8.2, false, [70, 82, 99]); }
  headerY += 2;
  doc.setDrawColor(190, 200, 212); doc.setLineWidth(.25); doc.line(margin, headerY, margin + width, headerY);
  // Rebuild flow at the correct starting position; reserve its first command page for the header above.
  const content = createFlow(doc, margin, width, headerY + 5, PAGE_HEIGHT - margin, [30, 41, 59]);
  const experience = sortResumeEntries(data.experience.filter((item) => [item.organization, item.role, item.location, item.startDate, item.endDate, item.description].some(Boolean)));
  const employment = (title: string, entries: typeof experience) => {
    if (!entries.length) return;
    content.heading(title);
    entries.forEach((item) => {
      const line = [item.role, item.organization].filter(Boolean).join(" | "); if (line) content.write(line, 9.5, { bold: true, gap: .5 });
      const details = [[item.startDate, item.endDate].filter(Boolean).join(" - "), item.location].filter(Boolean).join(" · "); if (details) content.write(details, 8.5, { color: [103,116,134], gap: .5 });
      if (item.description) content.write(item.description, 9, { gap: 2 });
    });
  };
  const renderers: Record<string, () => void> = {
    summary: () => { if (data.professionalSummary.trim()) { content.heading("Professional Summary"); content.write(data.professionalSummary, 9.5, { gap: 2 }); } },
    skills: () => { if (data.technicalSkills.length + data.developmentSkills.length + data.softSkills.length) { content.heading("Skills"); if (data.technicalSkills.length) content.write(`Technical: ${data.technicalSkills.join(", ")}`, 9.3, { gap: 1 }); if (data.developmentSkills.length) content.write(`Development: ${data.developmentSkills.join(", ")}`, 9.3, { gap: 1 }); if (data.softSkills.length) content.write(`Additional: ${data.softSkills.join(", ")}`, 9.3, { gap: 1 }); } },
    experience: () => employment("Experience", experience.filter((item) => item.type === "experience")),
    internships: () => employment("Internships", experience.filter((item) => item.type === "internship")),
    projects: () => { if (!data.projects.length) return; content.heading("Projects"); data.projects.forEach((item) => { if (item.title) content.write(item.title, 9.5, { bold: true, gap: .5 }); if (item.technologies) content.write(`Technologies: ${item.technologies}`, 8.5, { color: [92,105,122], gap: .5 }); if (item.role) content.write(`Role: ${item.role}`, 8.5, { color: [92,105,122], gap: .5 }); if (item.description) content.write(item.description, 9, { gap: .5 }); if (item.link) content.write(item.link, 8.2, { color: [57,75,100], gap: 2 }); }); },
    education: () => { if (!data.education.length) return; content.heading("Education"); data.education.forEach((item) => { if (item.degree) content.write(item.degree, 9.5, { bold: true, gap: .5 }); if (item.institution) content.write(item.institution, 9.2, { gap: .5 }); const details = [[item.startDate, item.endDate].filter(Boolean).join(" - "), item.location, item.grade].filter(Boolean).join(" · "); if (details) content.write(details, 8.5, { color: [92,105,122], gap: 2 }); }); },
    certifications: () => listSection("Certifications", data.certifications),
    achievements: () => listSection("Achievements", data.achievements),
    languages: () => { if (data.languages.length) { content.heading("Languages"); content.write(data.languages.join(", "), 9.2); } },
    references: () => listSection("References", data.references),
  };
  function listSection(title: string, values: string[]) { const items = values.filter(Boolean); if (!items.length) return; content.heading(title); items.forEach((item) => content.write(`- ${item}`, 9, { indent: 2, gap: 1 })); }
  getResumeSectionOrder(data, "ats-safe").forEach((key) => renderers[key]?.());
  const pages = content.pages;
  pages.forEach((commands, index) => {
    if (index) doc.addPage("a4", "portrait");
    draw(commands);
  });
  return doc;
  function draw(commands: PdfCommand[]) {
    for (const command of commands) {
      if (command.type === "line") { doc.setDrawColor(...command.color); doc.setLineWidth(.25); doc.line(command.x1, command.y, command.x2, command.y); }
      else if (command.type === "dot") { doc.setFillColor(...command.color); doc.circle(command.x, command.y, .8, "F"); }
      else { doc.setFont("helvetica", command.bold ? "bold" : "normal"); doc.setFontSize(command.size); doc.setTextColor(...command.color); doc.text(command.text, command.x, command.y, { align: command.align || "left" }); }
    }
  }
}

export async function downloadResumePdf(data: ResumeData, style: ResumeStyle = "professional-navy", photoDataUrl?: string): Promise<void> {
  createResumePdf(data, photoDataUrl, style).save(safeResumeFilename(data.name));
}
