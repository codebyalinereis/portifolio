"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Pencil } from "lucide-react";
import { useI18n } from "@/contexts/LocaleProvider";

/* Fourier epicycles feito à mão: você desenha, a curva é reamostrada por
   comprimento de arco, passa por uma DFT O(N²) escrita aqui (sem lib) e a
   reconstrução anima círculos engatados — cada círculo é uma frequência da
   curva, do maior para o menor. Canvas 2D puro, dpr-aware,
   prefers-reduced-motion vira reconstrução estática. */

const SAMPLES = 512; // pontos reamostrados da curva
const CYCLE_S = 11;  // segundos por laço completo

type Point = { x: number; y: number };
type Coef = { freq: number; amp: number; phase: number };

/** Reamostra o traço em N pontos equidistantes por comprimento de arco. */
function resample(points: Point[], n: number): Point[] {
  const closed = [...points, points[0]];
  const lengths = [0];
  let total = 0;
  for (let i = 1; i < closed.length; i++) {
    total += Math.hypot(closed[i].x - closed[i - 1].x, closed[i].y - closed[i - 1].y);
    lengths.push(total);
  }
  if (total < 12) return [];

  const out: Point[] = [];
  let segment = 1;
  for (let i = 0; i < n; i++) {
    const target = (total * i) / n;
    while (lengths[segment] < target) segment++;
    const t = (target - lengths[segment - 1]) / Math.max(1e-6, lengths[segment] - lengths[segment - 1]);
    const a = closed[segment - 1];
    const b = closed[segment];
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return out;
}

/** DFT do contorno como sinal complexo; coeficientes ordenados por magnitude. */
function dft(points: Point[]): Coef[] {
  const N = points.length;
  const coefs: Coef[] = [];
  for (let k = 0; k < N; k++) {
    let re = 0;
    let im = 0;
    const angle = (-2 * Math.PI * k) / N;
    for (let n = 0; n < N; n++) {
      const c = Math.cos(angle * n);
      const s = Math.sin(angle * n);
      re += points[n].x * c - points[n].y * s;
      im += points[n].x * s + points[n].y * c;
    }
    re /= N;
    im /= N;
    coefs.push({ freq: k, amp: Math.hypot(re, im), phase: Math.atan2(im, re) });
  }
  return coefs.sort((a, b) => b.amp - a.amp);
}

/** Preset paramétrico (coração clássico) — para o primeiro paint não ser vazio. */
function heart(n: number): Point[] {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2;
    return {
      x: 16 * Math.sin(t) ** 3,
      y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
    };
  });
}

/** Centraliza pelo centróide e normaliza para raio máximo de 100 unidades. */
function normalize(points: Point[]): Point[] {
  const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const max = Math.max(...points.map((p) => Math.hypot(p.x - cx, p.y - cy)), 1e-6);
  const scale = 100 / max;
  return points.map((p) => ({ x: (p.x - cx) * scale, y: (p.y - cy) * scale }));
}

/** Hex (#rgb/#rrggbb) → rgba() — canvas 2D não entende color-mix(). */
function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

export function FourierDraw() {
  const { d } = useI18n();
  const padRef = useRef<HTMLCanvasElement>(null);
  const machineRef = useRef<HTMLCanvasElement>(null);
  const resetRef = useRef<() => void>(() => {});
  const lastStrokeRef = useRef<Point[] | null>(null);
  const [harmonics, setHarmonics] = useState(72);

  useEffect(() => {
    const pad = padRef.current;
    const machine = machineRef.current;
    if (!pad || !machine) return;
    const padCtx = pad.getContext("2d");
    const machineCtx = machine.getContext("2d");
    if (!padCtx || !machineCtx) return;

    // Narrowing não vaza para closures — fixa em consts locais (padrão do FlowField)
    const padEl = pad;
    const machineEl = machine;
    const pad2d = padCtx;
    const machine2d = machineCtx;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let coefs: Coef[] = [];
    const trail: Point[] = [];
    const stroke: Point[] = [];
    let time = 0;
    let lastU = 0;
    let raf = 0;
    let visible = true;
    let width = 0;
    let height = 0;

    // Accent em cache — atualiza quando o tema troca (classe no <html>)
    let accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#7c3aed";
    const themeObserver = new MutationObserver(() => {
      accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || accent;
      redrawPad(lastStrokeRef.current);
      if (reduced) drawStatic();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    function scaleTo(): number {
      // 100 unidades (raio máximo da curva) → raio útil do canvas
      return (Math.min(width, height) / 2 - 28) / 100;
    }

    function setStroke(points: Point[]) {
      const resampled = resample(points, SAMPLES);
      if (resampled.length === 0) return;
      coefs = dft(normalize(resampled));
      trail.length = 0;
      lastU = 0;
      time = 0;
      lastStrokeRef.current = points;
      redrawPad(points);
      if (reduced) drawStatic();
    }
    resetRef.current = () => setStroke(heart(256));

    function redrawPad(points?: Point[] | null) {
      pad2d.clearRect(0, 0, width, height);
      if (!points || points.length < 2) return;
      pad2d.strokeStyle = accent;
      pad2d.lineWidth = 2;
      pad2d.lineJoin = "round";
      pad2d.lineCap = "round";
      pad2d.beginPath();
      pad2d.moveTo(points[0].x, points[0].y);
      for (const p of points) pad2d.lineTo(p.x, p.y);
      pad2d.stroke();
    }

    function draw() {
      machine2d.clearRect(0, 0, width, height);
      const terms = coefs.slice(0, harmonics);
      if (terms.length === 0) return;

      const u = (time / CYCLE_S) % 1;
      if (u < lastU) trail.length = 0; // completou o laço: recomeça o traço
      lastU = u;

      const cx = width / 2;
      const cy = height / 2;
      const scale = scaleTo();

      let x = cx;
      let y = cy;
      for (let i = 0; i < terms.length; i++) {
        const { freq, amp, phase } = terms[i];
        const angle = 2 * Math.PI * freq * u + phase;
        const nx = x + Math.cos(angle) * amp * scale;
        const ny = y + Math.sin(angle) * amp * scale;

        // Só os primeiros círculos são desenhados — o resto é formigário
        if (i < 48) {
          machine2d.strokeStyle = withAlpha(accent, 0.16);
          machine2d.lineWidth = 1;
          machine2d.beginPath();
          machine2d.arc(x, y, amp * scale, 0, Math.PI * 2);
          machine2d.stroke();
          machine2d.strokeStyle = withAlpha(accent, 0.34);
          machine2d.beginPath();
          machine2d.moveTo(x, y);
          machine2d.lineTo(nx, ny);
          machine2d.stroke();
        }
        x = nx;
        y = ny;
      }

      trail.push({ x, y });
      if (trail.length > SAMPLES) trail.shift();

      // Traço reconstruído
      machine2d.strokeStyle = accent;
      machine2d.lineWidth = 2;
      machine2d.lineJoin = "round";
      machine2d.beginPath();
      machine2d.moveTo(trail[0].x, trail[0].y);
      for (const p of trail) machine2d.lineTo(p.x, p.y);
      machine2d.stroke();

      // Caneta
      machine2d.fillStyle = accent;
      machine2d.beginPath();
      machine2d.arc(x, y, 3.5, 0, Math.PI * 2);
      machine2d.fill();
    }

    function drawStatic() {
      machine2d.clearRect(0, 0, width, height);
      const terms = coefs.slice(0, harmonics);
      if (terms.length === 0) return;
      const cx = width / 2;
      const cy = height / 2;
      const scale = scaleTo();
      machine2d.strokeStyle = accent;
      machine2d.lineWidth = 2;
      machine2d.lineJoin = "round";
      machine2d.beginPath();
      for (let i = 0; i <= SAMPLES; i++) {
        const u = i / SAMPLES;
        let px = 0;
        let py = 0;
        for (const { freq, amp, phase } of terms) {
          const angle = 2 * Math.PI * freq * u + phase;
          px += Math.cos(angle) * amp * scale;
          py += Math.sin(angle) * amp * scale;
        }
        if (i === 0) machine2d.moveTo(cx + px, cy + py);
        else machine2d.lineTo(cx + px, cy + py);
      }
      machine2d.stroke();
    }

    function step(now: number, last: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      time += dt;
      draw();
      if (visible) raf = requestAnimationFrame((n) => step(n, now));
    }

    function resize() {
      for (const canvas of [padEl, machineEl]) {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        (canvas.getContext("2d") as CanvasRenderingContext2D).setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      redrawPad(lastStrokeRef.current);
      if (reduced) drawStatic();
    }

    // Último traço do usuário (sobrevive a trocas de harmônicos) ou coração
    setStroke(lastStrokeRef.current ?? heart(256));

    const io = new IntersectionObserver((entries) => {
      const was = visible;
      visible = entries[entries.length - 1].isIntersecting;
      if (visible && !was && !reduced && raf === 0) raf = requestAnimationFrame((n) => step(n, n));
    });
    io.observe(machineEl);
    const observer = new ResizeObserver(resize);
    observer.observe(padEl);
    observer.observe(machineEl);

    // Desenho do usuário no pad
    let drawing = false;
    function localPoint(event: PointerEvent): Point {
      const rect = padEl.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
    function onDown(event: PointerEvent) {
      drawing = true;
      stroke.length = 0;
      padEl.setPointerCapture(event.pointerId);
      const p = localPoint(event);
      stroke.push(p);
      redrawPad([p, { ...p, x: p.x + 1 }]);
    }
    function onMove(event: PointerEvent) {
      if (!drawing) return;
      const p = localPoint(event);
      const last = stroke[stroke.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) > 2.5) stroke.push(p);
      redrawPad(stroke);
    }
    function onUp() {
      if (!drawing) return;
      drawing = false;
      setStroke(stroke);
    }
    padEl.addEventListener("pointerdown", onDown);
    padEl.addEventListener("pointermove", onMove, { passive: true });
    padEl.addEventListener("pointerup", onUp);
    padEl.addEventListener("pointercancel", onUp);

    if (!reduced) raf = requestAnimationFrame((n) => step(n, n));

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      observer.disconnect();
      themeObserver.disconnect();
      padEl.removeEventListener("pointerdown", onDown);
      padEl.removeEventListener("pointermove", onMove);
      padEl.removeEventListener("pointerup", onUp);
      padEl.removeEventListener("pointercancel", onUp);
    };
  }, [harmonics]);

  return (
    <section id="fourier" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 data-reveal className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {d.lab.fourier.title}
        </h2>
        <span aria-hidden="true" className="heading-underline mt-2 block" />
        <p data-reveal className="mt-3 max-w-2xl text-muted">
          {d.lab.fourier.subtitle}
        </p>

        <div data-reveal className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <canvas
              ref={padRef}
              className="block h-[320px] w-full cursor-crosshair touch-none"
              aria-label={d.lab.fourier.draw}
            />
            <p className="flex items-center gap-1.5 border-t border-border px-4 py-2 text-xs text-muted">
              <Pencil className="h-3 w-3" aria-hidden="true" /> {d.lab.fourier.draw}
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            <canvas ref={machineRef} className="block h-[320px] w-full" aria-label={d.lab.fourier.machine} />
            <p className="border-t border-border px-4 py-2 text-xs text-muted">{d.lab.fourier.machine}</p>
          </div>
        </div>

        <div data-reveal className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <span className="text-muted">{d.lab.fourier.harmonics}</span>
            <input
              type="range"
              min={8}
              max={224}
              step={4}
              value={harmonics}
              onChange={(event) => setHarmonics(Number(event.target.value))}
              className="w-40 accent-[var(--accent)]"
              aria-label={d.lab.fourier.harmonics}
            />
            <strong className="tabular-nums text-foreground">{harmonics}</strong>
          </label>
          <button
            type="button"
            onClick={() => resetRef.current()}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-surface-2"
          >
            <Heart className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> {d.lab.fourier.preset}
          </button>
          <p className="text-xs text-muted">{d.lab.fourier.note}</p>
        </div>
      </div>
    </section>
  );
}
