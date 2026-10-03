import assert from "node:assert/strict";
import { mapProfileToResume, getResumeSectionOrder } from "../lib/mapProfileToResume";

const mapped = mapProfileToResume(
  { name: "Keerthi", email: "keerthi@example.com", college: "Example College", degree: "", skills: [], photoUrl: "https://example.com/keerthi.jpg", references: ["R. Mentor | mentor@example.com"] },
  {
    student: {
      degree: "B.Sc. Computer Science", cgpa: "8.4", skills: "React, TypeScript", projects: "Portfolio site",
      internship: "Built a dashboard during internship", github: "https://github.com/keerthi", linkedin: "https://linkedin.com/in/keerthi",
      jobPreferences: { roles: ["Frontend Developer"] },
    },
    report: { matchedSkills: ["Next.js"], missingSkills: ["Kubernetes"], recommendedProjects: ["Build a cloud platform"] },
  },
);

assert.equal(mapped.name, "Keerthi");
assert.equal(mapped.education[0]?.institution, "Example College");
assert.equal(mapped.education[0]?.degree, "B.Sc. Computer Science");
assert.deepEqual(mapped.technicalSkills, ["React", "TypeScript", "Next.js"]);
assert.equal(mapped.projects[0]?.title, "Portfolio site");
assert.match(mapped.professionalSummary, /Portfolio site/);
assert.equal(mapped.title, "Frontend Developer");
assert.equal(mapped.photoUrl, "https://example.com/keerthi.jpg");
assert.deepEqual(mapped.references, ["R. Mentor | mentor@example.com"]);
assert.ok(!mapped.technicalSkills.includes("Kubernetes"));
assert.ok(!mapped.projects.some((project) => project.title === "Build a cloud platform"));
assert.deepEqual(getResumeSectionOrder(mapped).slice(0, 4), ["summary", "projects", "internships", "certifications"]);
assert.deepEqual(getResumeSectionOrder(mapped, "ats-safe").slice(0, 5), ["summary", "skills", "projects", "internships", "experience"]);
assert.match(mapped.professionalSummary, /student with academic projects/);
assert.ok(!mapped.professionalSummary.includes("Education includes"));

console.log("Resume mapping scenarios passed: profile + Career DNA merge, empty profile fields, factual source filtering, student section order.");
