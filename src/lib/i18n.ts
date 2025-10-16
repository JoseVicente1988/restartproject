import es from "@/locales/es.json";
import en from "@/locales/en.json";

export type Locale = "es" | "en";
export const messages: Record<Locale, Record<string, string>> = { es, en };

export function t(locale: Locale, key: string) {
  const dict = messages[locale] ?? messages.es;
  return dict[key] ?? key;
}
