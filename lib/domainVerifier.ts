export interface DomainResult {
  passed: boolean;
  score: number;
  message: string;
}

export async function verifyDomain(
  website: string
): Promise<DomainResult> {

  if (!website) {
    return {
      passed: false,
      score: 0,
      message: "Website missing",
    };
  }

  try {

    const url = website.startsWith("http")
      ? website
      : `https://${website}`;

    const response = await fetch(url, {
      method: "HEAD",
    });

    if (!response.ok) {
      return {
        passed: false,
        score: 0,
        message: "Website unreachable",
      };
    }

    const govt =
      url.includes(".gov.in") ||
      url.includes(".nic.in");

    return {
      passed: govt,
      score: govt ? 15 : 8,
      message: govt
        ? "Official Government Website"
        : "Website reachable",
    };

  } catch {

    return {
      passed: false,
      score: 0,
      message: "Website unavailable",
    };

  }
}