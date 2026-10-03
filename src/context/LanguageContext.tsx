"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  translations,
  type SupportedLanguage,
  type TranslationKey,
} from "@/src/lib/translations";

const STORAGE_KEY = "careerGuardianLanguage";
const LEGACY_STORAGE_KEY = "guardian-language";

function isSupportedLanguage(value: string | null): value is SupportedLanguage {
  return !!value && value in translations;
}

type LanguageContextValue = {
  language: SupportedLanguage;
  setLanguage: (value: SupportedLanguage | string) => void;
  t: (key: TranslationKey, fallback?: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedLanguage = window.localStorage.getItem(STORAGE_KEY);

    if (isSupportedLanguage(savedLanguage)) {
      setLanguageState(savedLanguage);
      setReady(true);
      return;
    }

    const legacyLanguage = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (isSupportedLanguage(legacyLanguage)) {
      window.localStorage.setItem(STORAGE_KEY, legacyLanguage);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      setLanguageState(legacyLanguage);
      setReady(true);
      return;
    }

    let active = true;
    fetch("/api/profile", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        const preferredLanguage = result?.user?.preferredLanguage;
        if (active && isSupportedLanguage(preferredLanguage)) {
          setLanguageState(preferredLanguage);
          window.localStorage.setItem(STORAGE_KEY, preferredLanguage);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (value: SupportedLanguage | string) => {
    const normalized = isSupportedLanguage(value) ? value : "en";

    setLanguageState(normalized);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, normalized);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredLanguage: normalized }),
      }).catch(() => undefined);
    }
  };

  const t = (key: TranslationKey, fallback?: string) => {
    const currentTranslations: Partial<Record<TranslationKey, string>> = translations[language] ?? translations.en;
    const value = currentTranslations[key] ?? translations.en[key] ?? fallback ?? "";

    return value;
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language]
  );

  if (!ready) return null;

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside a LanguageProvider");
  }

  return context;
}
