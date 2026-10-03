export interface TrustResult {
  layer: number;
  name: string;
  score: number;
  passed: boolean;
  message: string;
  state?: string;
}

export function runTrustEngine(data: any): TrustResult[] {
  // Use backend verification if available
  if (data?.verification?.layers) {
    return data.verification.layers.map((layer: any) => ({
      layer: layer.layer,
      name: layer.title,
      score: layer.score,
      passed: layer.passed,
      message: layer.message,
      state: layer.state,
    }));
  }

  // Fallback (before verification completes)
  return [
    {
      layer: 1,
      name: "OCR Extraction",
      score: 0,
      passed: false,
      message: "Waiting for analysis...",
    },
    {
      layer: 2,
      name: "Government Verification",
      score: 0,
      passed: false,
      message: "Waiting for analysis...",
    },
    {
      layer: 3,
      name: "Website Verification",
      score: 0,
      passed: false,
      message: "Waiting for analysis...",
    },
    {
      layer: 4,
      name: "Recruiter Email",
      score: 0,
      passed: false,
      message: "Waiting for analysis...",
    },
    {
      layer: 5,
      name: "Phone Verification",
      score: 0,
      passed: false,
      message: "Waiting for analysis...",
    },
    {
      layer: 6,
      name: "Salary Analysis",
      score: 0,
      passed: false,
      message: "Waiting for analysis...",
    },
    {
      layer: 7,
      name: "Scam Keyword Detection",
      score: 0,
      passed: false,
      message: "Waiting for analysis...",
    },
    {
      layer: 8,
      name: "HTTPS Security",
      score: 0,
      passed: false,
      message: "Waiting for analysis...",
    },
    {
      layer: 9,
      name: "Application Fee Check",
      score: 0,
      passed: false,
      message: "Waiting for analysis...",
    },
    {
      layer: 10,
      name: "Education Verification",
      score: 0,
      passed: false,
      message: "Waiting for analysis...",
    },
    {
      layer: 11,
      name: "Job Role Verification",
      score: 0,
      passed: false,
      message: "Waiting for analysis...",
    },
    {
      layer: 12,
      name: "AI Final Trust Score",
      score: 0,
      passed: false,
      message: "Waiting for analysis...",
    },
  ];
}

