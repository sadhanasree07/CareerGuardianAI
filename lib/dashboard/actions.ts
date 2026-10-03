import { dashboardData } from "./dashboardStore";

export function addInvestigation(data: any) {
  dashboardData.investigations.unshift({
    company: data.company,
    trustScore: data.verification.trustScore,
    verdict: data.verification.verdict,
    date: new Date().toLocaleString(),
  });
}

export function getInvestigations() {
  return dashboardData.investigations;
}