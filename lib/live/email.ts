export interface EmailResult {
  passed: boolean;
  score: number;
  message: string;
}

const trustedPublicDomains = [
  ".gov.in",
  ".nic.in",
  ".gov",
  ".org",
  ".edu",
];

export function verifyEmail(
  email: string,
  website?: string
): EmailResult {
  if (!email || !email.trim()) {
    return {
      passed: false,
      score: 0,
      message: "Email missing",
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  // Basic email format validation
  const emailParts = cleanEmail.split("@");

  if (emailParts.length !== 2) {
    return {
      passed: false,
      score: 0,
      message: "Invalid email format",
    };
  }

  const emailDomain = emailParts[1];

  // Check government / education domains
  const trustedPublic = trustedPublicDomains.some(
    (domain) => emailDomain.endsWith(domain)
  );

  // Check whether email domain matches website domain
  let matchesWebsite = false;

  if (website) {
    let cleanWebsite = website
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];

    const cleanEmailDomain = emailDomain.replace(/^www\./, "");

    matchesWebsite =
      cleanEmailDomain === cleanWebsite ||
      cleanEmailDomain.endsWith(`.${cleanWebsite}`) ||
      cleanWebsite.endsWith(`.${cleanEmailDomain}`);
  }

  const official = trustedPublic || matchesWebsite;

  return {
    passed: official,
    score: official ? 10 : 0,
    message: matchesWebsite
      ? "Official Company Email"
      : trustedPublic
      ? "Official Institutional Email"
      : "Email Domain Does Not Match Company Website",
  };
}