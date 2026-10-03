export interface NormalizedJob {
  company: string;
  jobTitle: string;
  description: string;
  location: string;
  employmentType: string;
  skills: string[];
  jobUrl: string;
  companyWebsite?: string;
  source: string;
  postedAt: Date;
  expiresAt?: Date;
}

export interface JobSource {
  name: string;
  fetchJobs(): Promise<NormalizedJob[]>;
}

interface ArbeitnowJob {
  title?: string;
  company_name?: string;
  location?: string;
  description?: string;
  url?: string;
  tags?: string[];
  job_types?: string[];
  created_at?: number;
}

async function fetchArbeitnowJobs(): Promise<NormalizedJob[]> {
  const response = await fetch(process.env.JOB_SOURCE_URL || "https://www.arbeitnow.com/api/job-board-api", {
    headers: { Accept: "application/json" },
    next: { revalidate: 900 },
  });
  if (!response.ok) throw new Error(`Arbeitnow source returned ${response.status}`);
  const payload = await response.json() as { data?: ArbeitnowJob[] };
  return (payload.data || []).filter((job) => job.title && job.company_name && job.url).map((job) => ({
    company: job.company_name!, jobTitle: job.title!, description: job.description || "",
    location: job.location || "Not specified", employmentType: job.job_types?.[0] || "Full Time",
    skills: job.tags || [], jobUrl: job.url!, source: "arbeitnow",
    postedAt: job.created_at ? new Date(job.created_at * 1000) : new Date(),
  }));
}

const defaultSources: JobSource[] = [{ name: "arbeitnow", fetchJobs: fetchArbeitnowJobs }];

const sources: JobSource[] = [...defaultSources];

export function registerJobSource(source: JobSource) {
  sources.push(source);
}

export async function fetchJobsFromSources() {
  const results = await Promise.all(sources.map((source) => source.fetchJobs()));
  return results.flat();
}

export function getRegisteredJobSources() {
  return [...sources];
}
