import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getDictionary, isLocale, DEFAULT_LOCALE, LOCALE_COOKIE } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { SkillsGrid } from "@/components/sections/SkillsGrid";
import { ProjectsShowcase } from "@/components/sections/ProjectsShowcase";
import { ExperienceTimeline } from "@/components/sections/ExperienceTimeline";
import { EducationSection } from "@/components/sections/EducationSection";
import { ContactSection } from "@/components/sections/ContactForm";

export default async function HomePage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const d = getDictionary(locale);

  // Banco pode estar vazio/indisponível (ex.: antes do seed) — a home degrada com estados vazios.
  const [featuredProjects, technologies, experiences, education] = await Promise.all([
    prisma.project
      .findMany({
        where: { featured: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: 6,
        include: { technologies: { include: { technology: true } } },
      })
      .catch(() => []),
    prisma.technology.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }).catch(() => []),
    prisma.experience.findMany({ orderBy: [{ order: "asc" }, { startDate: "desc" }] }).catch(() => []),
    prisma.education.findMany({ orderBy: { startDate: "desc" } }).catch(() => []),
  ]);

  return (
    <>
      <Hero d={d} />
      <About d={d} />
      <SkillsGrid d={d} technologies={technologies} />
      <ProjectsShowcase d={d} locale={locale} projects={featuredProjects} />
      <ExperienceTimeline d={d} locale={locale} experiences={experiences} />
      <EducationSection d={d} locale={locale} education={education} />
      <ContactSection />
    </>
  );
}
