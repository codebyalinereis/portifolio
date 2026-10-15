"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { useI18n } from "@/contexts/LocaleProvider";
import { cn } from "@/lib/utils";

export function AdminNav() {
  const { d } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/admin", label: d.admin.nav.overview },
    { href: "/admin/projects", label: d.admin.nav.projects },
    { href: "/admin/skills", label: d.admin.nav.technologies },
    { href: "/admin/experiences", label: d.admin.nav.experiences },
    { href: "/admin/messages", label: d.admin.nav.messages },
    { href: "/admin/datasets", label: d.admin.nav.datasets },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Admin" className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              pathname === link.href ? "bg-accent text-accent-ink" : "text-muted hover:bg-surface-2 hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="inline-flex items-center gap-1 text-muted hover:text-foreground">
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> {d.admin.nav.viewSite}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> {d.admin.nav.logout}
        </button>
      </div>
    </div>
  );
}
