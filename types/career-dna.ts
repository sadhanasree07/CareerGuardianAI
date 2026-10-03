export interface VerifiedJob {
  company: string;
  jobRole: string;
  salary: string;
  education: string;
  requiredSkills: string[];
}

export interface StudentProfile {
  degree: string;
  year: string;
  cgpa: string;
  skills: string;
  projects: string;
  internship: string;
  github: string;
  linkedin: string;
  jobPreferences?: JobPreferences;
}

export interface JobPreferences {
  roles: string[];
  skills: string[];
  locations: string[];
  employmentTypes: string[];
  preferredCompanies: string[];
  minimumMatchScore: number;
}

export interface RoadmapItem {
  week: string;
  task: string;
}

export interface SalaryPrediction {
  current: string;
  future: string;
}

export interface CareerDNAResult {
  readiness: number;
  matchedSkills: string[];
  missingSkills: string[];
  roadmap: RoadmapItem[];
  salaryPrediction: SalaryPrediction;
  recommendation: string;
}