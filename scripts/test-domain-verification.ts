import { compareDomains } from "@/lib/linkSentinel";

function run(label: string, submitted: string, claimed: string) {
  const result = compareDomains(submitted, claimed);
  console.log(`\n=== ${label} ===`);
  console.log("Submitted URL:", submitted);
  console.log("Parsed hostname:", result.hostname);
  console.log("Claimed:", claimed);
  console.log("Domain Status:", result.domainStatus);
  console.log("Match:", result.domainMatch);
  console.log("Lookalike:", result.isLookalike);
  console.log("Typosquatting:", result.isTyposquatting);
  console.log("Similarity:", result.similarityScore);
  console.log("Difference types:", result.differenceType);
  console.log("Official:", result.matchedOfficialDomain);
  console.log("Differences:", JSON.stringify(result.differences, null, 2));
  console.log("Explanation:", result.explanation.join(" | "));
}

run("TEST 1 - Exact match", "https://ssc.gov.in", "Staff Selection Commission");
run("TEST 2 - Hyphen manipulation", "https://ssc-gov.in", "Staff Selection Commission");
run("TEST 3 - o->0 substitution", "https://amaz0n.jobs", "Amazon");
run("TEST 4 - inf0sys", "https://inf0sys.com", "Infosys");
run("TEST 5 - Subdomain (unknown org)", "https://careers.company.com", "company");
run("TEST 6 - Unknown org", "https://unknown-company-example.com", "Unknown");
run("TEST 8 - Case variation", "https://SSC.GOV.IN", "Staff Selection Commission");
run("TEST 9 - amazonn.jobs (extra char)", "https://amazonn.jobs", "Amazon");
run("TEST 10 - amzon.jobs (missing char)", "https://amzon.jobs", "Amazon");
run("TEST 11 - amzaon.jobs (transposition)", "https://amzaon.jobs", "Amazon");
run("TEST 12 - ssc.com (wrong TLD)", "https://ssc.com", "Staff Selection Commission");
run("TEST 13 - ssc-recruitment.com (misleading keyword)", "https://ssc-recruitment.com", "Staff Selection Commission");
run("TEST 14 - railway-gov.in", "https://railway-gov.in", "Indian Railways");