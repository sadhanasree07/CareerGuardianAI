export interface ResumeEducation {
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  grade: string;
}

export interface ResumeProject {
  title: string;
  description: string;
  technologies: string;
  role: string;
  link: string;
}

export interface ResumeExperience {
  type: "experience" | "internship";
  organization: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  professionalSummary: string;
  education: ResumeEducation[];
  technicalSkills: string[];
  developmentSkills: string[];
  softSkills: string[];
  projects: ResumeProject[];
  experience: ResumeExperience[];
  certifications: string[];
  achievements: string[];
  languages: string[];
  references: string[];
  photoUrl: string;
}

export type ResumeStyle = "professional-navy" | "ats-safe";

export const emptyResume: ResumeData = {
  name: "", title: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "",
  professionalSummary: "", education: [], technicalSkills: [], developmentSkills: [], softSkills: [], projects: [], experience: [],
  certifications: [], achievements: [], languages: [], references: [], photoUrl: "",
};

const strings = (value: unknown): string[] => Array.isArray(value)
  ? value.map((item) => {
    if (typeof item === "string") return item;
    if (!item || typeof item !== "object") return "";
    const record = item as Record<string, unknown>;
    return [record.name ?? record.title, record.issuer ?? record.organization, record.date ?? record.issueDate].map(str).filter(Boolean).join(" | ");
  }).filter(Boolean)
  : [];
const stringList = (value: unknown): string[] => Array.isArray(value)
  ? strings(value)
  : typeof value === "string" ? value.split(/[\n,;]/).map((item) => item.trim()).filter(Boolean) : [];

function objectItems<T>(value: unknown, convert: (item: Record<string, unknown>) => T): T[] {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => !!item && typeof item === "object").map(convert) : [];
}

const str = (value: unknown) => typeof value === "string" ? value : value == null ? "" : String(value);
const looksLikeDuty = (value: string) => /\b(built|developed|designed|implemented|integrated|tested|configured|created|assisted|supported|worked|analyzed|researched|managed|delivered|contributed)\b/i.test(value);

export function normalizeResume(value: unknown): ResumeData {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const education = objectItems(raw.education, (item) => ({
    degree: str(item.degree), institution: str(item.institution) || str(item.college), location: str(item.location),
    startDate: str(item.startDate), endDate: str(item.endDate ?? item.passingYear), grade: str(item.grade ?? item.cgpa),
  }));
  if (!education.length && [raw.degree, raw.college, raw.cgpa, raw.passingYear].some(Boolean)) {
    education.push({ degree: str(raw.degree), institution: str(raw.college), location: "", startDate: "", endDate: str(raw.passingYear), grade: str(raw.cgpa) });
  }
  const projectsSource = typeof raw.projects === "string" ? raw.projects.split(/\n+/).map((item) => item.trim()).filter(Boolean) : raw.projects;
  const projects = Array.isArray(projectsSource) ? projectsSource.map((item) => typeof item === "string"
    ? { title: item, description: "", technologies: "", role: "", link: "" }
    : item && typeof item === "object" ? {
      title: str((item as Record<string, unknown>).title) || str((item as Record<string, unknown>).name),
      description: str((item as Record<string, unknown>).description), technologies: Array.isArray((item as Record<string, unknown>).technologies) ? strings((item as Record<string, unknown>).technologies).join(", ") : str((item as Record<string, unknown>).technologies),
      role: str((item as Record<string, unknown>).role), link: str((item as Record<string, unknown>).link ?? (item as Record<string, unknown>).url),
    } : null).filter((item): item is ResumeProject => !!item) : [];
  const hasWorkExperience = Array.isArray(raw.experience) && raw.experience.length > 0;
  const expValue = hasWorkExperience ? raw.experience : raw.internships ?? raw.internship ?? raw.experience;
  const defaultExperienceType = hasWorkExperience ? "experience" : "internship";
  const expSource = typeof expValue === "string" ? expValue.split(/[\n,;]+/).map((item) => item.trim()).filter(Boolean) : expValue;
  const experience = Array.isArray(expSource) ? expSource.map((item) => typeof item === "string"
    ? { type: defaultExperienceType as "experience" | "internship", organization: defaultExperienceType === "internship" && !looksLikeDuty(item) ? item : "", role: "", location: "", startDate: "", endDate: "", description: defaultExperienceType === "internship" && !looksLikeDuty(item) ? "" : item }
    : item && typeof item === "object" ? {
      type: (str((item as Record<string, unknown>).type) === "internship" ? "internship" : defaultExperienceType) as "experience" | "internship",
      organization: str((item as Record<string, unknown>).organization) || str((item as Record<string, unknown>).company),
      role: str((item as Record<string, unknown>).role) || str((item as Record<string, unknown>).title),
      location: str((item as Record<string, unknown>).location), startDate: str((item as Record<string, unknown>).startDate),
      endDate: str((item as Record<string, unknown>).endDate), description: str((item as Record<string, unknown>).description),
    } : null).filter((item): item is ResumeExperience => !!item) : [];
  return {
    name: str(raw.name) || str(raw.fullName), title: str(raw.title) || str(raw.professionalTitle), email: str(raw.email), phone: str(raw.phone),
    location: str(raw.location), linkedin: str(raw.linkedin), github: str(raw.github), portfolio: str(raw.portfolio),
    professionalSummary: str(raw.professionalSummary) || str(raw.summary), education,
    technicalSkills: stringList(raw.technicalSkills).length ? stringList(raw.technicalSkills) : stringList(raw.skills),
    developmentSkills: stringList(raw.developmentSkills),
    softSkills: stringList(raw.softSkills), projects, experience,
    certifications: stringList(raw.certifications).length ? stringList(raw.certifications) : stringList(raw.certs),
    achievements: stringList(raw.achievements), languages: stringList(raw.languages), references: stringList(raw.references),
    photoUrl: str(raw.photoUrl ?? raw.profilePhotoUrl ?? raw.avatarUrl),
  };
}
