import { Sparkles } from "lucide-react";

/**
 * Faixa deslizante com as tecnologias do stack — separador ✦, pausa no hover,
 * bordas esmaecidas com máscara. O CSS (globals.css) cuida do movimento e
 * desliga a animação em prefers-reduced-motion.
 */
export function TechMarquee({ items }: { items: string[] }) {
  const row = [...items, ...items];

  return (
    <div className="marquee border-b border-border" aria-hidden="true">
      <div className="marquee-track">
        {row.map((item, index) => (
          <span key={`${item}-${index}`} className="marquee-item">
            <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
