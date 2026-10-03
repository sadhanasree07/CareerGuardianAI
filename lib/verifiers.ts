export function verifyGovernmentWebsite(url: string) {
  if (!url) {
    return {
      passed: false,
      score: 0,
      message: "Website not found",
    };
  }

  const website = url.toLowerCase();

  const official =
    website.includes(".gov.in") ||
    website.includes(".nic.in") ||
    website.includes(".gov");

  return {
    passed: official,
    score: official ? 15 : 0,
    message: official
      ? "Official Government Website"
      : "Unofficial Website",
  };
}

export function verifyRecruiterEmail(email: string) {
  if (!email) {
    return {
      passed: false,
      score: 0,
      message: "Email not found",
    };
  }

  const official =
    email.endsWith(".gov.in") ||
    email.endsWith(".nic.in");

  return {
    passed: official,
    score: official ? 15 : 0,
    message: official
      ? "Official Government Email"
      : "Suspicious Email",
  };
}

export function verifyPhone(phone: string) {
  if (!phone) {
    return {
      passed: false,
      score: 0,
      message: "Phone missing",
    };
  }

  const clean = phone.replace(/\D/g, "");

  const valid = /^[6-9]\d{9}$/.test(clean);

  return {
    passed: valid,
    score: valid ? 10 : 0,
    message: valid
      ? "Valid Indian Number"
      : "Invalid Phone",
  };
}

export function verifySalary(salary: string) {
  if (!salary) {
    return {
      passed: false,
      score: 0,
      message: "Salary missing",
    };
  }

  const value = Number(
    salary.replace(/[^\d]/g, "")
  );

  const realistic = value < 300000;

  return {
    passed: realistic,
    score: realistic ? 10 : 0,
    message: realistic
      ? "Salary looks realistic"
      : "Salary unusually high",
  };
}

export function detectScamKeywords(text: string) {
  const keywords = [
    "pay fee",
    "registration fee",
    "urgent",
    "whatsapp only",
    "limited seats",
    "guaranteed job",
    "100% job",
    "instant joining",
    "without exam",
    "processing fee",
  ];

  const found = keywords.filter((k) =>
    text.toLowerCase().includes(k)
  );

  return {
    passed: found.length === 0,
    score: found.length === 0 ? 15 : 0,
    message:
      found.length === 0
        ? "No Scam Keywords"
        : found.join(", "),
  };
}