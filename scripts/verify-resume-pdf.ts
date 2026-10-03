import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { createResumePdf, safeResumeFilename } from "../lib/resumePdf";
import { emptyResume, type ResumeData } from "../components/resumeBuilder/resumeTypes";

const onePage = {
  ...emptyResume,
  name: "Maya O'Neil",
  title: "Software Engineer",
  email: "maya@example.com",
  location: "Chennai, India",
  professionalSummary: "Software engineer focused on reliable web applications.",
  technicalSkills: ["TypeScript", "React", "Node.js"],
  education: [{ degree: "B.Sc. Computer Science", institution: "Example University", location: "Chennai", startDate: "2022", endDate: "2025", grade: "8.7 CGPA" }],
  projects: [{ title: "Career Guardian", description: "Built a job verification dashboard.", technologies: "Next.js, TypeScript", role: "Developer", link: "https://example.com/project" }],
};

const emptyPdf = createResumePdf(emptyResume);
const pageCount = (doc: ReturnType<typeof createResumePdf>) => doc.internal.pages.length - 1;
assert.equal(pageCount(emptyPdf), 1, "empty resume remains a clean single page");
assert.ok(Math.abs(emptyPdf.internal.pageSize.getWidth() - 210) < 0.1, "page width uses A4 millimeters");
assert.ok(Math.abs(emptyPdf.internal.pageSize.getHeight() - 297) < 0.1, "page height uses A4 millimeters");
assert.equal(pageCount(createResumePdf(onePage)), 1, "ordinary resume fits one page");
const atsPdf = createResumePdf(onePage, undefined, "ats-safe");
assert.equal(pageCount(atsPdf), 1, "ATS Safe version of the same resume fits one page");
assert.ok(atsPdf.output("arraybuffer").byteLength > 500, "ATS Safe export has substantive PDF content");
assert.match(safeResumeFilename("Maya O'Neil / Test"), /^CareerGuardian_Resume_Maya_ONeil_Test\.pdf$/);

const twoPageResume = Array.from({ length: 220 }, (_, index) => `Experience detail ${index + 1}.`).join(" ");
const exactTwoPage = createResumePdf({ ...onePage, professionalSummary: twoPageResume });
assert.equal(pageCount(exactTwoPage), 2, "content that crosses one page continues onto exactly two pages");

const longDescription = Array.from({ length: 40 }, (_, index) =>
  `Delivered project milestone ${index + 1} with readable punctuation, URLs such as https://example.com/path/${index}, and careful implementation details.`
).join(" ");
const longPdf = createResumePdf({
  ...onePage,
  professionalSummary: `${onePage.professionalSummary} ${longDescription}`,
  projects: [{ ...onePage.projects[0], description: longDescription }],
  experience: [{ type: "internship", organization: "Example Labs", role: "Engineering Intern", location: "Remote", startDate: "2024", endDate: "2025", description: longDescription }],
});
assert.ok(pageCount(longPdf) >= 3, "long content flows onto three or more pages");
const output = new Uint8Array(longPdf.output("arraybuffer"));
assert.equal(String.fromCharCode(...output.slice(0, 4)), "%PDF", "export is a real PDF document");

const special = createResumePdf({ ...onePage, name: "Renée — O’Neil", professionalSummary: "Worked with café teams; shipped reliable tools…" });
assert.equal(pageCount(special), 1, "Latin punctuation and accents do not create extra pages");
if (process.env.RESUME_VISUAL_CHECK) {
  const visualData: ResumeData = {
    ...emptyResume, name: "Keerthi K", title: "Electronics & Communication Engineering Student", email: "keerthi@example.com",
    professionalSummary: "B.E. Electronics and Communication Engineering student with academic projects including Pick and Place Robot and Autonomous Pothole Detector. Skills include Robotics, PCB Design, Node.js, Next.js, SQL, MongoDB, Frontend Development, Backend Development.",
    education: [{ degree: "B.E. Electronics and Communication Engineering", institution: "Agni College of Technology", location: "", startDate: "", endDate: "", grade: "CGPA: 9.5" }],
    technicalSkills: ["Robotics", "PCB Design", "Node.js", "Next.js", "SQL", "MongoDB"], developmentSkills: ["Frontend Development", "Backend Development"],
    projects: [{ title: "Pick and Place Robot", description: "", technologies: "", role: "", link: "" }, { title: "Autonomous Pothole Detector", description: "", technologies: "", role: "", link: "" }],
    experience: [{ type: "internship", organization: "Approtech", role: "", location: "", startDate: "", endDate: "", description: "" }, { type: "internship", organization: "Retech", role: "", location: "", startDate: "", endDate: "", description: "" }],
  };
  const visualStyle = process.env.RESUME_VISUAL_STYLE === "professional-navy" ? "professional-navy" : "ats-safe";
  writeFileSync(process.env.RESUME_VISUAL_CHECK, Buffer.from(createResumePdf(visualData, undefined, visualStyle).output("arraybuffer")));
}
console.log("Resume PDF scenarios passed: empty, one-page navy and ATS Safe, A4 size, long multi-page content, filename, special Latin characters.");
