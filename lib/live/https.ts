export interface HTTPSResult {
  passed: boolean;
  score: number;
  message: string;
}

export function verifyHTTPS(
  website: string
): HTTPSResult {
  if (!website) {
    return {
      passed: false,
      score: 0,
      message: "No Website",
    };
  }

  const cleanWebsite = website
    .trim()
    .toLowerCase();

  // HTTPS explicitly present
  if (cleanWebsite.startsWith("https://")) {
    return {
      passed: true,
      score: 5,
      message: "HTTPS Enabled",
    };
  }

  // HTTP explicitly present
  if (cleanWebsite.startsWith("http://")) {
    return {
      passed: false,
      score: 0,
      message: "HTTPS Missing",
    };
  }

  // OCR often extracts only the domain
  // Example: www.tcs.com
  return {
    passed: true,
    score: 5,
    message: "Secure Website Format Detected",
  };
}