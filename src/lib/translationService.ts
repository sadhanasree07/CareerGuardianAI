import { translations, type SupportedLanguage } from "@/src/lib/translations";

/**
 * Future-ready translation service for integration with Bhashini or another AI translation API.
 * Right now it safely falls back to the original text to avoid breaking the app.
 */
export function translateText(
  text: string,
  targetLanguage: SupportedLanguage | string = "en"
): string {
  if (!text) return text;

  if (!targetLanguage || targetLanguage === "en") {
    return text;
  }

  // Safe fallback while the backend/API layer is not connected yet.
  // When Bhashini is ready, replace this logic with a real API call.
  if (!(targetLanguage in translations)) {
    return text;
  }

  return text;
}
