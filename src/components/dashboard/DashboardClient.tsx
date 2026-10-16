"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Database, Loader2, RefreshCw } from "lucide-react";
import type { Kpis, TimeseriesPoint, BreakdownRow } from "@/lib/analytics";
import type { DatasetSummary, SampleRow } from "@/types";
import { UploadPanel } from "@/components/dashboard/UploadPanel";
import { KpiRow } from "@/components/charts/KpiRow";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { UfBarChart } from "@/components/charts/UfBarChart";
import { CategoryShareChart } from "@/components/charts/CategoryShareChart";
import { ChartFigure } from "@/components/charts/ChartFigure";
import { EmptyState } from "@/components/ui/primitives";
import { useI18n } from "@/contexts/LocaleProvider";
import { formatBRL } from "@/lib/serializers";
import { buttonClass } from "@/components/ui/primitives";

function compactBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function DashboardClient() {
  const { d, locale } = useI18n();
  const t = d.dashboard;

  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [ufRows, setUfRows] = useState<BreakdownRow[]>([]);
  const [catRows, setCatRows] = useState<BreakdownRow[]>([]);
  const [sample, setSample] = useState<SampleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterUf, setFilterUf] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");

  const loadDatasets = useCallback(
    async (selectNewest = false) => {
      try {
        const response = await fetch("/api/analytics/datasets");
        const body = await response.json();
        const list: DatasetSummary[] = body.data ?? [];
        setDatasets(list);
        if (selectNewest && list[0]) {
          setDatasetId(list[0].id);
        } else if (!datasetId) {
          const firstReady = list.find((item) => item.status === "DONE") ?? list[0];
          if (firstReady) setDatasetId(firstReady.id);
        }
      } catch {
        /* ignora: estado vazio é tratado no render */
      }
    },
    [datasetId]
  );

  useEffect(() => {
    void loadDatasets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!datasetId) return;
    let cancelled = false;
    setLoading(true);

    async function loadAnalytics() {
      const query = `datasetId=${datasetId}`;
      try {
        const [kpisResponse, timeseriesResponse, ufResponse, categoriaResponse, sampleResponse] = await Promise.all([
          fetch(`/api/analytics/kpis?${query}`),
          fetch(`/api/analytics/timeseries?${query}`),
          fetch(`/api/analytics/breakdown?${query}&dimension=uf`),
          fetch(`/api/analytics/breakdown?${query}&dimension=categoria`),
          fetch(`/api/analytics/sample?${query}`),
        ]);
        if (cancelled) return;
        setKpis((await kpisResponse.json()).data ?? null);
        setTimeseries((await timeseriesResponse.json()).data ?? []);
        setUfRows((await ufResponse.json()).data ?? []);
        setCatRows((await categoriaResponse.json()).data ?? []);
        setSample((await sampleResponse.json()).data ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAnalytics();
    return () => {
      cancelled = true;
    };
  }, [datasetId]);

  const ufs = useMemo(() => Array.from(new Set(sample.map((row) => row.clienteUf))).sort(), [sample]);
  const categorias = useMemo(() => Array.from(new Set(sample.map((row) => row.categoria))).sort(), [sample]);
  const filteredSample = useMemo(
    () =>
      sample.filter(
        (row) => (!filterUf || row.clienteUf === filterUf) && (!filterCategoria || row.categoria === filterCategoria)
      ),
    [sample, filterUf, filterCategoria]
  );

  const categoryLabel = useCallback(
    (key: string) => (d.dashboard.categories as Record<string, string>)[key] ?? key,
    [d]
  );

  const monthLabel = useCallback(
    (iso: string) =>
      new Intl.DateTimeFormat(locale === "en" ? "en-US" : "pt-BR", { month: "short", year: "numeric" }).format(
        new Date(`${iso}T12:00:00`)
      ),
    [locale]
  );

  const hasData = kpis !== null && kpis.count > 0;
  const selectedDataset = datasets.find((item) => item.id === datasetId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-2">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← {d.nav.home}
        </Link>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mt-2 max-w-3xl text-muted">{t.subtitle}</p>

      {/* Como funciona */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold">{t.introTitle}</h2>
        <ol className="mt-2 list-inside list-decimal space-y-1.5 text-sm leading-relaxed text-muted marker:text-accent">
          {t.intro.map((paragraph) => (
            <li key={paragraph}>{paragraph}</li>
          ))}
        </ol>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Coluna esquerda: upload + dataset */}
        <div className="space-y-6">
          <UploadPanel onDatasetCreated={() => void loadDatasets(true)} />

          <div className="rounded-lg border border-border bg-surface p-5">
            <label htmlFor="dataset-select" className="flex items-center gap-1.5 text-sm font-semibold">
              <Database className="h-4 w-4 text-accent" aria-hidden="true" /> {t.dataset.label}
            </label>
            {datasets.length === 0 ? (
              <p className="mt-2 text-xs text-muted">{t.dataset.empty}</p>
            ) : (
              <>
                <select
                  id="dataset-select"
                  value={datasetId ?? ""}
                  onChange={(event) => setDatasetId(event.target.value)}
                  className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  {datasets.map((dataset) => (
                    <option key={dataset.id} value={dataset.id}>
                      {dataset.name} · {dataset.rowCount.toLocaleString("pt-BR")} {t.dataset.rowCount}
                      {dataset.status !== "DONE" ? ` · ${t.dataset.status[dataset.status]}` : ""}
                    </option>
                  ))}
                </select>
                {selectedDataset ? (
                  <p className="mt-2 text-xs text-muted">
                    {t.dataset.created}:{" "}
                    {new Date(selectedDataset.createdAt).toLocaleString(locale === "en" ? "en-US" : "pt-BR")}
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>

        {/* Coluna direita: KPIs + charts */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface p-10 text-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {d.common.loading}
            </div>
          ) : !hasData ? (
            <EmptyState>{t.charts.empty}</EmptyState>
          ) : (
            <>
              {kpis ? <KpiRow kpis={kpis} /> : null}

              <ChartFigure
                title={t.charts.trend.title}
                subtitle={t.charts.trend.subtitle}
                ariaLabel={`${t.charts.trend.title}: ${t.charts.trend.legendOnline} × ${t.charts.trend.legendLoja}, R$`}
                detailsLabel={t.charts.detailsLabel}
                table={{
                  headings: [t.table.data, t.charts.trend.legendOnline, t.charts.trend.legendLoja],
                  rows: timeseries.map((point) => [
                    monthLabel(point.mes),
                    compactBRL(point.receita_online),
                    compactBRL(point.receita_loja),
                  ]),
                }}
              >
                <TrendLineChart points={timeseries} />
              </ChartFigure>

              <div className="grid gap-6 xl:grid-cols-2">
                <ChartFigure
                  title={t.charts.uf.title}
                  subtitle={t.charts.uf.subtitle}
                  ariaLabel={`${t.charts.uf.title}, R$ por estado`}
                  detailsLabel={t.charts.detailsLabel}
                  table={{
                    headings: ["UF", t.table.valor, t.charts.category.share],
                    rows: ufRows.map((row) => [
                      row.key,
                      compactBRL(row.total),
                      `${(row.share * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`,
                    ]),
                  }}
                >
                  <UfBarChart rows={ufRows} unitLabel={t.kpis.orders.toLowerCase()} />
                </ChartFigure>

                <ChartFigure
                  title={t.charts.category.title}
                  subtitle={t.charts.category.subtitle}
                  ariaLabel={`${t.charts.category.title}, R$ e participação`}
                  detailsLabel={t.charts.detailsLabel}
                  table={{
                    headings: [t.table.categoria, t.table.valor, t.charts.category.share],
                    rows: catRows.map((row) => [
                      categoryLabel(row.key),
                      compactBRL(row.total),
                      `${(row.share * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`,
                    ]),
                  }}
                >
                  <CategoryShareChart rows={catRows} />
                </ChartFigure>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabela de amostra com filtros */}
      {sample.length > 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">{t.table.title}</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted">{t.filters.label}:</span>
              <select
                aria-label={t.filters.allUfs}
                value={filterUf}
                onChange={(event) => setFilterUf(event.target.value)}
                className="rounded-md border border-border bg-background px-2 py-1"
              >
                <option value="">{t.filters.allUfs}</option>
                {ufs.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
              <select
                aria-label={t.filters.allCategories}
                value={filterCategoria}
                onChange={(event) => setFilterCategoria(event.target.value)}
                className="rounded-md border border-border bg-background px-2 py-1"
              >
                <option value="">{t.filters.allCategories}</option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoryLabel(categoria)}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => void loadDatasets()} className={buttonClass("ghost", "px-2 py-1 text-xs")}>
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="mt-3 max-h-80 overflow-auto rounded-md border border-border">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-surface-2">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">{t.table.numero}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{t.table.data}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{t.table.cliente}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{t.table.uf}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{t.table.categoria}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{t.table.pagamento}</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">{t.table.valor}</th>
                </tr>
              </thead>
              <tbody>
                {filteredSample.map((row) => (
                  <tr key={`${row.numero}-${row.canal}`} className="border-t border-border">
                    <td className="px-3 py-1.5 tabular-nums text-muted">{row.numero}</td>
                    <td className="px-3 py-1.5 text-muted">
                      {new Date(row.dataPedido).toLocaleDateString(locale === "en" ? "en-US" : "pt-BR")}
                    </td>
                    <td className="max-w-48 truncate px-3 py-1.5 text-muted">{row.clienteNome}</td>
                    <td className="px-3 py-1.5 text-muted">{row.clienteUf}</td>
                    <td className="px-3 py-1.5 text-muted">{categoryLabel(row.categoria)}</td>
                    <td className="px-3 py-1.5 text-muted">{row.pagamento}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{formatBRL(row.valorTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
