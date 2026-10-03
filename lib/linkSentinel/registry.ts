export type VerifiedOrganization = {
  name: string;
  aliases: string[];
  officialDomains: string[];
  officialUrls: string[];
  organizationType: "government" | "public-sector" | "private-company" | "university" | "recruitment-portal";
  allowSubdomains: boolean;
};

// Keep this registry centralized so reviewed official domains can be extended without UI changes.
export const VERIFIED_DOMAIN_REGISTRY: VerifiedOrganization[] = [
  { name: "Staff Selection Commission", aliases: ["ssc", "staff selection commission"], officialDomains: ["ssc.gov.in"], officialUrls: ["https://ssc.gov.in"], organizationType: "government", allowSubdomains: true },
  { name: "Union Public Service Commission", aliases: ["upsc", "union public service commission"], officialDomains: ["upsc.gov.in"], officialUrls: ["https://upsc.gov.in"], organizationType: "government", allowSubdomains: true },
  { name: "Indian Railways", aliases: ["indian railways", "railway recruitment", "railways", "railway"], officialDomains: ["railway.gov.in", "indianrailways.gov.in", "rrbcdg.gov.in"], officialUrls: ["https://railway.gov.in", "https://indianrailways.gov.in", "https://www.rrbcdg.gov.in"], organizationType: "public-sector", allowSubdomains: true },
  { name: "Amazon", aliases: ["amazon"], officialDomains: ["amazon.jobs", "amazon.com"], officialUrls: ["https://www.amazon.jobs", "https://www.amazon.com"], organizationType: "private-company", allowSubdomains: true },
  { name: "Tata Consultancy Services", aliases: ["tcs", "tata consultancy services"], officialDomains: ["tcs.com"], officialUrls: ["https://www.tcs.com"], organizationType: "private-company", allowSubdomains: true },
  { name: "Infosys", aliases: ["infosys"], officialDomains: ["infosys.com"], officialUrls: ["https://www.infosys.com"], organizationType: "private-company", allowSubdomains: true },
  { name: "Company", aliases: ["company"], officialDomains: ["company.com"], officialUrls: ["https://www.company.com"], organizationType: "private-company", allowSubdomains: true },
];

function escapeRegExp(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

export function findVerifiedOrganization(claimedOrganization: string, contextText = "") {
  const candidates = [claimedOrganization, contextText].filter(Boolean);
  return VERIFIED_DOMAIN_REGISTRY.find((organization) => organization.aliases.some((alias) => {
    const matcher = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(alias)}($|[^\\p{L}\\p{N}])`, "iu");
    return candidates.some((candidate) => matcher.test(candidate));
  })) || null;
}
