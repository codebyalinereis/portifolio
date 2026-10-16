import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProductCategory } from "@prisma/client";

/**
 * Queries analíticas do demo — agregações no PostgreSQL e derivadas no servidor.
 * Sempre filtram por datasetId (validado com Zod nas rotas).
 */

const toNumber = (value: unknown): number => (value === null || value === undefined ? 0 : Number(value));

export type Kpis = {
  count: number;
  totalValue: number;
  avgValue: number;
  receitaOnline: number;
  receitaLoja: number;
  deltaPct: number;
  descontos: number;
};

export async function getKpis(datasetId: string): Promise<Kpis> {
  const aggregate = await prisma.salesOrder.aggregate({
    where: { datasetId },
    _count: { _all: true },
    _sum: {
      valorTotal: true,
      valorDesconto: true,
    },
    _avg: { valorTotal: true },
  });

  // Receita por canal: agregações filtradas em paralelo.
  const [online, loja] = await Promise.all([
    prisma.salesOrder.aggregate({ where: { datasetId, canal: "ONLINE" }, _sum: { valorTotal: true } }),
    prisma.salesOrder.aggregate({ where: { datasetId, canal: "LOJA_FISICA" }, _sum: { valorTotal: true } }),
  ]);

  const receitaOnline = toNumber(online._sum.valorTotal);
  const receitaLoja = toNumber(loja._sum.valorTotal);

  return {
    count: aggregate._count._all,
    totalValue: toNumber(aggregate._sum.valorTotal),
    avgValue: toNumber(aggregate._avg.valorTotal),
    receitaOnline,
    receitaLoja,
    deltaPct: receitaLoja > 0 ? (receitaOnline / receitaLoja - 1) * 100 : 0,
    descontos: toNumber(aggregate._sum.valorDesconto),
  };
}

export type TimeseriesPoint = {
  mes: string; // ISO yyyy-mm-dd (primeiro dia do mês)
  total: number;
  receita_online: number;
  receita_loja: number;
};

export async function getTimeseries(datasetId: string): Promise<TimeseriesPoint[]> {
  // date_trunc/FILTER não existem no groupBy do Prisma — SQL puro.
  const rows = await prisma.$queryRaw<
    { mes: Date; total: unknown; receita_online: unknown; receita_loja: unknown }[]
  >`
    SELECT date_trunc('month', "dataPedido")::date        AS mes,
           SUM("valorTotal")                               AS total,
           SUM("valorTotal") FILTER (WHERE "canal" = 'ONLINE')      AS receita_online,
           SUM("valorTotal") FILTER (WHERE "canal" = 'LOJA_FISICA') AS receita_loja
    FROM "SalesOrder"
    WHERE "datasetId" = ${datasetId}
    GROUP BY 1
    ORDER BY 1`;

  return rows.map((row) => ({
    mes: new Date(row.mes).toISOString().slice(0, 10),
    total: toNumber(row.total),
    receita_online: toNumber(row.receita_online),
    receita_loja: toNumber(row.receita_loja),
  }));
}

export type BreakdownRow = {
  key: string;
  count: number;
  total: number;
  online: number;
  share: number; // participação no valor total (0–1)
};

export async function getBreakdown(datasetId: string, dimension: "uf" | "categoria"): Promise<BreakdownRow[]> {
  // groupBy em 2 níveis (dimensão × canal) quebraria o take: 12 — limitaria
  // pares, não grupos. SQL puro com FILTER mantém o top 12 da dimensão.
  // Coluna via whitelist: dimension vem de enum Zod na rota.
  const dimensionColumn = Prisma.raw(dimension === "uf" ? '"clienteUf"' : '"categoria"');
  const rows = await prisma.$queryRaw<
    { key: string | ProductCategory; count: bigint; total: unknown; online: unknown }[]
  >`
    SELECT ${dimensionColumn}                          AS key,
           COUNT(*)                                     AS count,
           SUM("valorTotal")                            AS total,
           SUM("valorTotal") FILTER (WHERE "canal" = 'ONLINE') AS online
    FROM "SalesOrder"
    WHERE "datasetId" = ${datasetId}
    GROUP BY 1
    ORDER BY total DESC
    LIMIT 12`;

  const totalAll = rows.reduce((sum, row) => sum + toNumber(row.total), 0);

  return rows.map((row) => {
    const total = toNumber(row.total);
    return {
      key: String(row.key),
      count: toNumber(row.count),
      total,
      online: toNumber(row.online),
      share: totalAll > 0 ? total / totalAll : 0,
    };
  });
}

export async function getOrderSample(datasetId: string, take = 50) {
  return prisma.salesOrder.findMany({
    where: { datasetId },
    orderBy: { dataPedido: "desc" },
    take,
    select: {
      numero: true,
      dataPedido: true,
      clienteNome: true,
      clienteUf: true,
      categoria: true,
      pagamento: true,
      canal: true,
      valorTotal: true,
    },
  });
}
