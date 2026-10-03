export interface DomainResult {
  passed: boolean;
  score: number;
  status: string;
  ssl: boolean;
  government: boolean;
  message: string;
}

function isSafePassiveUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (!/^(https?):$/i.test(parsed.protocol)) return false;
    const host = parsed.hostname.toLowerCase();
    if (!host || host === "localhost" || host.endsWith(".localhost") || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1") return false;
    if (host === "169.254.169.254" || host === "metadata.google.internal") return false;
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/i.test(host)) return false;
    if (/^\[?::1\]?$|^::1$/i.test(host)) return false;
    if (/(?:^|\.)local(?:host)?$|\binternal\b|\bmetadata\b/i.test(host)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function verifyDomain(
  website: string
): Promise<DomainResult> {
  if (!website || !website.trim()) {
    return {
      passed: false,
      score: 0,
      status: "Missing",
      ssl: false,
      government: false,
      message: "Website not provided",
    };
  }

  try {
    let url = website.trim();
    url = url.replace(/\s/g, "");
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    if (!isSafePassiveUrl(url)) {
      return {
        passed: false,
        score: 0,
        status: "BLOCKED",
        ssl: false,
        government: false,
        message: "Unsafe URL blocked by passive verification safeguards.",
      };
    }

    const timeoutSignal = AbortSignal.timeout(8000);
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: timeoutSignal,
    });

    if (!response.ok) {
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: timeoutSignal,
      });
    }

    const finalUrl = response.url || url;
    const ssl = finalUrl.startsWith("https://");
    const govt =
      finalUrl.includes(".gov.in") ||
      finalUrl.includes(".nic.in") ||
      finalUrl.includes(".gov");

    if (!response.ok) {
      return {
        passed: false,
        score: 0,
        status: response.status.toString(),
        ssl,
        government: govt,
        message: "Website could not be verified",
      };
    }

    return {
      passed: true,
      score: govt ? 15 : 10,
      status: response.status.toString(),
      ssl,
      government: govt,
      message: govt
        ? "Official Government Website Verified"
        : "Official Website Reachable",
    };
  } catch (error) {
    return {
      passed: false,
      score: 0,
      status: "Offline",
      ssl: false,
      government: false,
      message: error instanceof Error && error.name === "TimeoutError" ? "Website check timed out" : "Website unreachable",
    };
  }
}
