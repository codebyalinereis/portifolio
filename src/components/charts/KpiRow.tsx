"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import type { Kpis } from "@/lib/analytics";
import { formatBRL, formatNumber } from "@/lib/serializers";
import { useChartPalette } from "@/lib/chart-palette";
import { useI18n } from "@/contexts/LocaleProvider";

function compactBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function Tile({
  label,
  value,
  fullValue,
  delta,
  deltaLabel,
  deltaColor,
}: {
  label: string;
  value: string;
  fullValue?: string;
  delta?: number;
  deltaLabel?: string;
  deltaColor?: string;
}) {
  const DeltaIcon = delta !== undefined && delta >= 0 ? TrendingUp : TrendingDown;
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tabular-nums" title={fullValue}>
        {value}
      </p>
      {delta !== undefined ? (
        <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium" style={deltaColor ? { color: deltaColor } : undefined}>
          <DeltaIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="tabular-nums">
            {delta >= 0 ? "+" : ""}
            {delta.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
          </span>
          <span className="font-normal text-muted">{deltaLabel}</span>
        </p>
      ) : null}
    </div>
  );
}

export function KpiRow({ kpis }: { kpis: Kpis }) {
  const { d } = useI18n();
  const palette = useChartPalette();
  const k = d.dashboard.kpis;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <Tile label={k.invoices} value={formatNumber(kpis.count)} />
      <Tile label={k.totalValue} value={compactBRL(kpis.totalValue)} fullValue={formatBRL(kpis.totalValue)} />
      <Tile label={k.avgValue} value={compactBRL(kpis.avgValue)} fullValue={formatBRL(kpis.avgValue)} />
      <Tile label={k.cargaAtual} value={compactBRL(kpis.cargaAtual)} fullValue={formatBRL(kpis.cargaAtual)} />
      <Tile
        label={k.cargaReforma}
        value={compactBRL(kpis.cargaReforma)}
        fullValue={formatBRL(kpis.cargaReforma)}
        delta={kpis.deltaPct}
        deltaLabel={k.deltaLabel}
        // Cor é apoio — o ícone + o sinal + o texto carregam o significado
        deltaColor={kpis.deltaPct >= 0 ? palette.series2 : palette.series1}
      />
      <Tile label={k.credits} value={compactBRL(kpis.credits)} fullValue={formatBRL(kpis.credits)} />
    </div>
  );
}
