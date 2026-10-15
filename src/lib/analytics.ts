import { prisma } from "@/lib/prisma";
import type { NfeCategory } from "@prisma/client";

/**
 * Queries analíticas do demo — agregações no PostgreSQL e derivadas no servidor.
 * Sempre filtram por datasetId (validado com Zod nas rotas).
 */

const toNumber = (value: unknown): number => (value === null || value === undefined ? 0 : Number(value));

export type Kpis = {
  count: number;
  totalValue: number;
  avgValue: number;
  cargaAtual: number;
  cargaReforma: number;
  deltaPct: number;
  credits: number;
};

export async function getKpis(datasetId: string): Promise<Kpis> {
  const aggregate = await prisma.nfeInvoice.aggregate({
    where: { datasetId },
    _count: { _all: true },
    _sum: {
      valorTotal: true,
      valorICMS: true,
      valorPIS: true,
      valorCOFINS: true,
      valorIBS: true,
      valorCBS: true,
      creditoIbsCbs: true,
    },
    _avg: { valorTotal: true },
  });

  const totalValue = toNumber(aggregate._sum.valorTotal);
  const cargaAtual =
    toNumber(aggregate._sum.valorICMS) + toNumber(aggregate._sum.valorPIS) + toNumber(aggregate._sum.valorCOFINS);
  const cargaReforma = toNumber(aggregate._sum.valorIBS) + toNumber(aggregate._sum.valorCBS);

  return {
    count: aggregate._count._all,
    totalValue,
    avgValue: toNumber(aggregate._avg.valorTotal),
    cargaAtual,
    cargaReforma,
    deltaPct: cargaAtual > 0 ? (cargaReforma / cargaAtual - 1) * 100 : 0,
    credits: toNumber(aggregate._sum.creditoIbsCbs),
  };
}

export type TimeseriesPoint = {
  mes: string; // ISO yyyy-mm-dd (primeiro dia do mês)
  total: number;
  carga_atual: number;
  carga_reforma: number;
};

export async function getTimeseries(datasetId: string): Promise<TimeseriesPoint[]> {
  // date_trunc não existe no groupBy do Prisma — SQL puro.
  const rows = await prisma.$queryRaw<
    { mes: Date; total: unknown; carga_atual: unknown; carga_reforma: unknown }[]
  >`
    SELECT date_trunc('month', "dataEmissao")::date AS mes,
           SUM("valorTotal")                       AS total,
           SUM("valorICMS" + "valorPIS" + "valorCOFINS") AS carga_atual,
           SUM("valorIBS" + "valorCBS")            AS carga_reforma
    FROM "NfeInvoice"
    WHERE "datasetId" = ${datasetId}
    GROUP BY 1
    ORDER BY 1`;

  return rows.map((row) => ({
    mes: new Date(row.mes).toISOString().slice(0, 10),
    total: toNumber(row.total),
    carga_atual: toNumber(row.carga_atual),
    carga_reforma: toNumber(row.carga_reforma),
  }));
}

export type BreakdownRow = {
  key: string;
  count: number;
  total: number;
  reforma: number;
  share: number; // participação no valor total (0–1)
};

export async function getBreakdown(datasetId: string, dimension: "uf" | "categoria"): Promise<BreakdownRow[]> {
  const groups = await prisma.nfeInvoice.groupBy({
    by: [dimension === "uf" ? "emitenteUf" : "categoria"],
    where: { datasetId },
    _sum: { valorTotal: true, valorIBS: true, valorCBS: true },
    _count: true,
    orderBy: { _sum: { valorTotal: "desc" } },
    take: 12,
  });

  const totalAll = groups.reduce((sum, group) => sum + toNumber(group._sum.valorTotal), 0);

  return groups.map((group) => {
    const key = dimension === "uf" ? group.emitenteUf : (group.categoria as NfeCategory);
    const total = toNumber(group._sum.valorTotal);
    return {
      key,
      count: group._count,
      total,
      reforma: toNumber(group._sum.valorIBS) + toNumber(group._sum.valorCBS),
      share: totalAll > 0 ? total / totalAll : 0,
    };
  });
}

export async function getInvoiceSample(datasetId: string, take = 50) {
  return prisma.nfeInvoice.findMany({
    where: { datasetId },
    orderBy: { dataEmissao: "desc" },
    take,
    select: {
      numero: true,
      dataEmissao: true,
      emitenteNome: true,
      emitenteUf: true,
      categoria: true,
      valorTotal: true,
      cfop: true,
    },
  });
}
