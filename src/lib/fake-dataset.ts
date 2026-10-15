import { faker } from "@faker-js/faker";
import type { NfeCategory } from "@prisma/client";
import { CATEGORY_CONFIG, CATEGORY_WEIGHTS, PIS_COFINS_RATE, IBS_SHARE, UF_WEIGHTS } from "./nfe-config";

/**
 * Gerador determinístico de notas fiscais fictícias para o demo de ETL/analytics.
 * Mesma fonte usada pelo seed (dataset "Demo") e pelo CSV de exemplo —
 * seed fixa no faker garante que demos sejam reproduzíveis.
 * Dev-only (faker): nunca importar de código do app em produção.
 */

export const FAKER_SEED = 20261015;

// Constantes de domínio movidas para nfe-config.ts (sem deps) —
// reexportadas para manter seed.ts e scripts/generate-csv.ts intactos.
export { CATEGORY_CONFIG, CATEGORY_WEIGHTS, PIS_COFINS_RATE, IBS_SHARE, UF_WEIGHTS };

export type NewInvoice = {
  numero: number;
  serie: number;
  emitenteNome: string;
  emitenteUf: string;
  categoria: NfeCategory;
  cfop: string;
  dataEmissao: Date;
  valorTotal: number;
  valorICMS: number;
  valorPIS: number;
  valorCOFINS: number;
  valorIBS: number;
  valorCBS: number;
  creditoIbsCbs: number;
};

function weightedPick<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = faker.number.float({ min: 0, max: total });
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Gera `count` notas fictícias distribuídas nos últimos `months` meses. */
export function generateInvoices(count: number, months = 12): NewInvoice[] {
  faker.seed(FAKER_SEED);

  const now = new Date();
  const invoices: NewInvoice[] = [];

  for (let index = 0; index < count; index++) {
    const categoria = weightedPick(CATEGORY_WEIGHTS);
    const uf = weightedPick(UF_WEIGHTS);
    const config = CATEGORY_CONFIG[categoria];

    const monthsAgo = faker.number.int({ min: 0, max: months - 1 });
    const dataEmissao = new Date(now.getFullYear(), now.getMonth() - monthsAgo, faker.number.int({ min: 1, max: 28 }));

    // Distribuição log-normal-ish: muitas notas pequenas, poucas grandes.
    const valorTotal = round2(Math.exp(faker.number.float({ min: 3.9, max: 11.2 })));

    const icmsRate = faker.number.float({ min: config.icmsRate[0], max: config.icmsRate[1] });
    const reformaRate = faker.number.float({ min: config.reformaRate[0], max: config.reformaRate[1] });
    const creditShare = faker.number.float({ min: config.creditShare[0], max: config.creditShare[1] });

    const cargaAtual = valorTotal * icmsRate + valorTotal * PIS_COFINS_RATE;
    const cargaReforma = valorTotal * reformaRate;

    const isService = categoria === "SERVICOS";
    const cfop = isService ? (faker.datatype.boolean(0.5) ? "5933" : "6933") : faker.datatype.boolean(0.5) ? "5102" : "6102";

    invoices.push({
      numero: index + 1,
      serie: 1,
      emitenteNome: faker.company.name(),
      emitenteUf: uf,
      categoria,
      cfop,
      dataEmissao,
      valorTotal,
      valorICMS: round2(valorTotal * icmsRate),
      valorPIS: round2(valorTotal * PIS_COFINS_RATE * 0.27), // PIS ~27% dos 9,25%
      valorCOFINS: round2(valorTotal * PIS_COFINS_RATE * 0.73), // COFINS ~73%
      valorIBS: round2(cargaReforma * IBS_SHARE),
      valorCBS: round2(cargaReforma * (1 - IBS_SHARE)),
      creditoIbsCbs: round2(cargaReforma * creditShare),
    });
  }

  return invoices;
}
