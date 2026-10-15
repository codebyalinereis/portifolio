import { SectionHeading } from "@/components/ui/primitives";
import { Counter } from "@/components/effects/Counter";
import type { Dictionary } from "@/lib/i18n";

export function About({ d }: { d: Dictionary }) {
  return (
    <section id="sobre" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading title={d.about.title} />
      <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
        <div data-reveal className="space-y-4">
          {d.about.paragraphs.map((paragraph, index) => (
            <p key={index} className="leading-relaxed text-muted">
              {paragraph}
            </p>
          ))}
        </div>
        <div
          data-reveal
          style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
          className="rounded-lg border border-border bg-surface p-6"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{d.about.highlightTitle}</h3>
          <dl className="mt-4 space-y-4">
            {d.about.highlights.map((item) => (
              <div key={item.value}>
                <dt className="sr-only">{item.label}</dt>
                <dd className="text-3xl font-bold text-accent">
                  <Counter value={item.value} />
                </dd>
                <dd className="text-sm text-muted">{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
