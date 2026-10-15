"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Contador animado para os números de destaque ("4+", "~90%", "27").
 * Aceita prefixo/sufixo não numéricos; anima com ease-out quando o
 * elemento entra na viewport. Sem JS/antes de visível: mostra o valor
 * final (nada de flash de conteúdo errado).
 */
export function Counter({ value, duration = 1400 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const match = value.match(/^([^\d]*)(\d+)(.*)$/);
    if (!match) return;
    const [, prefix, digits, suffix] = match;
    const target = Number(digits);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // mantém o valor final renderizado

    let raf = 0;
    let started = false;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || started) return;
        started = true;
        io.disconnect();

        const t0 = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          const current = Math.round(target * eased);
          setDisplay(`${prefix}${current}${suffix}`);
          if (progress < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );

    if (ref.current) io.observe(ref.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  );
}
