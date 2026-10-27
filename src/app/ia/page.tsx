import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDictionary, isLocale, DEFAULT_LOCALE, LOCALE_COOKIE } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { SectionHeading } from "@/components/ui/primitives";
import { NeuralPlayground } from "@/components/ia/NeuralPlayground";

export const metadata: Metadata = {
  title: "IA na prática — rede neural ao vivo | Aline Reis",
  description:
    "Playground de rede neural treinando ao vivo no navegador (backpropagation escrita à mão), princípios de uso de IA em produção e o estudo de caso de classificação com NLP.",
};

export default async function AIPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const d = getDictionary(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading title={d.ai.title} subtitle={d.ai.subtitle} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {d.ai.principles.map((principle, index) => (
          <div
            key={principle}
            data-reveal
            style={{ "--reveal-delay": `${index * 80}ms` } as React.CSSProperties}
            className="flex items-start gap-2.5 rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-snug"
          >
            <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {principle}
          </div>
        ))}
      </div>

      <NeuralPlayground />

      <div data-reveal className="mt-10 rounded-xl border border-border bg-surface p-6">
        <h3 className="text-lg font-semibold">{d.ai.caseTitle}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{d.ai.caseText}</p>
        <Link
          href="/projects/motor-classificacao-nlp"
          className="mt-4 inline-flex items-center gap-1.5 font-medium text-accent transition-opacity hover:opacity-80"
        >
          {d.ai.caseLink}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
