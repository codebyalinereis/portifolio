import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight, FolderGit2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDictionary, isLocale, DEFAULT_LOCALE, LOCALE_COOKIE } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localized";
import { Badge } from "@/components/ui/primitives";
import { projectTitle, projectSummary } from "@/components/sections/ProjectsShowcase";

async function getProject(slug: string) {
  return prisma.project
    .findUnique({
      where: { slug },
      include: { technologies: { include: { technology: true }, orderBy: { technology: { name: "asc" } } } },
    })
    .catch(() => null);
}

async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

/** Corpo do estudo de caso: blocos separados por linha em branco — "## " vira
    subtítulo, linhas "- " viram lista, o resto é parágrafo. Render no servidor. */
function CaseStudyBody({ text }: { text: string }) {
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="mt-8 space-y-4">
      {blocks.map((block, index) => {
        if (block.startsWith("## ")) {
          return (
            <h2 key={index} className="pt-4 text-xl font-semibold tracking-tight">
              {block.slice(3)}
            </h2>
          );
        }
        if (block.split("\n").every((line) => line.startsWith("- "))) {
          return (
            <ul key={index} className="space-y-1.5 pl-1">
              {block.split("\n").map((line, item) => (
                <li key={item} className="flex gap-2 leading-relaxed text-muted">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {line.slice(2)}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="leading-relaxed text-muted">
            {block}
          </p>
        );
      })}
    </div>
  );
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [project, locale] = await Promise.all([getProject(slug), getLocale()]);
  if (!project) return {};
  return {
    title: localized(project.title, project.titleEn, locale),
    description: localized(project.summary, project.summaryEn, locale),
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const locale = await getLocale();
  const d = getDictionary(locale);

  const project = await getProject(slug);
  if (!project) notFound();

  const detail = localized(project.detail, project.detailEn, locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-2">
        <Link href="/projects" className="text-sm text-muted hover:text-foreground">
          ← {d.nav.projects}
        </Link>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">{projectTitle(project, locale)}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">{projectSummary(project, locale)}</p>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {project.technologies.map(({ technology }) => (
          <Badge key={technology.id} className="glow-hover">
            {technology.name}
          </Badge>
        ))}
      </div>

      {detail ? (
        <CaseStudyBody text={detail} />
      ) : null}

      {project.repoUrl || project.liveUrl ? (
        <div className="mt-10 flex items-center gap-4 border-t border-border pt-6 text-sm">
          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted hover:text-foreground"
            >
              <FolderGit2 className="h-4 w-4" aria-hidden="true" /> {d.projects.repo}
            </a>
          ) : null}
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent hover:underline"
            >
              {d.projects.live} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
