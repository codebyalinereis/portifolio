import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Wrapper de acessibilidade para todo gráfico: <figure> com caption,
 * aria-label descritivo e <details> com a tabela de dados (leitores de tela
 * e exportação). O gráfico nunca é só cor/imagem.
 */
export function ChartFigure({
  title,
  subtitle,
  ariaLabel,
  detailsLabel,
  table,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  ariaLabel: string;
  detailsLabel: string;
  table: { headings: string[]; rows: (string | number)[][] };
  className?: string;
  children: ReactNode;
}) {
  return (
    <figure className={cn("rounded-lg border border-border bg-surface p-5", className)}>
      <figcaption className="mb-4">
        <span className="block text-sm font-semibold">{title}</span>
        {subtitle ? <span className="mt-0.5 block text-xs text-muted">{subtitle}</span> : null}
      </figcaption>
      <div role="img" aria-label={ariaLabel}>
        {children}
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-muted hover:text-foreground">{detailsLabel}</summary>
        <div className="mt-2 max-h-56 overflow-auto rounded-md border border-border">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-surface-2">
              <tr>
                {table.headings.map((heading) => (
                  <th key={heading} scope="col" className="px-2 py-1.5 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, index) => (
                <tr key={index} className="border-t border-border">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-2 py-1.5 tabular-nums text-muted">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
