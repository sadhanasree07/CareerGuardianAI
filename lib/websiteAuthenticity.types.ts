export type AuthenticityStatus =
  | "MATCH"
  | "PARTIAL_MATCH"
  | "MISMATCH"
  | "SUSPICIOUS"
  | "UNKNOWN"
  | "UNAVAILABLE"
  | "NOT_APPLICABLE";

export type WebsiteAuthenticityEvidence = {
  signal: string;
  observedValue: string | string[] | number | null;
  referenceValue: string | string[] | number | null;
  status: AuthenticityStatus;
  source: "SUBMITTED_WEBSITE" | "INDEPENDENT_SOURCE" | "SUBMITTED_URL_VS_VERIFIED_REFERENCE";
  timestamp: string;
  confidence: number;
};

export type WebsiteAuthenticityResult = {
  status: AuthenticityStatus;
  claimedOrganization: string | null;
  submittedUrl: string | null;
  finalUrl: string | null;
  redirectChain: string[];
  referenceUrl: string | null;
  referenceStatus: "VERIFIED" | "UNAVAILABLE" | "UNKNOWN";
  domain: {
    submittedDomain: string | null;
    rootDomain: string | null;
    referenceDomain: string | null;
    status: AuthenticityStatus;
    suspiciousPatterns: string[];
  };
  dns: {
    a: string[];
    aaaa: string[];
    cname: string[];
    ns: string[];
    mx: string[];
    txt: string[];
    caa: string[];
    reference: {
      a: string[];
      aaaa: string[];
      cname: string[];
      ns: string[];
      mx: string[];
      txt: string[];
      caa: string[];
    };
    dnssec: "UNAVAILABLE";
    status: "AVAILABLE" | "UNAVAILABLE";
  };
  ip: {
    submitted: string[];
    reference: string[];
    relationship: AuthenticityStatus | "DIFFERENT" | "CDN_SHARED_INFRASTRUCTURE";
  };
  asn: {
    submitted: string | null;
    reference: string | null;
    submittedOrganization: string | null;
    referenceOrganization: string | null;
    relationship: AuthenticityStatus | "CDN_SHARED_INFRASTRUCTURE";
  };
  hosting: {
    submittedProvider: string | null;
    referenceProvider: string | null;
    relationship: AuthenticityStatus | "CDN_SHARED_INFRASTRUCTURE";
  };
  nameservers: {
    submitted: string[];
    reference: string[];
    relationship: AuthenticityStatus;
  };
  tls: {
    issuer: string | null;
    subject: string | null;
    sanMatches: boolean | null;
    valid: boolean | null;
    validFrom: string | null;
    validTo: string | null;
    status: AuthenticityStatus;
  };
  registration: {
    registrar: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    expiresAt: string | null;
    domainAgeDays: number | null;
    status: "AVAILABLE" | "UNAVAILABLE";
  };
  ownership: {
    organizationMatch: AuthenticityStatus;
    contactDomainMatch: AuthenticityStatus;
    footerMatch: AuthenticityStatus;
    officialLinksMatch: AuthenticityStatus;
    contradictions: string[];
  };
  assets: {
    officialAssetOrigins: number;
    unrelatedAssetOrigins: number;
    suspiciousAssetOrigins: string[];
    status: AuthenticityStatus;
  };
  contentSimilarity: {
    similarityScore: number | null;
    interpretation: string;
  };
  infrastructureRelationship:
    | "STRONG_MATCH"
    | "PARTIAL_MATCH"
    | "CDN_SHARED_INFRASTRUCTURE"
    | "WEAK_RELATIONSHIP"
    | "MISMATCH"
    | "UNKNOWN";
  positiveSignals: string[];
  redFlags: string[];
  unavailableSignals: string[];
  evidence: WebsiteAuthenticityEvidence[];
  evidenceCoverage: { observed: number; total: number };
  confidence: number;
};
