"use client";

import { useEffect, useRef, useState } from "react";
import { MousePointerClick, Pause, Play } from "lucide-react";
import { useI18n } from "@/contexts/LocaleProvider";
import { cn } from "@/lib/utils";

export const FLOW_SCHEMES = ["violet", "aurora", "ocean", "sunset"] as const;
export type FlowScheme = (typeof FLOW_SCHEMES)[number];

// Pares de cor por paleta — interpolamos entre elas pela posição da partícula.
const SCHEME_COLORS: Record<FlowScheme, [string, string]> = {
  violet: ["#7c3aed", "#e879f9"],
  aurora: ["#10b981", "#38bdf8"],
  ocean: ["#0ea5e9", "#8b5cf6"],
  sunset: ["#f97316", "#ec4899"],
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  seed: number; // 0..1 — onde ela cai na rampa de cor
  trail: { x: number; y: number }[]; // rastro curto (cometa)
};

function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bb = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${bb})`;
}

/**
 * Campo de fluxo interativo: partículas seguem um campo de ângulos pseudo-aleatório
 * (senoides sobrepostas, sem lib externa). O cursor atrai; clique explode.
 * Canvas 2D puro, dpr-aware, respeita prefers-reduced-motion (frame estático).
 */
export function FlowField() {
  const { d } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [density, setDensity] = useState(90);
  const [scheme, setScheme] = useState<FlowScheme>("violet");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const element = canvas;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let time = 0;
    let running = true;
    let particles: Particle[] = [];
    const pointer = { x: -9999, y: -9999, active: false };
    const trailLength = 7;

    const spawn = (n: number) =>
      Array.from({ length: n }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        speed: 0.7 + Math.random() * 1.1,
        seed: Math.random(),
        trail: [],
      }));

    function resize() {
      const rect = element.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      element.width = width * dpr;
      element.height = height * dpr;
      context?.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = spawn(Math.min(220, density));
    }

    // Campo de ângulos: senoides compostas "fingem" ruído e derivam no tempo.
    function fieldAngle(x: number, y: number, tm: number): number {
      const a =
        Math.sin(x * 0.0022 + tm * 0.5) +
        Math.cos(y * 0.0018 - tm * 0.35) +
        Math.sin((x + y) * 0.001 + tm * 0.2);
      return a * Math.PI * 0.8;
    }

    function step() {
      if (!running || !context) return;
      time += 0.006;
      context.clearRect(0, 0, width, height);
      const [c1, c2] = SCHEME_COLORS[scheme];

      for (const p of particles) {
        const angle = fieldAngle(p.x, p.y, time);
        let ax = Math.cos(angle) * p.speed;
        let ay = Math.sin(angle) * p.speed;

        // Atração suave pelo cursor
        if (pointer.active) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 240 && dist > 1) {
            const force = ((240 - dist) / 240) * 0.9;
            ax += (dx / dist) * force;
            ay += (dy / dist) * force;
          }
        }

        // Suaviza a velocidade (cometa elegante, sem solavancos)
        p.vx += (ax - p.vx) * 0.08;
        p.vy += (ay - p.vy) * 0.08;
        p.x += p.vx;
        p.y += p.vy;

        // Renasce do outro lado ao sair
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Rastro
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > trailLength) p.trail.shift();

        // Desenha o rastro com alpha decrescente (cabeça mais viva)
        for (let i = 1; i < p.trail.length; i++) {
          const alpha = (i / p.trail.length) * 0.6;
          context.strokeStyle = lerpColor(c1, c2, p.seed).replace("rgb", "rgba").replace(")", `, ${alpha})`);
          context.lineWidth = 1.4;
          context.beginPath();
          context.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
          context.lineTo(p.trail[i].x, p.trail[i].y);
          context.stroke();
        }
        context.fillStyle = lerpColor(c1, c2, p.seed).replace("rgb", "rgba").replace(")", ", 0.9)");
        context.beginPath();
        context.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        context.fill();
      }

      if (!reduced && !paused) frame = requestAnimationFrame(step);
    }

    function onPointer(event: PointerEvent) {
      const rect = element.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    }
    function onLeave() {
      pointer.active = false;
    }
    function onClick(event: MouseEvent) {
      const rect = element.getBoundingClientRect();
      const cx = event.clientX - rect.left;
      const cy = event.clientY - rect.top;
      for (const p of particles) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const force = Math.max(0, 1 - dist / 260) * 14;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
        p.trail = [];
      }
    }

    resize();
    step();

    const observer = new ResizeObserver(resize);
    observer.observe(element);
    element.addEventListener("pointermove", onPointer, { passive: true });
    element.addEventListener("pointerleave", onLeave);
    element.addEventListener("click", onClick);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      element.removeEventListener("pointermove", onPointer);
      element.removeEventListener("pointerleave", onLeave);
      element.removeEventListener("click", onClick);
    };
  }, [density, scheme, paused]);

  return (
    <section id="flow" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 data-reveal className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {d.lab.flow.title}
      </h2>
      <span aria-hidden="true" className="heading-underline mt-2 block" />
      <p data-reveal className="mt-3 max-w-2xl text-muted">
        {d.lab.flow.subtitle}
      </p>

      <div
        data-reveal
        className="tilt-wrap mt-8 overflow-hidden rounded-xl border border-border bg-surface"
      >
        <canvas
          ref={canvasRef}
          className="block h-[380px] w-full cursor-crosshair sm:h-[460px]"
          aria-label={d.lab.flow.title}
        />
      </div>

      <div data-reveal className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <label className="inline-flex items-center gap-2">
          <span className="text-muted">{d.lab.flow.density}</span>
          <input
            type="range"
            min={30}
            max={220}
            value={density}
            onChange={(event) => setDensity(Number(event.target.value))}
            className="w-36 accent-[var(--accent)]"
            aria-label={d.lab.flow.density}
          />
        </label>

        <label className="inline-flex items-center gap-2">
          <span className="text-muted">{d.lab.flow.scheme}</span>
          <select
            value={scheme}
            onChange={(event) => setScheme(event.target.value as FlowScheme)}
            className="rounded-md border border-border bg-background px-2 py-1"
            aria-label={d.lab.flow.scheme}
          >
            {FLOW_SCHEMES.map((key) => (
              <option key={key} value={key}>
                {d.lab.flow.schemes[key]}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-surface-2"
        >
          {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
          {paused ? d.lab.flow.play : d.lab.flow.pause}
        </button>

        <p className={cn("inline-flex items-center gap-1.5 text-xs text-muted")}>
          <MousePointerClick className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> {d.lab.flow.hint}
        </p>
      </div>
    </section>
  );
}
