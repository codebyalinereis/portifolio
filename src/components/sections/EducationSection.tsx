import { GraduationCap } from "lucide-react";
import type { Education } from "@prisma/client";
import { SectionHeading } from "@/components/ui/primitives";
import type { Dictionary, Locale } from "@/lib/i18n";
import { localized, formatPeriod } from "@/lib/i18n/localized";

export function EducationSection({
  d,
  locale,
  education,
}: {
  d: Dictionary;
  locale: Locale;
  education: Education[];
}) {
  return (
    <section id="formacao" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading title={d.education.title} subtitle={d.education.subtitle} />
      <div className="grid gap-10 lg:grid-cols-2">
        <ul data-reveal className="space-y-5">
          {education.map((item) => (
            <li key={item.id} className="flex gap-3">
              <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <h3 className="font-medium">{localized(item.title, item.titleEn, locale)}</h3>
                <p className="text-sm text-muted">{item.institution}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {formatPeriod(item.startDate, item.endDate, item.current, locale, d.experience.present)}
                  {item.current ? ` · ${d.education.inProgress}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div className="rounded-lg border border-border bg-surface p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{d.education.coursesTitle}</h3>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-muted marker:text-accent">
            {d.education.courses.map((course) => (
              <li key={course}>{course}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
