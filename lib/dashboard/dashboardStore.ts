export interface Investigation {
  company: string;
  trustScore: number;
  verdict: string;
  date: string;
}

export const dashboardData = {
  investigations: [] as Investigation[],
};