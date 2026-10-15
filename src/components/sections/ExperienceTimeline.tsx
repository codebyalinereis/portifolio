import type { Experience } from "@prisma/client";
import { SectionHeading } from "@/components/ui/primitives";
import type { Dictionary, Locale } from "@/lib/i18n";
import { localized, formatPeriod } from "@/lib/i18n/localized";

export function ExperienceTimeline({
  d,
  locale,
  experiences,
}: {
  d: Dictionary;
  locale: Locale;
  experiences: Experience[];
}) {
  return (
    <section id="experiencia" className="border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading title={d.experience.title} subtitle={d.experience.subtitle} />
        <ol className="relative space-y-10 border-l border-border pl-6">
          {experiences.map((experience, index) => (
            <li
              key={experience.id}
              data-reveal
              style={{ "--reveal-delay": `${index * 100}ms` } as React.CSSProperties}
              className="relative"
            >
              <span
                aria-hidden="true"
                className={`absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full border-2 ${
                  experience.current ? "border-accent bg-accent" : "border-border bg-surface"
                }`}
              />
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {formatPeriod(experience.startDate, experience.endDate, experience.current, locale, d.experience.present)}
                {experience.current ? (
                  <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-accent normal-case">{d.experience.current}</span>
                ) : null}
              </p>
              <h3 className="mt-1 font-semibold">{localized(experience.role, experience.roleEn, locale)}</h3>
              <p className="text-sm text-muted">{experience.company}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {localized(experience.description, experience.descriptionEn, locale)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
