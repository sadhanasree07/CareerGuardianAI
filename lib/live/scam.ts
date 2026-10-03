export interface ScamResult {
  passed: boolean;
  score: number;
  message: string;
}

const keywords = [
  "registration fee",
  "processing fee",
  "pay immediately",
  "urgent joining",
  "100% job",
  "telegram",
  "whatsapp only",
  "guaranteed job",
  "limited vacancy",
  "without interview",
  "without exam",
];

const paymentRiskPatterns = [
  /(?:pay|payment|transfer|send)\s+(?:a\s+)?(?:registration|processing|application|interview|training|security|job confirmation)?\s*fee/i,
  /(?:registration|processing|application|interview|training|security)\s+fee\s+(?:of\s+)?(?:₹|rs\.?\s*)?\d/i,
  /pay\s+(?:₹|rs\.?\s*)?\d[\d,]*/i,
];

export function detectScam(
  text: string
): ScamResult {

  const content = text.toLowerCase();

  const found = keywords.filter(k =>
    content.includes(k)
  );
  const explicitNoFee = /(?:no|without|zero|free of)\s+(?:(?:any|a)\s+)?(?:application|registration|processing|interview|training|security deposit)?\s*fee|no payment required/i.test(content);
  const paymentRequests = explicitNoFee ? [] : paymentRiskPatterns.filter((pattern) => pattern.test(text)).map(() => "recruitment payment request");
  const allFindings = [...found, ...paymentRequests];

  return {
    passed: allFindings.length === 0,
    score: allFindings.length === 0 ? 15 : 0,
    message:
      allFindings.length === 0
        ? "No Scam Keywords"
        : [...new Set(allFindings)].join(", "),
  };
}
