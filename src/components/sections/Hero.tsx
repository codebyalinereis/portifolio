import Link from "next/link";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Badge, buttonClass } from "@/components/ui/primitives";
import { ParticleField } from "@/components/effects/ParticleField";
import { Typewriter } from "@/components/effects/Typewriter";
import type { Dictionary } from "@/lib/i18n";

export function Hero({ d }: { d: Dictionary }) {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border">
      {/* Aurora: manchas de gradiente roxo flutuando atrás de tudo */}
      <div className="aurora" aria-hidden="true" />
      {/* Grade técnica sutil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]"
      />
      {/* Constelação interativa — partículas reagem ao cursor */}
      <ParticleField className="absolute inset-0 h-full w-full" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-24 sm:px-6 sm:py-32">
        <p
          data-reveal
          className="pulse-ring inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
        >
          <MapPin className="h-3 w-3 text-accent" aria-hidden="true" /> {d.hero.location}
        </p>
        <h1
          data-reveal
          style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
          className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl"
        >
          <span className="text-gradient">{d.hero.name}</span>
          <span className="mt-3 block h-8 text-xl font-semibold text-accent sm:h-9 sm:text-2xl">
            <Typewriter words={d.hero.roles} />
          </span>
        </h1>
        <p
          data-reveal
          style={{ "--reveal-delay": "160ms" } as React.CSSProperties}
          className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg"
        >
          {d.hero.summary}
        </p>
        <div data-reveal style={{ "--reveal-delay": "240ms" } as React.CSSProperties} className="flex flex-wrap gap-2">
          {d.hero.badges.map((badge) => (
            <Badge key={badge} className="glow-hover cursor-default border-accent/25 bg-accent-soft text-foreground">
              {badge}
            </Badge>
          ))}
        </div>
        <div
          data-reveal
          style={{ "--reveal-delay": "320ms" } as React.CSSProperties}
          className="mt-2 flex flex-wrap gap-3"
        >
          <Link href="/projects" className={buttonClass("primary")}>
            {d.hero.ctaProjects} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/lab" className={buttonClass("outline")}>
            <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" /> {d.hero.ctaLab}
          </Link>
          <a href="#contato" className={buttonClass("ghost")}>
            {d.hero.ctaContact}
          </a>
        </div>
      </div>
    </section>
  );
}
