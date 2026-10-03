const JWT_SECRET =
  process.env.JWT_SECRET || "careerguardian_ai_super_secret_2026";

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export async function verifyMiddlewareToken(token: string) {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

    if (!encodedHeader || !encodedPayload || !encodedSignature) return false;

    const payload = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(encodedPayload))
    );
    if (typeof payload.exp !== "number" || payload.exp <= Date.now() / 1000) {
      return false;
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signature = decodeBase64Url(encodedSignature);

    return crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    );
  } catch {
    return false;
  }
}