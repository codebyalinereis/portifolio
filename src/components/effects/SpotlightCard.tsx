"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Card com spotlight que segue o cursor + tilt 3D sutil.
 * O efeito vive no CSS (.spotlight/.tilt-wrap/.tilt-body); aqui só
 * escrevemos as variáveis --mx/--my (posição do brilho) e --rx/--ry
 * (inclinação) a partir do mouse. Children podem ser Server Components.
 */
export function SpotlightCard({
  children,
  className,
  tilt = true,
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    if (tilt) {
      const px = x / rect.width - 0.5;
      const py = y / rect.height - 0.5;
      el.style.setProperty("--ry", `${px * 5}deg`);
      el.style.setProperty("--rx", `${-py * 5}deg`);
    }
  }

  function handleLeave() {
    const el = wrapRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div className="tilt-wrap h-full" onPointerMove={handleMove} onPointerLeave={handleLeave}>
      <div ref={wrapRef} className={cn("spotlight tilt-body h-full", className)}>
        {children}
      </div>
    </div>
  );
}
