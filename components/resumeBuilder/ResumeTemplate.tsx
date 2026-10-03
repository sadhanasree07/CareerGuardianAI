import type { ReactNode } from "react";
import type { ResumeData, ResumeStyle } from "./resumeTypes";
import { getResumeSectionOrder, sortResumeEntries } from "@/lib/mapProfileToResume";

const hasText = (value: string) => value.trim().length > 0;
const dateRange = (start: string, end: string) => [start, end].filter(hasText).join(" - ");
const validPhoto = (value: string) => {
  if (!value) return false;
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; }
  catch { return false; }
};

function SidebarSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="resume-sidebar-section"><h2>{title}</h2><div className="resume-sidebar-content">{children}</div></section>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="resume-section"><h2 className="resume-section-title">{title}</h2><div className="resume-section-content">{children}</div></section>;
}

export default function ResumeTemplate({ data, style = "professional-navy" }: { data: ResumeData; style?: ResumeStyle }) {
  const atsSafe = style === "ats-safe";
  const contactPairs: [string, string][] = [["Phone", data.phone], ["Email", data.email], ["Location", data.location], ["LinkedIn", data.linkedin], ["GitHub", data.github], ["Portfolio", data.portfolio]];
  const contact = contactPairs.filter((item) => hasText(item[1]));
  const education = data.education.filter((item) => Object.values(item).some(hasText));
  const experience = sortResumeEntries(data.experience.filter((item) => [item.organization, item.role, item.location, item.startDate, item.endDate, item.description].some(hasText)));
  const projects = data.projects.filter((item) => Object.values(item).some(hasText));
  const initials = data.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || " " ;
  const workExperience = experience.filter((item) => item.type === "experience");
  const internships = experience.filter((item) => item.type === "internship");
  const skillsContent = <>
    {data.technicalSkills.length > 0 && <div className="resume-sidebar-skill-group"><h3>Technical Skills</h3><ul>{data.technicalSkills.map((skill, index) => <li key={`technical-${index}`}>{skill}</li>)}</ul></div>}
    {data.developmentSkills.length > 0 && <div className="resume-sidebar-skill-group"><h3>Development</h3><ul>{data.developmentSkills.map((skill, index) => <li key={`development-${index}`}>{skill}</li>)}</ul></div>}
    {data.softSkills.length > 0 && <div className="resume-sidebar-skill-group"><h3>Soft Skills</h3><ul>{data.softSkills.map((skill, index) => <li key={`soft-${index}`}>{skill}</li>)}</ul></div>}
  </>;
  const sidebars: ReactNode[] = [];
  if (!atsSafe && contact.length) sidebars.push(<SidebarSection key="contact" title="Contact"><ul className="resume-contact-list">{contact.map(([label, value]) => <li key={label}><strong>{label}: </strong>{value}</li>)}</ul></SidebarSection>);
  if (education.length) sidebars.push(<SidebarSection key="education" title="Education">{education.map((item, index) => <div className="resume-sidebar-entry" key={`education-${index}`}><strong>{item.degree}</strong>{item.institution && <p>{item.institution}</p>}{dateRange(item.startDate, item.endDate) && <small>{dateRange(item.startDate, item.endDate)}</small>}{item.grade && <p>{item.grade}</p>}</div>)}</SidebarSection>);
  if (data.technicalSkills.length || data.developmentSkills.length || data.softSkills.length) sidebars.push(<SidebarSection key="skills" title="Skills">{skillsContent}</SidebarSection>);
  if (data.languages.some(hasText)) sidebars.push(<SidebarSection key="languages" title="Languages"><ul>{data.languages.filter(hasText).map((language, index) => <li key={`language-${index}`}>{language}</li>)}</ul></SidebarSection>);

  const sections: Record<string, ReactNode> = {
    summary: data.professionalSummary.trim() ? <Section key="summary" title="Profile"><p className="resume-preserve-lines">{data.professionalSummary}</p></Section> : null,
    experience: workExperience.length ? <Section key="experience" title="Experience">{workExperience.map((item, index) => <div className="resume-timeline-entry" key={`experience-${index}`}><div className="resume-entry-heading"><strong>{[item.role, item.organization].filter(hasText).join(" | ")}</strong><span>{dateRange(item.startDate, item.endDate)}</span></div>{item.location && <p className="resume-muted">{item.location}</p>}{item.description && <p className="resume-preserve-lines">{item.description}</p>}</div>)}</Section> : null,
    internships: internships.length ? <Section key="internships" title="Internships">{internships.map((item, index) => <div className="resume-timeline-entry" key={`internship-${index}`}><div className="resume-entry-heading"><strong>{[item.role, item.organization].filter(hasText).join(" | ")}</strong><span>{dateRange(item.startDate, item.endDate)}</span></div>{item.location && <p className="resume-muted">{item.location}</p>}{item.description && <p className="resume-preserve-lines">{item.description}</p>}</div>)}</Section> : null,
    skills: data.technicalSkills.length || data.developmentSkills.length || data.softSkills.length ? <Section key="skills" title="Skills">{data.technicalSkills.length > 0 && <p><strong>Technical: </strong>{data.technicalSkills.join(", ")}</p>}{data.developmentSkills.length > 0 && <p><strong>Development: </strong>{data.developmentSkills.join(", ")}</p>}{data.softSkills.length > 0 && <p><strong>Additional: </strong>{data.softSkills.join(", ")}</p>}</Section> : null,
    education: education.length ? <Section key="education" title="Education">{education.map((item, index) => <div className="resume-entry" key={`ats-education-${index}`}><div className="resume-entry-heading"><strong>{item.degree}</strong><span>{dateRange(item.startDate, item.endDate)}</span></div>{item.institution && <p>{item.institution}</p>}{item.location && <p className="resume-muted">{item.location}</p>}{item.grade && <p className="resume-muted">{item.grade}</p>}</div>)}</Section> : null,
    languages: data.languages.some(hasText) ? <Section key="languages" title="Languages"><p>{data.languages.filter(hasText).join(", ")}</p></Section> : null,
    projects: projects.length ? <Section key="projects" title="Projects">{projects.map((item, index) => <div className="resume-entry" key={`project-${index}`}><div className="resume-entry-heading"><strong>{item.title}</strong>{item.role && <span>{item.role}</span>}</div>{item.technologies && <p className="resume-muted"><strong>Technologies:</strong> {item.technologies}</p>}{item.description && <p className="resume-preserve-lines">{item.description}</p>}{item.link && <p className="resume-break-words">{item.link}</p>}</div>)}</Section> : null,
    certifications: data.certifications.some(hasText) ? <Section key="certifications" title="Certifications"><ul>{data.certifications.filter(hasText).map((item, index) => <li key={`cert-${index}`}>{item}</li>)}</ul></Section> : null,
    achievements: data.achievements.some(hasText) ? <Section key="achievements" title="Achievements"><ul>{data.achievements.filter(hasText).map((item, index) => <li key={`achievement-${index}`}>{item}</li>)}</ul></Section> : null,
    references: data.references.some(hasText) ? <Section key="references" title="Reference">{data.references.filter(hasText).map((item, index) => <p key={`reference-${index}`}>{item}</p>)}</Section> : null,
  };
  const visibleSections = getResumeSectionOrder(data, style).map((key) => sections[key]).filter((section): section is ReactNode => section !== null);
  const hasResumeContent = !!(data.name || data.title || contact.length || visibleSections.length || sidebars.length);

  return <article className={`resume-page ${atsSafe ? "resume-ats-safe" : "resume-professional-navy"}`} aria-label={`${atsSafe ? "ATS Safe" : "Professional Navy"} resume preview`}>
    {!atsSafe && <aside className="resume-sidebar">
      <div className="resume-photo-wrap">{validPhoto(data.photoUrl) ? <img className="resume-photo" src={data.photoUrl} alt={`${data.name || "Profile"} profile`} /> : <div className="resume-photo resume-photo-placeholder" aria-label="No profile photo provided">{initials}</div>}</div>
      {sidebars}
    </aside>}
    <main className="resume-main">
      <header className="resume-personal-header">{hasText(data.name) && <h1>{data.name}</h1>}{hasText(data.title) && <p className="resume-title">{data.title}</p>}{atsSafe && contact.length > 0 && <p className="resume-ats-contact">{contact.map(([label, value]) => `${label}: ${value}`).join("  |  ")}</p>}</header>
      {visibleSections}
      {!hasResumeContent && <p className="resume-empty">Your profile and Career DNA details will appear here when available.</p>}
    </main>
  </article>;
}
