export interface GovernmentResult {
  passed: boolean;
  score: number;
  message: string;
}

const governmentCompanies = [
  "RRB",
  "UPSC",
  "SSC",
  "TNPSC",
  "ISRO",
  "DRDO",
  "BEL",
  "BARC",
  "HAL",
  "ONGC",
  "IOCL",
  "LIC",
  "SBI",
];

export function verifyGovernment(
  company: string,
  notification: string
): GovernmentResult {

  const text =
    `${company} ${notification}`.toUpperCase();

  const matched =
    governmentCompanies.some(item =>
      text.includes(item)
    );

  return {
    passed: matched,
    score: matched ? 20 : 0,
    message: matched
      ? "Government Recruitment"
      : "Private Recruitment",
  };
}