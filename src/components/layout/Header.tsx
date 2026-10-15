"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useI18n } from "@/contexts/LocaleProvider";
import { cn } from "@/lib/utils";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { d } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      aria-label={isDark ? d.theme.toLight : d.theme.toDark}
      title={isDark ? d.theme.toLight : d.theme.toDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-foreground"
    >
      {mounted ? (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <Moon className="h-4 w-4" />}
    </button>
  );
}

function LangToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="flex items-center rounded-md border border-border p-0.5 text-xs font-semibold" role="group" aria-label="Idioma / Language">
      <button
        type="button"
        onClick={() => setLocale("pt-BR")}
        aria-pressed={locale === "pt-BR"}
        className={cn(
          "rounded px-2 py-1 transition-colors",
          locale === "pt-BR" ? "bg-accent text-accent-ink" : "text-muted hover:text-foreground"
        )}
      >
        PT
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={cn(
          "rounded px-2 py-1 transition-colors",
          locale === "en" ? "bg-accent text-accent-ink" : "text-muted hover:text-foreground"
        )}
      >
        EN
      </button>
    </div>
  );
}

export function Header() {
  const { d } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: d.nav.home },
    { href: "/projects", label: d.nav.projects },
    { href: "/dashboard", label: d.nav.dashboard },
    { href: "/docs", label: d.nav.docs },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight">
          Aline<span className="text-accent">·</span>Reis
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-foreground",
                pathname === link.href && "text-foreground font-medium"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-foreground md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border bg-background px-4 py-3 md:hidden" aria-label="Mobile">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
