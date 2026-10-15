import Link from "next/link";
import { ArrowUpRight, FolderGit2, Star } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { Badge, EmptyState, SectionHeading, buttonClass } from "@/components/ui/primitives";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import type { Dictionary, Locale } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localized";

type ProjectWithTech = Prisma.ProjectGetPayload<{
  include: { technologies: { include: { technology: true } } };
}>;

export function projectTitle(project: ProjectWithTech, locale: Locale): string {
  return localized(project.title, project.titleEn, locale);
}

export function projectSummary(project: ProjectWithTech, locale: Locale): string {
  return localized(project.summary, project.summaryEn, locale);
}

export function ProjectCard({
  project,
  locale,
  featuredLabel,
  techLabel,
}: {
  project: ProjectWithTech;
  locale: Locale;
  featuredLabel: string;
  techLabel: string;
}) {
  return (
    <SpotlightCard className="rounded-lg">
      <article className="group flex h-full flex-col rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold leading-snug">{projectTitle(project, locale)}</h3>
        {project.featured ? (
          <Badge className="shrink-0 border-accent/40 text-accent">
            <Star className="mr-1 h-3 w-3" aria-hidden="true" /> {featuredLabel}
          </Badge>
        ) : null}
      </div>
      <p className="flex-1 text-sm leading-relaxed text-muted">{projectSummary(project, locale)}</p>
      <div className="mt-4">
        <p className="sr-only">{techLabel}</p>
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.map(({ technology }) => (
            <Badge key={technology.id} className="glow-hover">
              {technology.name}
            </Badge>
          ))}
        </div>
      </div>
      {(project.repoUrl || project.liveUrl) && (
        <div className="mt-4 flex items-center gap-3 text-sm">
          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted hover:text-foreground"
            >
              <FolderGit2 className="h-3.5 w-3.5" aria-hidden="true" /> repo
            </a>
          ) : null}
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent hover:underline"
            >
              live <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      )}
      </article>
    </SpotlightCard>
  );
}

export function ProjectsShowcase({
  d,
  locale,
  projects,
}: {
  d: Dictionary;
  locale: Locale;
  projects: ProjectWithTech[];
}) {
  return (
    <section id="projetos" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading title={d.projects.title} subtitle={d.projects.subtitle} className="mb-0" />
        <Link href="/projects" className={buttonClass("outline", "mb-2")}>
          {d.common.viewAll} →
        </Link>
      </div>
      {projects.length === 0 ? (
        <div className="mt-8">
          <EmptyState>{d.projects.empty}</EmptyState>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <div
              key={project.id}
              data-reveal
              style={{ "--reveal-delay": `${index * 90}ms` } as React.CSSProperties}
            >
              <ProjectCard
                project={project}
                locale={locale}
                featuredLabel={d.projects.featuredLabel}
                techLabel={d.projects.tech}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
