"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BreakdownRow } from "@/lib/analytics";
import { useChartPalette } from "@/lib/chart-palette";
import { formatBRL } from "@/lib/serializers";
import { useI18n } from "@/contexts/LocaleProvider";

function compactBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

/**
 * Part-to-whole por categoria — a barra horizontal é a forma principal
 * (donut seria opcional e só com ≤5 fatias). Mesma codificação sequencial
 * do gráfico de UF: magnitude = uma cor.
 */
export function CategoryShareChart({ rows }: { rows: BreakdownRow[] }) {
  const palette = useChartPalette();
  const { d } = useI18n();
  const maxValue = Math.max(...rows.map((row) => row.total), 1);

  const labelFor = (key: string): string =>
    (d.dashboard.categories as Record<string, string>)[key] ?? key;

  const data = rows.map((row) => ({ ...row, label: labelFor(row.key) }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 26 + 24, 120)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 56, bottom: 0, left: 8 }}>
        <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: palette.text, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: number) => compactBRL(value)}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fill: palette.text, fontSize: 12 }}
          axisLine={{ stroke: palette.grid }}
          tickLine={false}
          width={96}
        />
        <Tooltip
          cursor={{ fill: palette.grid, opacity: 0.35 }}
          content={({ active, payload }) => {
            if (!active || !payload?.[0]?.payload) return null;
            const row = payload[0].payload as BreakdownRow & { label: string };
            return (
              <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-sm">
                <p className="font-semibold">{row.label}</p>
                <p className="tabular-nums text-muted">
                  {formatBRL(row.total)} · {(row.share * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
                </p>
              </div>
            );
          }}
        />
        <Bar dataKey="total" barSize={14} radius={[0, 4, 4, 0]}>
          {data.map((row) => (
            <Cell key={row.key} fill={palette.seq(row.total / maxValue)} />
          ))}
          <LabelList
            dataKey="share"
            position="right"
            formatter={(value) => (typeof value === "number" ? `${(value * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%` : "")}
            style={{ fill: palette.text, fontSize: 11 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
