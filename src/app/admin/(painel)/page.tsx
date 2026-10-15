import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDictionary, getLocaleFromCookies } from "@/lib/i18n/server";
import { Card } from "@/components/ui/primitives";

export default async function AdminOverviewPage() {
  const locale = await getLocaleFromCookies();
  const d = getDictionary(locale);
  const o = d.admin.overview;

  const [projectCount, technologyCount, experienceCount, messageCount, unreadCount, recentMessages] = await Promise.all([
    prisma.project.count(),
    prisma.technology.count(),
    prisma.experience.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const cards = [
    { label: o.projects, value: projectCount, href: "/admin/projects" },
    { label: o.technologies, value: technologyCount, href: "/admin/skills" },
    { label: o.experiences, value: experienceCount, href: "/admin/experiences" },
    { label: o.messages, value: messageCount, href: "/admin/messages" },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold">{o.title}</h1>
      <p className="mt-1 text-sm text-muted">{o.welcome}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="transition-colors hover:border-accent">
              <p className="text-3xl font-bold tabular-nums text-accent">{card.value}</p>
              <p className="mt-1 text-sm text-muted">{card.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{o.recentMessages}</h2>
        {recentMessages.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">{o.noMessages}</p>
        ) : (
          <ul className="space-y-2">
            {recentMessages.map((message) => (
              <li key={message.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm">
                <span className="min-w-0">
                  <span className="font-medium">{message.name}</span>
                  <span className="ml-2 truncate text-muted">{message.message.slice(0, 80)}</span>
                </span>
                {!message.read ? (
                  <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
                    {unreadCount} {o.unread}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
