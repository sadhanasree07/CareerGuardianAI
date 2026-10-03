import { createHash, randomUUID } from "crypto";
import connectDB from "@/lib/mongodb";
import ThreatCluster from "@/models/ThreatCluster";
import { getThreatNetStatus, type ThreatNetStatus } from "@/lib/threatnet/status";

const MAX_TEXT_LENGTH = 30000;
const DEDUPE_WINDOW_MS = 60 * 60 * 1000;
const REPORT_RETENTION_MS = 90 * 86400000;

function config(name: string, fallback: number, min: number, max: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? Math.max(min, Math.min(max, Math.floor(value))) : fallback;
}

export const threatNetConfig = {
  enabled: process.env.THREATNET_ENABLED !== "false",
  similarityThreshold: config("THREATNET_SIMILARITY_THRESHOLD", 85, 50, 100),
  risingReportThreshold: config("THREATNET_RISING_REPORT_THRESHOLD", 3, 2, 1000),
  highActivityThreshold: config("THREATNET_HIGH_ACTIVITY_THRESHOLD", 10, 3, 10000),
};

export function normalizeRecruitmentText(input: string) {
  return input.normalize("NFKC").toLowerCase()
    .replace(/\b(?:https?:\/\/)?(?:www\.)?([^\s/?#]+)(?:\/[^\s]*)?/gi, (_match, host: string) => ` url ${host.toLowerCase()} `)
    .replace(/([\w.+-]+)\s*\[at\]\s*([\w.-]+)\s*\[dot\]\s*(\w+)/gi, "$1@$2.$3")
    .replace(/\b(?:\+?91[\s.-]?)?(\d{5})[\s.-]?(\d{5})\b/g, " phone $1$2 ")
    .replace(/\b(\d{1,2})[/-](\d{1,2})[/-](20\d{2})\b/g, (_m, d: string, mo: string, y: string) => ` date ${y}-${mo.padStart(2,"0")}-${d.padStart(2,"0")} `)
    .replace(/\b(?:rs\.?|inr)\s*/g, " rs ")
    .replace(/₹\s*/g, " rs ")
    .replace(/\b(\w)\1{2,}\b/gi, "$1$1")
    .replace(/[“”‘’]/g, "'")
    .replace(/[^\p{L}\p{N}@._%+-]+/gu, " ")
    .replace(/\s+/g, " ").trim();
}

function shingles(text: string): string[] {
  const tokens = text.split(" ").filter(Boolean);
  if (tokens.length < 4) return tokens;
  const result = new Set<string>();
  for (let i = 0; i <= tokens.length - 3; i++) result.add(tokens.slice(i, i + 3).join(" "));
  return [...result];
}

function similarity(a: string[], b: string[]) {
  if (!a.length || !b.length) return 0;
  const left = new Set(a), right = new Set(b);
  let intersection = 0;
  for (const item of left) if (right.has(item)) intersection++;
  return Math.round(100 * intersection / (left.size + right.size - intersection));
}

const bounded = (values: string[]) => [...new Set(values.filter(Boolean))].slice(0, 30);
const extract = (text: string, regex: RegExp) => bounded([...text.matchAll(regex)].map((m) => m[0]));

export type ThreatIntelligence = {
  matched: boolean; clusterId: string | null; similarityScore: number; reportCount: number;
  reportsLast24Hours: number; reportsLast72Hours: number; firstSeenAt: string | null;
  lastSeenAt: string | null; threatLevel: "NO_MATCH" | "LOCALIZED" | "RISING_TREND" | "HIGH_ACTIVITY";
  evidence: string[]; status: ThreatNetStatus; reason?: string;
};

export async function analyzeThreatNet(input: { text: string; company?: string; jobRole?: string; website?: string; phone?: string; notificationNumber?: string }) : Promise<ThreatIntelligence | null> {
  if (!threatNetConfig.enabled) return null;
  const original = [input.text, input.company, input.jobRole, input.website, input.phone, input.notificationNumber]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join("\n").slice(0, MAX_TEXT_LENGTH);
  const normalizedText = normalizeRecruitmentText(original);
  if (normalizedText.length < 30) return emptyResult(getThreatNetStatus({ enabled: true, sufficientEvidence: false, serviceAvailable: true, matchedExistingCluster: false }), "Insufficient recruitment text or comparable identifiers for threat matching.");
  const contentHash = createHash("sha256").update(normalizedText).digest("hex");
  const signature = shingles(normalizedText);
  const db = await connectDB();
  if (!db) return emptyResult(getThreatNetStatus({ enabled: true, sufficientEvidence: true, serviceAvailable: false, matchedExistingCluster: false }), "ThreatNet database is unavailable.");
  const now = new Date();
  const recentClusters = await ThreatCluster.find({ lastSeenAt: { $gte: new Date(now.getTime() - REPORT_RETENTION_MS) } })
    .select("clusterId contentHash normalizedText similaritySignature reportCount reportTimes firstSeenAt lastSeenAt lastSubmissionAt sampleOrganizations sampleRoles domains phoneNumbers upiIds notificationNumbers locations")
    .limit(500).lean();
  const exact = recentClusters.find((cluster: any) => cluster.contentHash === contentHash);
  let matched: any = exact;
  let score = exact ? 100 : 0;
  if (!matched) {
    for (const cluster of recentClusters as any[]) {
      const candidateScore = similarity(signature, cluster.similaritySignature || shingles(cluster.normalizedText || ""));
      if (candidateScore > score) { score = candidateScore; matched = cluster; }
    }
    if (score < threatNetConfig.similarityThreshold) matched = null;
  }
  const matchedExistingCluster = Boolean(matched);

  const domains = bounded([...extract(original, /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+/gi), ...host(input.website || "")]);
  const phones = bounded(extract(original, /(?:\+?\d[\d ().-]{7,}\d)/g).map((v) => v.replace(/\D/g, "")).filter((v) => v.length >= 10).map((v) => v.slice(-10)));
  const upiIds = bounded(extract(original, /\b[a-z0-9._-]{2,}@[a-z][a-z0-9.-]{1,}\b/gi));
  const update = {
    $set: { lastSeenAt: now },
    $setOnInsert: { clusterId: randomUUID(), contentHash, normalizedText, similaritySignature: signature, firstSeenAt: now, status: "ACTIVE" },
  } as any;
  let cluster: any;
  if (matched) {
    cluster = await ThreatCluster.findOneAndUpdate({ clusterId: matched.clusterId }, update, { new: true });
    if (cluster && (!cluster.lastSubmissionAt || now.getTime() - new Date(cluster.lastSubmissionAt).getTime() > DEDUPE_WINDOW_MS)) {
      cluster.reportCount += 1;
      cluster.reportTimes = [...(cluster.reportTimes || []).filter((date: Date) => new Date(date).getTime() >= now.getTime() - REPORT_RETENTION_MS), now];
      cluster.lastSubmissionAt = now;
      cluster.reportCount = cluster.reportTimes.length;
      cluster.sampleOrganizations = bounded([...(cluster.sampleOrganizations || []), input.company || ""]);
      cluster.sampleRoles = bounded([...(cluster.sampleRoles || []), input.jobRole || ""]);
      cluster.domains = bounded([...(cluster.domains || []), ...domains]);
      cluster.phoneNumbers = bounded([...(cluster.phoneNumbers || []), ...phones]);
      cluster.upiIds = bounded([...(cluster.upiIds || []), ...upiIds]);
      cluster.notificationNumbers = bounded([...(cluster.notificationNumbers || []), input.notificationNumber || ""]);
      await cluster.save();
    }
  } else {
    cluster = await ThreatCluster.create({ ...update.$setOnInsert, ...update.$set, reportCount: 1, reportTimes: [now], lastSubmissionAt: now,
      sampleOrganizations: bounded([input.company || ""]), sampleRoles: bounded([input.jobRole || ""]), domains, phoneNumbers: phones,
      upiIds, notificationNumbers: bounded([input.notificationNumber || ""]) });
  }
  if (!cluster) return emptyResult(getThreatNetStatus({ enabled: true, sufficientEvidence: true, serviceAvailable: false, matchedExistingCluster: false }), "Threat cluster could not be read or written.");
  const times = (cluster.reportTimes || []).map((date: Date) => new Date(date).getTime());
  const reportsLast24Hours = times.filter((time: number) => time >= now.getTime() - 86400000).length;
  const reportsLast72Hours = times.filter((time: number) => time >= now.getTime() - 72 * 3600000).length;
  const threatLevel = !matchedExistingCluster ? "NO_MATCH" : reportsLast24Hours >= threatNetConfig.highActivityThreshold ? "HIGH_ACTIVITY"
    : cluster.reportCount >= threatNetConfig.risingReportThreshold ? "RISING_TREND" : "LOCALIZED";
  const evidence = matchedExistingCluster ? [exact ? "Exact recruitment content matched an existing threat cluster." : "Recruitment content matched an existing threat cluster by fuzzy similarity."] : [];
  if (matchedExistingCluster && reportsLast24Hours >= threatNetConfig.risingReportThreshold) evidence.push("Multiple submissions detected within 24 hours");
  console.info(`[ThreatNet] ${matchedExistingCluster ? exact ? "Exact" : "Fuzzy" : "No existing match"}; score ${score}; report count ${matchedExistingCluster ? cluster.reportCount : 0}; level ${threatLevel}`);
  return {
    matched: matchedExistingCluster,
    clusterId: matchedExistingCluster ? cluster.clusterId : null,
    similarityScore: score,
    reportCount: matchedExistingCluster ? cluster.reportCount : 0,
    reportsLast24Hours: matchedExistingCluster ? reportsLast24Hours : 0,
    reportsLast72Hours: matchedExistingCluster ? reportsLast72Hours : 0,
    firstSeenAt: matchedExistingCluster ? new Date(cluster.firstSeenAt).toISOString() : null,
    lastSeenAt: matchedExistingCluster ? new Date(cluster.lastSeenAt).toISOString() : null,
    threatLevel,
    evidence,
    status: getThreatNetStatus({ enabled: true, sufficientEvidence: true, serviceAvailable: true, matchedExistingCluster }),
  };
}

function host(value: string) { try { return new URL(/^https?:/i.test(value) ? value : `https://${value}`).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; } }
export function emptyThreatIntelligence(status: ThreatNetStatus, reason?: string): ThreatIntelligence {
  return { matched: false, clusterId: null, similarityScore: 0, reportCount: 0, reportsLast24Hours: 0, reportsLast72Hours: 0, firstSeenAt: null, lastSeenAt: null, threatLevel: status === "MATCH_FOUND" ? "LOCALIZED" : "NO_MATCH", evidence: [], status, ...(reason ? { reason } : {}) };
}

function emptyResult(status: ThreatNetStatus, reason?: string): ThreatIntelligence { return emptyThreatIntelligence(status, reason); }
