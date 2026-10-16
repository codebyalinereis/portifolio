"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BreakdownRow } from "@/lib/analytics";
import { useChartPalette } from "@/lib/chart-palette";
import { formatBRL } from "@/lib/serializers";

function compactBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function BarTooltip({
  active,
  payload,
  unitLabel,
}: {
  active?: boolean;
  payload?: Array<{ payload?: BreakdownRow }>;
  unitLabel: string;
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold">{row.key}</p>
      <p className="tabular-nums text-muted">
        {formatBRL(row.total)} · {row.count.toLocaleString("pt-BR")} {unitLabel}
      </p>
    </div>
  );
}

/**
 * Ranking por UF — barras horizontais com UMA cor sequencial (magnitude),
 * nunca arco-íris. Cor interpolada em OKLab entre os extremos validados.
 */
export function UfBarChart({ rows, unitLabel }: { rows: BreakdownRow[]; unitLabel: string }) {
  const palette = useChartPalette();
  const maxValue = Math.max(...rows.map((row) => row.total), 1);

  return (
    <ResponsiveContainer width="100%" height={Math.max(rows.length * 26 + 24, 120)}>
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 56, bottom: 0, left: 8 }}>
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
          dataKey="key"
          tick={{ fill: palette.text, fontSize: 12 }}
          axisLine={{ stroke: palette.grid }}
          tickLine={false}
          width={32}
        />
        <Tooltip content={<BarTooltip unitLabel={unitLabel} />} cursor={{ fill: palette.grid, opacity: 0.35 }} />
        <Bar dataKey="total" barSize={14} radius={[0, 4, 4, 0]}>
          {rows.map((row) => (
            <Cell key={row.key} fill={palette.seq(row.total / maxValue)} />
          ))}
          <LabelList
            dataKey="total"
            position="right"
            formatter={(value) => (typeof value === "number" ? compactBRL(value) : "")}
            style={{ fill: palette.text, fontSize: 11 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
