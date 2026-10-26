import type { Technology } from "@prisma/client";
import { SectionHeading } from "@/components/ui/primitives";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import type { Dictionary } from "@/lib/i18n";

const CATEGORY_ORDER: Technology["category"][] = ["DATA", "BACKEND", "FRONTEND", "DEVOPS", "DOMAIN"];

function LevelDots({ level, label }: { level: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1" title={`${label}: ${level}/5`} aria-label={`${label}: ${level} de 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`h-1.5 w-4 rounded-full ${index < level ? "bg-accent" : "bg-border"}`}
        />
      ))}
    </span>
  );
}

export function SkillsGrid({ d, technologies }: { d: Dictionary; technologies: Technology[] }) {
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: technologies.filter((technology) => technology.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <section id="skills" className="border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading title={d.skills.title} subtitle={d.skills.subtitle} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {grouped.map((group, index) => (
            <div
              key={group.category}
              data-reveal
              style={{ "--reveal-delay": `${index * 80}ms` } as React.CSSProperties}
            >
              <SpotlightCard className="rounded-lg" tilt={false}>
                <div className="h-full rounded-lg border border-border bg-background p-5 transition-colors hover:border-accent/50">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
                    {d.skills.categories[group.category]}
                  </h3>
                  <ul className="space-y-2.5">
                    {group.items.map((technology) => (
                      <li key={technology.id} className="flex items-center justify-between gap-3 text-sm">
                        <span>{technology.name}</span>
                        <LevelDots level={technology.level} label={d.skills.levelLabel} />
                      </li>
                    ))}
                  </ul>
                </div>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
