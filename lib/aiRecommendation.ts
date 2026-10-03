export function generateRecommendation(_trustScore: number, data: any): string[] {
  const verification = data?.verification;
  const recommendations: string[] = [];
  if (verification?.recommendedAction) recommendations.push(verification.recommendedAction);
  if (verification?.verdict === "REVIEW") {
    recommendations.push("More verification is needed because the submitted evidence is incomplete.");
  }
  if (verification?.verdict === "HIGH RISK") {
    recommendations.push("Do not pay or share sensitive information while risk signals remain unresolved.");
  }
  for (const signal of verification?.positiveSignals || []) {
    if (recommendations.length >= 4) break;
    recommendations.push(signal);
  }
  for (const signal of verification?.negativeSignals || []) {
    if (recommendations.length >= 5) break;
    recommendations.push(signal);
  }
  return recommendations;
}
