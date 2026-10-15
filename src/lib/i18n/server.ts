import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale } from "./index";
import type { Locale } from "./index";
import { LOCALE_COOKIE } from "./index";

/** Helper server-side: locale do cookie (com fallback pt-BR). */
export async function getLocaleFromCookies(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export { getDictionary } from "./index";
export type { Locale } from "./index";
