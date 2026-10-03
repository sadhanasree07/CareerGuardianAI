export interface NotificationVerificationResult {
  passed: boolean;
  score: number;
  message: string;
}

const officialDepartments = [
  "RRB",
  "UPSC",
  "SSC",
  "TNPSC",
  "DRDO",
  "ISRO",
  "BEL",
  "HAL",
  "NPCIL",
  "BARC",
  "IOCL",
  "ONGC",
  "LIC",
  "SBI",
  "IBPS",
  "RBI",
];

export async function verifyNotification(
  notificationNumber: string,
  company: string
): Promise<NotificationVerificationResult> {

  if (!notificationNumber) {
    return {
      passed: false,
      score: 0,
      message: "Notification Number Missing",
    };
  }

  const dept = officialDepartments.find((item) =>
    notificationNumber.toUpperCase().includes(item)
  );

  if (dept) {
    return {
      passed: true,
      score: 20,
      message: `${dept} recruitment pattern verified`,
    };
  }

  if (
    company &&
    officialDepartments.some((item) =>
      company.toUpperCase().includes(item)
    )
  ) {
    return {
      passed: true,
      score: 15,
      message: `${company} appears to be a recognised government organisation`,
    };
  }

  return {
    passed: false,
    score: 0,
    message: "Notification could not be verified",
  };
}