"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { getDictionary, LOCALE_COOKIE } from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  d: Dictionary;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, d: getDictionary(locale), setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useI18n(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useI18n deve ser usado dentro de LocaleProvider");
  return ctx;
}
