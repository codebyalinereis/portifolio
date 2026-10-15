import { ptBR } from "./dictionaries/pt-BR";
import { en } from "./dictionaries/en";
import type { Dictionary } from "./dictionaries/pt-BR";

export type { Dictionary };
export type Locale = "pt-BR" | "en";

export const LOCALES: Locale[] = ["pt-BR", "en"];
export const DEFAULT_LOCALE: Locale = "pt-BR";
export const LOCALE_COOKIE = "NEXT_LOCALE";

const dictionaries: Record<Locale, Dictionary> = { "pt-BR": ptBR, en };

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "pt-BR" || value === "en";
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? ptBR;
}
