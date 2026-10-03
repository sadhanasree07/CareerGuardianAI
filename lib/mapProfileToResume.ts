import { emptyResume, normalizeResume, type ResumeData, type ResumeStyle } from "../components/resumeBuilder/resumeTypes";

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as AnyRecord : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : typeof value === "number" ? String(value) : "";
}

function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(text).filter(Boolean);
  return typeof value === "string" ? value.split(/[\n,;]/).map((item) => item.trim()).filter(Boolean) : [];
}

function unique<T>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => { const key = JSON.stringify(item); if (seen.has(key)) return false; seen.add(key); return true; });
}

export function normalizeSkills(values: string[]): string[] {
  const expanded = values.flatMap((value) => /frontend\s+and\s+backend\s+developer/i.test(value)
    ? ["Frontend Development", "Backend Development"]
    : [value]);
  const seen = new Set<string>();
  return expanded.map((value) => value.trim()).filter((value) => {
    const key = value.toLocaleLowerCase().replace(/\s+/g, " ");
    if (!key || seen.has(key)) return false;
    seen.add(key); return true;
  });
}

export function generateProfessionalSummary(resume: ResumeData, careerDirection = ""): string {
  const education = resume.education.find((item) => item.degree || item.institution);
  const educationLabel = education?.degree || "";
  const student = !!educationLabel && !resume.experience.some((entry) => entry.type === "experience");
  const projects = resume.projects.map((project) => project.title).filter(Boolean).slice(0, 2);
  const skills = [...resume.technicalSkills, ...resume.developmentSkills].slice(0, 7);
  const focus = careerDirection || resume.title;
  const opening = [educationLabel, student ? "student" : "professional"].filter(Boolean).join(" ");
  const sentences: string[] = [];
  if (opening && projects.length) sentences.push(`${opening} with academic projects including ${projects.join(" and ")}.`);
  else if (opening && skills.length) sentences.push(`${opening} with a foundation in ${skills.slice(0, 3).join(", ")}.`);
  else if (opening) sentences.push(`${opening}.`);
  if (skills.length) sentences.push(`Skills include ${skills.join(", ")}.`);
  if (focus && !sentences.join(" ").toLowerCase().includes(focus.toLowerCase())) sentences.push(`Career direction: ${focus}.`);
  return sentences.join(" ");
}

function dateOrder(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function sortResumeEntries<T extends { startDate?: string; endDate?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => dateOrder(b.endDate || b.startDate || "") - dateOrder(a.endDate || a.startDate || ""));
}

function mergeEducation(profileItems: ResumeData["education"], dnaItems: ResumeData["education"]): ResumeData["education"] {
  const merged = profileItems.map((profileItem, index) => {
    const dnaItem = dnaItems[index];
    if (!dnaItem) return profileItem;
    return {
      degree: profileItem.degree || dnaItem.degree,
      institution: profileItem.institution || dnaItem.institution,
      location: profileItem.location || dnaItem.location,
      startDate: profileItem.startDate || dnaItem.startDate,
      endDate: profileItem.endDate || dnaItem.endDate,
      grade: profileItem.grade || dnaItem.grade,
    };
  });
  return [...merged, ...dnaItems.slice(merged.length)];
}

export function mapProfileToResume(profileValue: unknown, careerDNAValue: unknown): ResumeData {
  const profile = asRecord(profileValue);
  const dna = asRecord(careerDNAValue);
  const student = asRecord(dna.student);
  const report = asRecord(dna.report);
  const preferences = asRecord(student.jobPreferences ?? dna.jobPreferences);
  const profileResume = normalizeResume(profile);
  const studentResume = normalizeResume(student);

  const mapped = normalizeResume({
    ...emptyResume,
    name: text(profile.name) || text(student.name),
    email: text(profile.email) || text(student.email),
    phone: text(profile.phone) || text(student.phone),
    location: text(profile.location) || text(student.location),
    linkedin: text(profile.linkedin) || text(student.linkedin),
    github: text(profile.github) || text(student.github),
    portfolio: text(profile.portfolio) || text(student.portfolio),
    photoUrl: text(profile.photoUrl) || text(profile.profilePhotoUrl) || text(student.photoUrl),
    title: text(profile.professionalTitle) || text(profile.careerGoal)
      || toList(preferences.roles)[0]
      || text(student.careerDirection ?? report.careerDirection),
    professionalSummary: text(profile.professionalSummary) || text(student.professionalSummary),
    degree: text(profile.degree) || text(student.degree),
    college: text(profile.college) || text(student.college) || text(student.institution),
    cgpa: text(profile.cgpa) || text(student.cgpa),
    passingYear: text(profile.graduationYear) || text(student.graduationYear),
    skills: [...profileResume.technicalSkills, ...studentResume.technicalSkills],
    developmentSkills: [...profileResume.developmentSkills, ...studentResume.developmentSkills],
    education: mergeEducation(profileResume.education, studentResume.education),
    projects: unique([...profileResume.projects, ...studentResume.projects]),
    experience: unique([...profileResume.experience, ...studentResume.experience]),
    certifications: unique([...profileResume.certifications, ...studentResume.certifications]),
    achievements: unique([...profileResume.achievements, ...studentResume.achievements]),
    languages: unique([...profileResume.languages, ...studentResume.languages]),
    references: unique([...profileResume.references, ...studentResume.references]),
  });

  // Career DNA matched skills are evidence that the learner listed those skills;
  // missing skills and recommendations are intentionally excluded.
  const matchedSkills = toList(report.matchedSkills);
  const allSkills = normalizeSkills([...mapped.technicalSkills, ...mapped.developmentSkills, ...matchedSkills]);
  mapped.developmentSkills = allSkills.filter((skill) => /front\s*end|back\s*end|full.?stack|web development/i.test(skill));
  mapped.technicalSkills = allSkills.filter((skill) => !mapped.developmentSkills.includes(skill));
  if (!mapped.professionalSummary) {
    mapped.professionalSummary = generateProfessionalSummary(mapped, text(student.careerDirection ?? report.careerDirection));
  }
  return mapped;
}

export function resumeHasSourceContent(resume: ResumeData): boolean {
  return [resume.name, resume.email, resume.phone, resume.location, resume.linkedin, resume.github,
    resume.portfolio, resume.photoUrl, resume.title, resume.professionalSummary, ...resume.technicalSkills, ...resume.developmentSkills, ...resume.softSkills,
    ...resume.education.flatMap(Object.values), ...resume.projects.flatMap(Object.values),
    ...resume.experience.flatMap((item) => [item.organization, item.role, item.location, item.startDate, item.endDate, item.description]), ...resume.certifications, ...resume.achievements, ...resume.languages, ...resume.references]
    .some((value) => typeof value === "string" && value.trim().length > 0);
}

export function getResumeSectionOrder(resume: ResumeData, style: ResumeStyle = "professional-navy"): string[] {
  const hasWork = resume.experience.some((item) => item.type === "experience" && [item.organization, item.role, item.startDate, item.endDate, item.description].some(Boolean));
  const hasInternship = resume.experience.some((item) => item.type === "internship" && [item.organization, item.role, item.startDate, item.endDate, item.description].some(Boolean));
  const experienced = hasWork;
  const navyOrder = experienced
    ? ["summary", "experience", "internships", "projects", "certifications", "achievements", "references"]
    : ["summary", "projects", "internships", "experience", "certifications", "achievements", "references"];
  const atsOrder = experienced
    ? ["summary", "skills", "experience", "internships", "projects", "education", "certifications", "achievements", "languages", "references"]
    : ["summary", "skills", "projects", "internships", "experience", "education", "certifications", "achievements", "languages", "references"];
  return style === "ats-safe" ? atsOrder : navyOrder.filter((key) => key !== "internships" || hasInternship).filter((key) => key !== "experience" || hasWork);
}
