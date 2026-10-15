"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

/**
 * Campo de partículas conectadas (constellation) em tons de roxo.
 * Reage ao mouse: pontos próximos são suavemente repelidos e as linhas
 * até o cursor se acendem — a rede "sente" o visitante.
 * Sem bibliotecas: canvas 2D puro, respeita prefers-reduced-motion.
 */
export function ParticleField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    // Fixa a referência p/ o cleanup (TS não estreita ref através de closures)
    const element = canvas;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = true;
    const mouse = { x: -9999, y: -9999 };

    // Roxo que funciona sobre fundo claro e escuro (alpha cuida do contraste).
    const DOT = "139, 92, 246";
    const LINK = "139, 92, 246";

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context?.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(110, Math.floor((width * height) / 14000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1 + Math.random() * 1.8,
      }));
    }

    function step() {
      if (!running || !context) return;
      context.clearRect(0, 0, width, height);

      const linkDist = 130;

      for (const p of particles) {
        // Movimento base (desativado em reduced-motion — desenho estático)
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        }

        // Repulsão suave do cursor
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 120 * 120 && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const force = ((120 - dist) / 120) * 0.6;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
      }

      // Linhas entre partículas próximas
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDist) {
            const alpha = (1 - dist / linkDist) * 0.22;
            context.strokeStyle = `rgba(${LINK}, ${alpha})`;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }
      }

      // Linhas até o cursor (a rede "acende" perto dele)
      for (const p of particles) {
        const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (dist < 170) {
          const alpha = (1 - dist / 170) * 0.4;
          context.strokeStyle = `rgba(${LINK}, ${alpha})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(p.x, p.y);
          context.lineTo(mouse.x, mouse.y);
          context.stroke();
        }
      }

      // Pontos
      for (const p of particles) {
        context.fillStyle = `rgba(${DOT}, 0.55)`;
        context.beginPath();
        context.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        context.fill();
      }

      if (!reduced) frame = requestAnimationFrame(step);
    }

    function onPointer(event: PointerEvent) {
      const rect = element.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    }
    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    resize();
    step();

    const observer = new ResizeObserver(() => {
      resize();
    });
    observer.observe(canvas);
    window.addEventListener("pointermove", onPointer, { passive: true });
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      element.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
