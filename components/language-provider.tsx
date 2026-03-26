"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { MessageKey } from "@/lib/i18n/messages";
import { messages } from "@/lib/i18n/messages";

export type Locale = "en" | "es";

const STORAGE_KEY = "planner-locale";
const LOCALE_COOKIE = "planner-locale";
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function writeLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};SameSite=Lax`;
}

function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === "en" || v === "es") return v;
  return null;
}

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

type TranslateFn = (
  key: MessageKey,
  vars?: Record<string, string | number>
) => string;

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function interpolate(
  template: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return template;
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{${k}}`, String(v));
  }
  return out;
}

export function LanguageProvider({
  children,
  initialLocale = null,
}: {
  children: React.ReactNode;
  /** Locale from `planner-locale` cookie (server + first client paint must match). */
  initialLocale?: Locale | null;
}) {
  const [locale, setLocaleState] = useState<Locale>(
    () => initialLocale ?? "en"
  );
  const [mounted, setMounted] = useState(false);

  /** Until effects run, keep translations aligned with SSR (cookie or English). */
  const effectiveLocale: Locale = mounted
    ? locale
    : (initialLocale ?? "en");

  useEffect(() => {
    const next = readStoredLocale() ?? detectLocale();
    setLocaleState(next);
    writeLocaleCookie(next);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale === "es" ? "es" : "en";
  }, [locale, mounted]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
    writeLocaleCookie(next);
  }, []);

  const t = useCallback<TranslateFn>(
    (key, vars) => {
      const table = messages[effectiveLocale];
      const raw = table[key] ?? messages.en[key] ?? key;
      return interpolate(raw, vars);
    },
    [effectiveLocale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
