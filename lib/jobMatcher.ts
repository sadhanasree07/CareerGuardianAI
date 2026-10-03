export interface JobPreferences {
  roles?: string[];
  skills?: string[];
  locations?: string[];
  employmentTypes?: string[];
  preferredCompanies?: string[];
  minimumMatchScore?: number;
}

export interface CareerProfile {
  student?: Record<string, unknown>;
  report?: Record<string, unknown>;
  careerProfile?: Record<string, unknown>;
  resume?: Record<string, unknown>;
}

export interface MatchableJob {
  jobTitle: string;
  company: string;
  location: string;
  employmentType: string;
  skills: string[];
  experienceLevel?: string;
  description?: string;
}

export interface JobMatch {
  matchScore: number;
  matchedReasons: string[];
  matchedSkills: string[];
  missingSkills: string[];
}

function normalized(value: string) {
  return value.trim().toLowerCase();
}

function includesMatch(value: string, choices: string[]) {
  const normalizedValue = normalized(value);
  return choices.some((choice) => normalizedValue.includes(normalized(choice)) || normalized(choice).includes(normalizedValue));
}

export function matchJob(job: MatchableJob, preferences: JobPreferences, career: CareerProfile = {}): JobMatch {
  const roles = preferences.roles || [];
  const skills = preferences.skills || [];
  const locations = preferences.locations || [];
  const employmentTypes = preferences.employmentTypes || [];
  const preferredCompanies = preferences.preferredCompanies || [];
  const reasons: string[] = [];
  let score = 0;

  if (roles.length && includesMatch(job.jobTitle, roles)) {
    score += 35;
    reasons.push("Matches your preferred role");
  }

  const careerSkills = [
    ...(Array.isArray(career.report?.matchedSkills) ? career.report.matchedSkills : []),
    ...(typeof career.student?.skills === "string" ? career.student.skills.split(",") : []),
    ...(Array.isArray(career.resume?.technicalSkills) ? career.resume.technicalSkills : []),
    ...(Array.isArray(career.resume?.developmentSkills) ? career.resume.developmentSkills : []),
  ].map(String);
  const desiredSkills = [...new Set([...skills, ...careerSkills])];
  const matchedSkills = job.skills.filter((skill) => includesMatch(skill, desiredSkills));
  if (desiredSkills.length) {
    score += Math.round(30 * (matchedSkills.length / Math.max(job.skills.length, 1)));
    if (matchedSkills.length) reasons.push(`Uses your preferred skills: ${matchedSkills.slice(0, 3).join(" and ")}`);
  }

  if (locations.length && includesMatch(job.location, locations)) {
    score += 15;
    reasons.push("Matches your preferred location");
  }

  if (employmentTypes.length && includesMatch(job.employmentType, employmentTypes)) {
    score += 10;
    reasons.push("Matches your preferred employment type");
  }

  if (preferredCompanies.length && includesMatch(job.company, preferredCompanies)) {
    score += 5;
    reasons.push("Matches a preferred company");
  }

  const careerProfile = career.careerProfile || {};
  const experienceLevel = typeof careerProfile.experienceLevel === "string" ? careerProfile.experienceLevel : "";
  if (job.experienceLevel && experienceLevel && includesMatch(job.experienceLevel, [experienceLevel])) {
    score += 5;
    reasons.push("Experience level aligns with the listed requirement");
  }
  const education = typeof careerProfile.education === "string" ? careerProfile.education.trim().toLowerCase() : "";
  const jobDescription = `${job.description || ""}`.toLowerCase();
  if (education && /\b(degree|bachelor|master|graduate|diploma|b\.tech|b\.sc|m\.tech|m\.sc)\b/i.test(jobDescription)) {
    const educationTerms = education.split(/[·,;\s]+/).filter((term) => term.length > 2);
    if (educationTerms.some((term) => jobDescription.includes(term))) {
      score += 5;
      reasons.push("Education details align with wording in the job description");
    }
  }
  const resumeProjects = Array.isArray(career.resume?.projects) ? career.resume.projects : [];
  const projectMatches = resumeProjects.filter((project) => {
    const details = project && typeof project === "object" ? Object.values(project as Record<string, unknown>).join(" ").toLowerCase() : String(project).toLowerCase();
    return job.skills.some((skill) => details.includes(skill.toLowerCase()));
  });
  if (projectMatches.length) {
    score += Math.min(5, projectMatches.length * 2);
    reasons.push("Your resume includes projects using listed job skills");
  }
  const resumeExperience = Array.isArray(career.resume?.experience) ? career.resume.experience : [];
  const experienceText = `${job.jobTitle} ${job.description || ""}`.toLowerCase();
  const experienceMatches = resumeExperience.some((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const record = entry as Record<string, unknown>;
    return [record.role, record.organization].some((value) => typeof value === "string" && value.length > 3 && experienceText.includes(value.toLowerCase()));
  });
  if (experienceMatches) {
    score += 5;
    reasons.push("Your saved experience is relevant to the role description");
  }

  const readiness = Number(career.report?.readiness || 0);
  score += Math.round(Math.min(Math.max(readiness, 0), 100) * 0.1);

  if (job.skills.length) reasons.push(`${matchedSkills.length} of ${job.skills.length} listed requirements match your profile`);
  return {
    matchScore: Math.min(score, 100),
    matchedReasons: reasons.length ? reasons : ["Limited profile data is available for matching"],
    matchedSkills,
    missingSkills: job.skills.filter((skill) => !matchedSkills.includes(skill)),
  };
}
