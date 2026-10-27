import { SectionHeading } from "@/components/ui/primitives";
import type { Dictionary } from "@/lib/i18n";

/* Do negócio ao código: a trilha do refinamento funcional em 4 passos —
   o "como eu trabalho" em destaque, antes da lista de ferramentas. */
export function Refinement({ d }: { d: Dictionary }) {
  return (
    <section id="refinamento" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading title={d.refinement.title} subtitle={d.refinement.subtitle} />
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {d.refinement.steps.map((step, index) => (
          <li
            key={step.title}
            data-reveal
            style={{ "--reveal-delay": `${index * 90}ms` } as React.CSSProperties}
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5"
          >
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/40 bg-accent-soft text-sm font-bold text-accent"
            >
              {index + 1}
            </span>
            <h3 className="text-base font-semibold">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{step.text}</p>
          </li>
        ))}
      </ol>
      <p data-reveal className="mt-6 flex items-center gap-2 text-sm text-muted">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
        {d.refinement.note}
      </p>
    </section>
  );
}
