"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimeseriesPoint } from "@/lib/analytics";
import { useChartPalette } from "@/lib/chart-palette";
import { formatBRL } from "@/lib/serializers";
import { useI18n } from "@/contexts/LocaleProvider";

function compactBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

type TooltipEntry = { name?: string; value?: number | string; color?: string };

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const month = typeof label === "string" ? label : String(label ?? "");
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-semibold">{month}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-1.5 tabular-nums text-muted">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full" style={{ background: entry.color }} />
          {entry.name}: <span className="text-foreground">{formatBRL(Number(entry.value))}</span>
        </p>
      ))}
    </div>
  );
}

export function TrendLineChart({ points }: { points: TimeseriesPoint[] }) {
  const palette = useChartPalette();
  const { d, locale } = useI18n();
  const c = d.dashboard.charts.trend;

  const monthFormat = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "pt-BR", { month: "short", year: "2-digit" });
  // dataKey fixo (receita_online/receita_loja) + name localizado: legend/tooltip
  // traduzem sem chaves dinâmicas no tipo.
  const data = points.map((point) => ({
    ...point,
    mesLabel: monthFormat.format(new Date(`${point.mes}T12:00:00`)),
  }));

  const last = data[data.length - 1];
  const lastX = last?.mesLabel ?? "";

  return (
    <div>
      {/* Legenda — obrigatória com 2 séries; identidade nunca só pela cor */}
      <div className="mb-2 flex items-center gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block h-0.5 w-4 rounded" style={{ background: palette.series1 }} />
          {c.legendOnline}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block h-0.5 w-4 rounded" style={{ background: palette.series2 }} />
          {c.legendLoja}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 56, bottom: 0, left: 8 }}>
          <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="mesLabel"
            tick={{ fill: palette.text, fontSize: 12 }}
            axisLine={{ stroke: palette.grid }}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tick={{ fill: palette.text, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={64}
            tickFormatter={(value: number) => compactBRL(value)}
            domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: palette.grid, strokeWidth: 1 }} />
          <Line
            name={c.legendOnline}
            dataKey="receita_online"
            stroke={palette.series1}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Line
            name={c.legendLoja}
            dataKey="receita_loja"
            stroke={palette.series2}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          {/* Labels diretos no último ponto (≤4 séries = também direto) */}
          {last ? (
            <>
              <ReferenceDot
                x={lastX}
                y={last.receita_online}
                fill={palette.series1}
                stroke={palette.surface}
                strokeWidth={2}
                r={4}
                label={{ value: compactBRL(last.receita_online), position: "right", fill: palette.text, fontSize: 11, dx: 6 }}
                ifOverflow="extendDomain"
              />
              <ReferenceDot
                x={lastX}
                y={last.receita_loja}
                fill={palette.series2}
                stroke={palette.surface}
                strokeWidth={2}
                r={4}
                label={{ value: compactBRL(last.receita_loja), position: "right", fill: palette.text, fontSize: 11, dx: 6 }}
                ifOverflow="extendDomain"
              />
            </>
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
