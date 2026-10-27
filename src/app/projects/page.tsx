import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDictionary, isLocale, DEFAULT_LOCALE, LOCALE_COOKIE } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { SkillCategory } from "@prisma/client";
import { EmptyState } from "@/components/ui/primitives";
import { ProjectCard } from "@/components/sections/ProjectsShowcase";
import { cn } from "@/lib/utils";

const STACKS: SkillCategory[] = ["DATA", "BACKEND", "FRONTEND", "DEVOPS", "DOMAIN"];

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
  const { stack } = await searchParams;
  const activeStack = STACKS.includes(stack as SkillCategory) ? (stack as SkillCategory) : undefined;

  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const d = getDictionary(locale);

  const projects = await prisma.project
    .findMany({
      where: activeStack ? { technologies: { some: { technology: { category: activeStack } } } } : undefined,
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      include: { technologies: { include: { technology: true }, orderBy: { technology: { name: "asc" } } } },
    })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-2">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← {d.nav.home}
        </Link>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">{d.projects.title}</h1>
      <p className="mt-2 max-w-2xl text-muted">{d.projects.subtitle}</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">{d.projects.filterHint}</span>
        <Link
          href="/projects"
          className={cn(
            "rounded-full border px-3 py-1 text-sm transition-colors",
            !activeStack ? "border-accent bg-accent-soft text-accent" : "border-border text-muted hover:text-foreground"
          )}
        >
          {d.projects.filterAll}
        </Link>
        {STACKS.map((stackKey) => (
          <Link
            key={stackKey}
            href={`/projects?stack=${stackKey}`}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              activeStack === stackKey
                ? "border-accent bg-accent-soft text-accent"
                : "border-border text-muted hover:text-foreground"
            )}
          >
            {d.projects.filters[stackKey]}
          </Link>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="mt-10">
          <EmptyState>{d.projects.empty}</EmptyState>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              locale={locale}
              featuredLabel={d.projects.featuredLabel}
              techLabel={d.projects.tech}
              detailLabel={d.projects.detail}
            />
          ))}
        </div>
      )}
    </div>
  );
}
