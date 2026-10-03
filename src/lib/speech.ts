export function speakText(text: string, language: string = "en") {
  if (typeof window === "undefined") {
    return;
  }

  const SpeechCtor = window.SpeechSynthesisUtterance;

  if (!("speechSynthesis" in window) || typeof SpeechCtor === "undefined") {
    return;
  }

  const languageMap: Record<string, string> = {
    en: "en-IN",
    ta: "ta-IN",
    hi: "hi-IN",
    te: "te-IN",
    ml: "ml-IN",
    kn: "kn-IN",
  };

  const utterance = new SpeechCtor(text);
  utterance.lang = languageMap[language] ?? "en-IN";

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
