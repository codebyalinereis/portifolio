import type { Locale } from "./index";

/**
 * Conteúdo do banco bilíngue: campos `*En` nullable com fallback pt-BR.
 */
export function localized(pt: string | null | undefined, en: string | null | undefined, locale: Locale): string {
  if (locale === "en") return en?.trim() ? en : (pt ?? "");
  return pt ?? en ?? "";
}

/** Formata período "mar 2021 – nov 2022" conforme locale. */
export function formatPeriod(
  start: Date,
  end: Date | null,
  current: boolean,
  locale: Locale,
  presentLabel: string
): string {
  const fmt = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "pt-BR", { month: "short", year: "numeric" });
  const from = fmt.format(start);
  const to = current ? presentLabel : end ? fmt.format(end) : "—";
  return `${from} — ${to}`;
}
