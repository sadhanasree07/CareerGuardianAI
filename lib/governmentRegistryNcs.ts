import { createHash } from "node:crypto";



export type NcsReferenceStatus = "EXACT_MATCH" | "STRONG_MATCH" | "PARTIAL_MATCH" | "NO_MATCH" | "NOT_FOUND" | "UNAVAILABLE" | "NOT_APPLICABLE";

export type NcsEvidenceStatus = "PASS" | "MISMATCH" | "UNKNOWN";



export interface NcsFieldEvidence {

  layer: "GOVERNMENT_REFERENCE";

  source: "NCS";

  signal: string;

  observedValue: string | null;

  referenceValue: string | null;

  status: NcsEvidenceStatus;

  sourceUrl: string;

  timestamp: string;

  independent: true;

  confidence: number;

}



export interface NcsReferenceResult {

  source: "NCS";

  status: NcsReferenceStatus;

  governmentJobClaim: boolean;

  organization: string | null;

  jobTitle: string | null;

  notificationNumber: string | null;

  matchedFields: string[];

  mismatchedFields: string[];

  unavailableFields: string[];

  ncsReferenceUrl: string | null;

  officialSourceUrl: string | null;

  evidence: NcsFieldEvidence[];

  confidence: number;

  checkedAt: string | null;

  reason?: string;

  searchQueries: string[];

}



export interface NcsOpportunityInput {

  governmentJobClaim: boolean;

  organization?: string;

  department?: string;

  jobTitle?: string;

  notificationNumber?: string;

  advertisementNumber?: string;

  recruitmentNumber?: string;

  jobId?: string;

  recruitmentYear?: string;

  location?: string;

  applicationStartDate?: string;

  applicationEndDate?: string;

  applicationUrl?: string;

  sourceUrl?: string;

  eligibility?: string;

  salary?: string;

  rawText?: string;

}



export interface NcsReferenceRecord {

  organization: string;

  department: string;

  jobTitle: string;

  notificationNumber: string;

  advertisementNumber: string;

  jobId: string;

  recruitmentYear: string;

  location: string;

  applicationStartDate: string;

  applicationEndDate: string;

  applicationUrl: string;

  eligibility: string;

  salary: string;

  ncsReferenceUrl: string;

}



export interface NcsParsedPage {

  machineReadable: boolean;

  queryScoped: boolean;

  records: NcsReferenceRecord[];

}



const NCS_HOSTS = new Set(["ncs.gov.in", "www\.ncs.gov.in"]);

const NCS_LISTING_PATH = "/job-listing?isGovernmentJob=true";

const MAX_RESPONSE_BYTES = 1_000_000;

const POSITIVE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const NEGATIVE_CACHE_TTL_MS = 10 * 60 * 1000;

const UNAVAILABLE_COOLDOWN_MS = 2 * 60 * 1000;

const MIN_REQUEST_INTERVAL_MS = 750;

const UNAVAILABLE_FIELDS = ["organization", "jobTitle", "notificationNumber", "advertisementNumber", "jobId", "recruitmentYear", "applicationDates", "applicationUrl", "location", "eligibility", "salary"];



type VerifyOptions = {

  fetcher?: typeof fetch;

  now?: () => number;

  useCache?: boolean;

  minRequestIntervalMs?: number;

};



type CacheEntry = { result: NcsReferenceResult; expiresAt: number };

const memoryCache = new Map<string, CacheEntry>();

const inFlight = new Map<string, Promise<NcsReferenceResult>>();

let lastRequestAt = 0;



function text(value: unknown): string {

  if (typeof value === "string" || typeof value === "number") return String(value).trim();

  if (value && typeof value === "object") {

    const record = value as Record<string, unknown>;

    return text(record.name ?? record.value ?? record.identifier ?? record.text);

  }

  return "";

}



function canonicalText(value: string): string {

  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim().replace(/\s+/g, " ");

}



export function normalizeGovernmentOrganization(value: string): string {

  const normalized = canonicalText(value);

  const aliases: Array<[RegExp, string]> = [

    [/^(SSC|STAFF SELECTION COMMISSION)$/, "STAFF SELECTION COMMISSION"],

    [/^(UPSC|UNION PUBLIC SERVICE COMMISSION)$/, "UNION PUBLIC SERVICE COMMISSION"],

    [/^(RRB|RAILWAY RECRUITMENT BOARD|RAILWAYS RECRUITMENT BOARD)$/, "RAILWAY RECRUITMENT BOARD"],

    [/^(INDIAN RAILWAYS|RAILWAYS)$/, "INDIAN RAILWAYS"],

    [/^(INDIA POST|DEPARTMENT OF POSTS|DEPARTMENT OF POST)$/, "DEPARTMENT OF POSTS"],

  ];

  return aliases.find(([pattern]) => pattern.test(normalized))?.[1] || normalized;

}



export function normalizeRecruitmentTitle(value: string): string {

  return canonicalText(value)

    .replace(/^(?:STAFF SELECTION COMMISSION|SSC|UNION PUBLIC SERVICE COMMISSION|UPSC|RAILWAY RECRUITMENT BOARD|RRB)\s+/, "")

    .replace(/\bCGL\b/g, "COMBINED GRADUATE LEVEL")

    .replace(/\bCHSL\b/g, "COMBINED HIGHER SECONDARY LEVEL")

    .replace(/\s+/g, " ")

    .trim();

}



export function normalizeRecruitmentIdentifier(value: string): string {

  return canonicalText(value).replace(/[^A-Z0-9]/g, "");

}



export function generateNcsSearchQueries(input: NcsOpportunityInput): string[] {

  const organization = text(input.organization);

  const title = text(input.jobTitle);

  const notification = text(input.notificationNumber);

  const advertisement = text(input.advertisementNumber);

  const recruitment = text(input.recruitmentNumber);

  const jobId = text(input.jobId);

  const year = text(input.recruitmentYear);

  const queries = [

    notification,

    advertisement,

    recruitment,

    jobId,

    [organization, notification].filter(Boolean).join(" "),

    [organization, advertisement].filter(Boolean).join(" "),

    [organization, title].filter(Boolean).join(" "),

    [organization, normalizeRecruitmentTitle(title)].filter(Boolean).join(" "),

    [title, organization, year].filter(Boolean).join(" "),

    [organization, title, input.location].filter(Boolean).join(" "),

  ];

  return [...new Set(queries.map((query) => query.trim()).filter(Boolean))].slice(0, 10);

}



function getApprovedNcsBase(value = process.env.NCS_BASE_URL || "https\://www\.ncs.gov.in"): URL | null {

  try {

    const url = new URL(value);

    if (url.protocol !== "https:" || !NCS_HOSTS.has(url.hostname.toLowerCase()) || url.username || url.password || (url.port && url.port !== "443")) return null;

    return new URL("https\://www\.ncs.gov.in");

  } catch {

    return null;

  }

}



export function isApprovedNcsUrl(value: string): boolean {

  try {

    const url = new URL(value);

    return url.protocol === "https:" && NCS_HOSTS.has(url.hostname.toLowerCase()) && !url.username && !url.password && (!url.port || url.port === "443");

  } catch {

    return false;

  }

}



function normalizeUrl(value: string): string {

  try {

    const url = new URL(value);

    url.hash = "";

    url.search = "";

    return `${url.hostname.toLowerCase()}${url.pathname.replace(/\/$/, "")}`;

  } catch {

    return "";

  }

}



function normalizeRecord(value: Record<string, unknown>, referenceUrl: string): NcsReferenceRecord | null {

  const hiring = value.hiringOrganization && typeof value.hiringOrganization === "object" ? value.hiringOrganization as Record<string, unknown> : {};

  const identifier = value.identifier && typeof value.identifier === "object" ? value.identifier as Record<string, unknown> : {};

  const locationValue = value.jobLocation && typeof value.jobLocation === "object" ? value.jobLocation as Record<string, unknown> : {};

  const address = locationValue.address && typeof locationValue.address === "object" ? locationValue.address as Record<string, unknown> : {};

  const organization = text(value.organization ?? value.companyName ?? value.employer ?? value.company ?? hiring.name);

  const jobTitle = text(value.jobTitle ?? value.positionTitle ?? value.position ?? value.title);

  if (!organization || !jobTitle) return null;

  const identifierValue = text(value.notificationNumber ?? value.advertisementNumber ?? value.recruitmentNumber ?? identifier.value ?? identifier.name);

  const applicationUrl = text(value.applicationUrl ?? value.applyUrl ?? value.applicationLink ?? value.externalApplicationUrl ?? value.recruitmentUrl);

  return {

    organization,

    department: text(value.department ?? value.ministry),

    jobTitle,

    notificationNumber: text(value.notificationNumber ?? identifierValue),

    advertisementNumber: text(value.advertisementNumber ?? identifierValue),

    jobId: text(value.jobId ?? value.jobID ?? value.id),

    recruitmentYear: text(value.recruitmentYear ?? value.year ?? value.datePosted ?? value.postedDate).match(/(?:19|20)\d{2}/)?.[0] || "",

    location: text(value.location ?? address.addressLocality ?? address.addressRegion),

    applicationStartDate: text(value.applicationStartDate ?? value.startDate),

    applicationEndDate: text(value.applicationEndDate ?? value.validThrough ?? value.lastDate),

    applicationUrl: /^https:\/\//i.test(applicationUrl) ? applicationUrl : "",

    eligibility: text(value.eligibility ?? value.qualifications ?? value.qualification ?? value.education),

    salary: text(value.salary ?? value.baseSalary),

    ncsReferenceUrl: referenceUrl,

  };

}



function collectRecords(value: unknown, referenceUrl: string, records: NcsReferenceRecord[], state: { machineReadable: boolean }, depth = 0): void {

  if (depth > 12 || records.length >= 500) return;

  if (Array.isArray(value)) {

    for (const item of value) collectRecords(item, referenceUrl, records, state, depth + 1);

    return;

  }

  if (!value || typeof value !== "object") return;

  const object = value as Record<string, unknown>;

  const type = text(object["@type"]);

  const hasJobContainer = Object.keys(object).some((key) => /^(jobs?|joblistings?|jobposts?|vacancies|recruitments|jobresults)$/i.test(key));

  if (/jobposting/i.test(type) || hasJobContainer) state.machineReadable = true;

  const candidate = normalizeRecord(object, referenceUrl);

  if (candidate && (/jobposting/i.test(type) || hasJobContainer || Boolean(object.jobTitle || object.positionTitle || object.jobID))) records.push(candidate);

  for (const child of Object.values(object)) collectRecords(child, referenceUrl, records, state, depth + 1);

}



export function parseOfficialNcsPage(html: string, referenceUrl: string): NcsParsedPage {

  if (!isApprovedNcsUrl(referenceUrl)) return { machineReadable: false, queryScoped: false, records: [] };

  const state = { machineReadable: false };

  const records: NcsReferenceRecord[] = [];

  const scripts = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  for (const script of scripts) {

    try { collectRecords(JSON.parse(script[1]), referenceUrl, records, state); }

    catch { /* Ignore malformed structured data and continue with other official references. */ }

  }

  const angularState = html.match(/<script\b[^>]*id=["']ng-state["'][^>]*>([\s\S]*?)<\/script>/i);

  if (angularState?.[1]) {

    try { collectRecords(JSON.parse(angularState[1]), referenceUrl, records, state); }

    catch { /* An HTML shell without parseable state is not a reference result. */ }

  }

  const deduped = [...new Map(records.map((record) => [

    [normalizeGovernmentOrganization(record.organization), normalizeRecruitmentTitle(record.jobTitle), normalizeRecruitmentIdentifier(record.notificationNumber || record.advertisementNumber || record.jobId)].join("|"),

    record,

  ])).values()];

  const queryScoped = [...new URL(referenceUrl).searchParams.keys()].some((key) => /search|query|keyword/i.test(key));

  return { machineReadable: state.machineReadable, queryScoped, records: deduped };

}



type FieldComparison = { matched: string[]; mismatched: string[]; unavailable: string[]; evidence: NcsFieldEvidence[] };



function compareOpportunity(input: NcsOpportunityInput, reference: NcsReferenceRecord, now: string): FieldComparison {

  const pairs: Array<[string, string, string, (submitted: string, official: string) => boolean]> = [

    ["organization", text(input.organization), reference.organization, (a, b) => normalizeGovernmentOrganization(a) === normalizeGovernmentOrganization(b)],

    ["department", text(input.department), reference.department, (a, b) => canonicalText(a) === canonicalText(b)],

    ["jobTitle", text(input.jobTitle), reference.jobTitle, (a, b) => normalizeRecruitmentTitle(a) === normalizeRecruitmentTitle(b)],

    ["notificationNumber", text(input.notificationNumber), reference.notificationNumber, (a, b) => normalizeRecruitmentIdentifier(a) === normalizeRecruitmentIdentifier(b)],

    ["advertisementNumber", text(input.advertisementNumber), reference.advertisementNumber, (a, b) => normalizeRecruitmentIdentifier(a) === normalizeRecruitmentIdentifier(b)],

    ["jobId", text(input.jobId), reference.jobId, (a, b) => normalizeRecruitmentIdentifier(a) === normalizeRecruitmentIdentifier(b)],

    ["recruitmentYear", text(input.recruitmentYear), reference.recruitmentYear, (a, b) => a === b],

    ["applicationStartDate", text(input.applicationStartDate), reference.applicationStartDate, (a, b) => canonicalText(a) === canonicalText(b)],

    ["applicationEndDate", text(input.applicationEndDate), reference.applicationEndDate, (a, b) => canonicalText(a) === canonicalText(b)],

    ["applicationUrl", text(input.applicationUrl), reference.applicationUrl, (a, b) => normalizeUrl(a) === normalizeUrl(b)],

    ["location", text(input.location), reference.location, (a, b) => canonicalText(a) === canonicalText(b)],

    ["eligibility", text(input.eligibility), reference.eligibility, (a, b) => canonicalText(a) === canonicalText(b)],

    ["salary", text(input.salary), reference.salary, (a, b) => canonicalText(a) === canonicalText(b)],

  ];

  const matched: string[] = [];

  const mismatched: string[] = [];

  const unavailable: string[] = [];

  const evidence: NcsFieldEvidence[] = [];

  for (const [field, submitted, official, equals] of pairs) {

    if (!submitted || !official) {

      unavailable.push(field);

      continue;

    }

    const isMatch = equals(submitted, official);

    (isMatch ? matched : mismatched).push(field);

    evidence.push({

      layer: "GOVERNMENT_REFERENCE",

      source: "NCS",

      signal: `${field.toUpperCase()}_${isMatch ? "MATCH" : "MISMATCH"}`,

      observedValue: submitted,

      referenceValue: official,

      status: isMatch ? "PASS" : "MISMATCH",

      sourceUrl: reference.ncsReferenceUrl,

      timestamp: now,

      independent: true,

      confidence: isMatch ? field === "notificationNumber" || field === "advertisementNumber" ? 98 : 90 : 96,

    });

  }

  return { matched, mismatched, unavailable, evidence };

}



function scoreReference(input: NcsOpportunityInput, reference: NcsReferenceRecord, now: string) {

  const comparison = compareOpportunity(input, reference, now);

  const organizationMatches = comparison.matched.includes("organization");

  const titleMatches = comparison.matched.includes("jobTitle");

  const identifierMatches = ["notificationNumber", "advertisementNumber", "jobId"].some((field) => comparison.matched.includes(field));

  const identityMismatches = ["organization", "notificationNumber", "advertisementNumber", "jobId"].some((field) => comparison.mismatched.includes(field));

  const relevant = organizationMatches || titleMatches || identifierMatches;

  let status: NcsReferenceStatus;

  let confidence = Math.min(85, 35 + comparison.matched.length * 6);

  if (identityMismatches && relevant) {

    status = "NO_MATCH";

    confidence = 90;

  } else if (organizationMatches && titleMatches && identifierMatches && comparison.mismatched.length === 0) {

    status = "EXACT_MATCH";

    confidence = 98;

  } else if (organizationMatches && titleMatches && comparison.matched.length >= 3 && comparison.mismatched.length === 0) {

    status = "STRONG_MATCH";

    confidence = 92;

  } else if (comparison.matched.length) {

    status = "PARTIAL_MATCH";

    confidence = Math.min(78, confidence);

  } else {

    status = "NOT_FOUND";

    confidence = 0;

  }

  return { status, confidence, relevant, comparison };

}



export function matchNcsReferences(

  input: NcsOpportunityInput,

  records: NcsReferenceRecord[],

  referenceUrl: string,

  queryScoped: boolean,

  checkedAt: string,

  queries = generateNcsSearchQueries(input),

): NcsReferenceResult {

  if (!isApprovedNcsUrl(referenceUrl)) return unavailable(input, "NCS reference URL did not pass the official-host check.", queries, checkedAt);

  const scored = records.map((record) => ({ record, ...scoreReference(input, record, checkedAt) }));

  const relevant = scored.filter((candidate) => candidate.relevant).sort((a, b) => b.confidence - a.confidence);

  if (!relevant.length && !queryScoped) {

    return unavailable(input, "The public NCS listing did not expose query-scoped results, so absence cannot be established.", queries, checkedAt);

  }

  if (!relevant.length) {

    return {

      source: "NCS",

      status: "NOT_FOUND",

      governmentJobClaim: true,

      organization: text(input.organization) || null,

      jobTitle: text(input.jobTitle) || null,

      notificationNumber: text(input.notificationNumber) || text(input.advertisementNumber) || null,

      matchedFields: [],

      mismatchedFields: [],

      unavailableFields: [...UNAVAILABLE_FIELDS],

      ncsReferenceUrl: referenceUrl,

      officialSourceUrl: null,

      evidence: [],

      confidence: 0,

      checkedAt,

      reason: "No matching opportunity was present in the query-scoped official NCS results. This does not establish fraud.",

      searchQueries: queries,

    };

  }

  const best = relevant[0];

  return {

    source: "NCS",

    status: best.status,

    governmentJobClaim: true,

    organization: best.record.organization || null,

    jobTitle: best.record.jobTitle || null,

    notificationNumber: best.record.notificationNumber || best.record.advertisementNumber || null,

    matchedFields: best.comparison.matched,

    mismatchedFields: best.comparison.mismatched,

    unavailableFields: best.comparison.unavailable,

    ncsReferenceUrl: best.record.ncsReferenceUrl,

    officialSourceUrl: best.record.applicationUrl || null,

    evidence: best.comparison.evidence,

    confidence: best.confidence,

    checkedAt,

    searchQueries: queries,

  };

}



function unavailable(input: NcsOpportunityInput, reason: string, queries: string[], checkedAt = new Date().toISOString()): NcsReferenceResult {

  return {

    source: "NCS",

    status: "UNAVAILABLE",

    governmentJobClaim: input.governmentJobClaim,

    organization: text(input.organization) || null,

    jobTitle: text(input.jobTitle) || null,

    notificationNumber: text(input.notificationNumber) || text(input.advertisementNumber) || null,

    matchedFields: [],

    mismatchedFields: [],

    unavailableFields: [...UNAVAILABLE_FIELDS],

    ncsReferenceUrl: null,

    officialSourceUrl: null,

    evidence: [],

    confidence: 0,

    checkedAt,

    reason,

    searchQueries: queries,

  };

}



function notApplicable(input: NcsOpportunityInput): NcsReferenceResult {

  return { ...unavailable(input, "NCS checking is not applicable to this submission.", [], ""), status: "NOT_APPLICABLE", governmentJobClaim: false, checkedAt: null, reason: undefined };

}



function cacheKeyFor(input: NcsOpportunityInput): string {

  const keyData = [

    normalizeGovernmentOrganization(text(input.organization)),

    normalizeRecruitmentTitle(text(input.jobTitle)),

    normalizeRecruitmentIdentifier(text(input.notificationNumber)),

    normalizeRecruitmentIdentifier(text(input.advertisementNumber)),

    normalizeRecruitmentIdentifier(text(input.jobId)),

    text(input.recruitmentYear),

  ].join("|");

  return createHash("sha256").update(keyData).digest("hex");

}



async function loadCachedResult(cacheKey: string, now: number): Promise<NcsReferenceResult | null> {

  const memory = memoryCache.get(cacheKey);

  if (memory && memory.expiresAt > now) return memory.result;

  memoryCache.delete(cacheKey);

  try {

    const [{ default: connectDB }, { default: GovernmentReferenceCache }] = await Promise.all([

      import("./mongodb.ts"),

      import("../models/GovernmentReferenceCache.ts"),

    ]);

    if (!await connectDB()) return null;

    const cached = await GovernmentReferenceCache.findOne({ cacheKey, expiresAt: { $gt: new Date(now) } }).lean();

    if (!cached?.result || typeof cached.result !== "object") return null;

    const result = cached.result as NcsReferenceResult;

    const expiresAt = new Date(cached.expiresAt).getTime();

    memoryCache.set(cacheKey, { result, expiresAt });

    return result;

  } catch (error) {

    console.warn("[NCS] Reference cache read unavailable:", error instanceof Error ? error.message : "Unknown error");

    return null;

  }

}



async function storeCachedResult(cacheKey: string, result: NcsReferenceResult, now: number): Promise<void> {

  if (!result.ncsReferenceUrl || !["EXACT_MATCH", "STRONG_MATCH", "PARTIAL_MATCH", "NO_MATCH", "NOT_FOUND"].includes(result.status)) return;

  const ttl = result.status === "NOT_FOUND" ? NEGATIVE_CACHE_TTL_MS : POSITIVE_CACHE_TTL_MS;

  const expiresAt = new Date(now + ttl);

  memoryCache.set(cacheKey, { result, expiresAt: expiresAt.getTime() });

  try {

    const [{ default: connectDB }, { default: GovernmentReferenceCache }] = await Promise.all([

      import("./mongodb.ts"),

      import("../models/GovernmentReferenceCache.ts"),

    ]);

    if (!await connectDB()) return;

    await GovernmentReferenceCache.findOneAndUpdate(

      { cacheKey },

      { $set: { source: "NCS", sourceUrl: result.ncsReferenceUrl, result, retrievedAt: new Date(now), expiresAt } },

      { upsert: true, new: true, setDefaultsOnInsert: true },

    );

  } catch (error) {

    console.warn("[NCS] Reference cache write unavailable:", error instanceof Error ? error.message : "Unknown error");

  }

}



async function throttle(now: () => number, interval: number): Promise<void> {

  const delay = Math.max(0, lastRequestAt + interval - now());

  if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));

  lastRequestAt = now();

}



async function readBounded(response: Response): Promise<string> {

  const declaredLength = Number(response.headers.get("content-length") || 0);

  if (declaredLength > MAX_RESPONSE_BYTES) throw new Error("NCS response exceeded the allowed size.");

  if (!response.body) return "";

  const reader = response.body.getReader();

  const chunks: Uint8Array[] = [];

  let length = 0;

  while (true) {

    const { done, value } = await reader.read();

    if (done) break;

    length += value.byteLength;

    if (length > MAX_RESPONSE_BYTES) {

      await reader.cancel();

      throw new Error("NCS response exceeded the allowed size.");

    }

    chunks.push(value);

  }

  const combined = new Uint8Array(length);

  let offset = 0;

  for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.byteLength; }

  return new TextDecoder().decode(combined);

}



function robotsAllows(body: string, path: string): boolean | null {

  if (/^\s*(?:<!doctype\s+html|<html)/i.test(body)) return null;

  const lines = body.split(/\r?\n/).map((line) => line.split("#")[0].trim()).filter(Boolean);

  let currentGroup = false;

  let bestRule: { length: number; allow: boolean } | null = null;

  for (const line of lines) {

    const separator = line.indexOf(":");

    if (separator < 0) continue;

    const directive = line.slice(0, separator).trim().toLowerCase();

    const value = line.slice(separator + 1).trim();

    if (directive === "user-agent") {

      currentGroup = value === "*" || /careerguardian/i.test(value);

      continue;

    }

    if (!currentGroup || !["allow", "disallow"].includes(directive) || !value) continue;

    if (path.startsWith(value) && (!bestRule || value.length > bestRule.length || value.length === bestRule.length && directive === "allow")) {

      bestRule = { length: value.length, allow: directive === "allow" };

    }

  }

  return bestRule ? bestRule.allow : true;

}



async function fetchOfficialPage(url: URL, fetcher: typeof fetch, now: () => number, interval: number): Promise<{ response: Response; body: string; url: URL }> {

  let currentUrl = url;

  const visited = new Set<string>();

  for (let redirectCount = 0; redirectCount <= 3; redirectCount += 1) {

    if (!isApprovedNcsUrl(currentUrl.toString()) || visited.has(currentUrl.toString())) throw new Error("NCS redirect failed the official HTTPS host allowlist.");

    visited.add(currentUrl.toString());

    await throttle(now, interval);

    const response = await fetcher(currentUrl, {

      method: "GET",

      redirect: "manual",

      signal: AbortSignal.timeout(Math.min(10_000, Math.max(1_000, Number(process.env.NCS_TIMEOUT_MS) || 8_000))),

      headers: { Accept: "text/html, application/ld+json;q=0.9, text/plain;q=0.8", "User-Agent": "CareerGuardianAI/1.0 Government Reference Check" },

    });

    console.info("[NCS] source response", JSON.stringify({ hostname: currentUrl.hostname, path: currentUrl.pathname, status: response.status, contentType: response.headers.get("content-type") || "unknown" }));

    if (response.status >= 300 && response.status < 400) {

      if (redirectCount === 3) throw new Error("NCS redirect limit was reached.");

      const location = response.headers.get("location");

      if (!location) throw new Error("NCS redirect did not include a location.");

      const nextUrl = new URL(location, currentUrl);

      if (!isApprovedNcsUrl(nextUrl.toString())) throw new Error("NCS redirect points outside the official NCS HTTPS hosts.");

      currentUrl = nextUrl;

      continue;

    }

    const body = await readBounded(response);

    return { response, body, url: currentUrl };

  }

  throw new Error("NCS redirect limit was reached.");

}



async function runVerification(input: NcsOpportunityInput, options: VerifyOptions, cacheKey: string, queries: string[]): Promise<NcsReferenceResult> {

  const now = options.now || Date.now;

  const checkedAt = new Date(now()).toISOString();

  if (process.env.NCS_ENABLED === "false") return unavailable(input, "NCS reference checking is disabled by configuration.", queries, checkedAt);

  const baseUrl = getApprovedNcsBase();

  if (!baseUrl) return unavailable(input, "NCS_BASE_URL must use the official NCS HTTPS host.", queries, checkedAt);



  const fetcher = options.fetcher || fetch;

  const interval = options.minRequestIntervalMs ?? MIN_REQUEST_INTERVAL_MS;

  const robotsUrl = new URL("/robots.txt", baseUrl);

  try {

    console.info("[NCS] verification started");

    const robots = await fetchOfficialPage(robotsUrl, fetcher, now, interval);

    if (!robots.response.ok) return unavailable(input, `The official NCS robots policy could not be checked (HTTP ${robots.response.status}).`, queries, checkedAt);

    const allowed = robotsAllows(robots.body, NCS_LISTING_PATH);

    if (allowed === null) return unavailable(input, "The official NCS robots endpoint returned an HTML application shell, not a readable robots policy.", queries, checkedAt);

    if (!allowed) return unavailable(input, "The official NCS robots policy disallows automated access to its job-listing page.", queries, checkedAt);



   if (!parsed.machineReadable) {
    return unavailable(
        input,
        "NCS returned a public application shell without machine-readable vacancy records.",
        queries,
        checkedAt
    );
}

    console.info("[NCS] search strategy", JSON.stringify({ queryCount: queries.length, identifiersPresent: Boolean(input.notificationNumber || input.advertisementNumber || input.jobId) }));

    const listing = await fetchOfficialPage(listingUrl, fetcher, now, interval);

    if (listing.response.status === 401 || listing.response.status === 403 || listing.response.status === 429) {

      return unavailable(input, `The official NCS public listing is not accessible to this automated request (HTTP ${listing.response.status}).`, queries, checkedAt);

    }

    if (!listing.response.ok) return unavailable(input, `The official NCS listing returned HTTP ${listing.response.status}.`, queries, checkedAt);

    const contentType = listing.response.headers.get("content-type") || "";

    if (!/text\/html|application\/ld\\+json/i.test(contentType)) return unavailable(input, "The official NCS listing response is not in a supported machine-readable format.", queries, checkedAt);

    const parsed = parseOfficialNcsPage(listing.body, listing.url.toString());

    if (parsed.records.length) console.info("[NCS] reference retrieved", JSON.stringify({ recordCount: parsed.records.length, source: "NCS" }));

    console.info("[NCS] normalization", JSON.stringify({ machineReadable: parsed.machineReadable, recordCount: parsed.records.length }));

    if (!parsed.machineReadable) return unavailable(input, "NCS returned a public application shell without machine-readable vacancy records.", queries, checkedAt);



    const result = matchNcsReferences(input, parsed.records, listing.url.toString(), parsed.queryScoped, checkedAt, queries);

    console.info("[NCS] match result", JSON.stringify({ status: result.status, matchedFields: result.matchedFields.length, mismatchedFields: result.mismatchedFields.length }));

    if (options.useCache !== false) await storeCachedResult(cacheKey, result, now());

    return result;

  } catch (error) {

    const reason = error instanceof Error && error.name === "TimeoutError"

      ? "The official NCS reference check timed out."

      : error instanceof Error && error.message.includes("response exceeded")

        ? "The official NCS response exceeded the safe size limit."

        : error instanceof Error && /redirect/i.test(error.message)

          ? "The official NCS page redirected outside the allowed safe redirect policy."

        : "The official NCS reference could not be retrieved or parsed.";

    console.info("[NCS] verification unavailable", reason);

    return unavailable(input, reason, queries, checkedAt);

  }

}



export async function verifyNcsReference(input: NcsOpportunityInput, options: VerifyOptions = {}): Promise<NcsReferenceResult> {

  const queries = generateNcsSearchQueries(input);

  if (!input.governmentJobClaim) return notApplicable(input);

  if (process.env.NCS_ENABLED === "false") return unavailable(input, "NCS reference checking is disabled by configuration.", queries);

  if (!queries.length) return unavailable(input, "There is not enough submitted information to form NCS reference queries.", queries);

  const cacheKey = cacheKeyFor(input);

  const now = (options.now || Date.now)();

  if (options.useCache !== false) {

    const cached = await loadCachedResult(cacheKey, now);

    if (cached) {

      console.info("[NCS] cached result", JSON.stringify({ status: cached.status }));

      return cached;

    }

  }

  const active = inFlight.get(cacheKey);

  if (active) return active;

  const task = runVerification(input, options, cacheKey, queries);

  inFlight.set(cacheKey, task);

  try {

    const result = await task;

    if (options.useCache !== false && result.status === "UNAVAILABLE") memoryCache.set(cacheKey, { result, expiresAt: (options.now || Date.now)() + UNAVAILABLE_COOLDOWN_MS });

    console.info("[NCS] verification completed", JSON.stringify({ status: result.status, confidence: result.confidence }));

    return result;

  }

  finally { inFlight.delete(cacheKey); }

}