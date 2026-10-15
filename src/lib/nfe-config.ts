import type { NfeCategory } from "@prisma/client";

/**
 * Parâmetros fiscais e pesos amostrais do demo "regime atual × IBS/CBS".
 * Módulo sem dependências — compartilhado entre o gerador (fake-dataset,
 * dev-only) e o transform do ETL (runtime).
 */

export const UF_WEIGHTS: Record<string, number> = {
  SP: 0.25, MG: 0.1, RJ: 0.09, RS: 0.07, PR: 0.06, SC: 0.05, BA: 0.05,
  GO: 0.05, PE: 0.04, CE: 0.03, DF: 0.03, ES: 0.03, PA: 0.02, MT: 0.02,
  MS: 0.02, MA: 0.015, PB: 0.012, RN: 0.012, AL: 0.01, PI: 0.01, SE: 0.008,
  TO: 0.008, RO: 0.008, AM: 0.01, AC: 0.003, AP: 0.003, RR: 0.003,
};

type CategoryConfig = {
  /** Alíquota total IBS+CBS da reforma (fração do valor da nota). */
  reformaRate: [number, number];
  /** Faixa de ICMS interestadual/interna (fração). */
  icmsRate: [number, number];
  /** Fração média de crédito IBS/CBS aproveitável. */
  creditShare: [number, number];
};

export const CATEGORY_CONFIG: Record<NfeCategory, CategoryConfig> = {
  ALIMENTOS:    { reformaRate: [0.17, 0.21], icmsRate: [0.07, 0.12], creditShare: [0.75, 0.9] },
  COMBUSTIVEIS: { reformaRate: [0.24, 0.28], icmsRate: [0.25, 0.30], creditShare: [0.05, 0.15] },
  ELETRONICOS:  { reformaRate: [0.25, 0.27], icmsRate: [0.17, 0.19], creditShare: [0.8, 0.95] },
  FARMACEUTICO: { reformaRate: [0.2, 0.24],  icmsRate: [0.12, 0.18], creditShare: [0.7, 0.85] },
  METALURGICO:  { reformaRate: [0.22, 0.26], icmsRate: [0.17, 0.19], creditShare: [0.8, 0.95] },
  SERVICOS:     { reformaRate: [0.26, 0.3],  icmsRate: [0.02, 0.05], creditShare: [0.35, 0.5] },
  VESTUARIO:    { reformaRate: [0.25, 0.27], icmsRate: [0.17, 0.19], creditShare: [0.75, 0.9] },
  OUTROS:       { reformaRate: [0.23, 0.26], icmsRate: [0.17, 0.19], creditShare: [0.7, 0.9] },
};

export const CATEGORY_WEIGHTS: Record<NfeCategory, number> = {
  ALIMENTOS: 0.24, COMBUSTIVEIS: 0.12, ELETRONICOS: 0.1, FARMACEUTICO: 0.08,
  METALURGICO: 0.08, SERVICOS: 0.16, VESTUARIO: 0.14, OUTROS: 0.08,
};

/** PIS + COFINS cumulativo — fração fixa aplicada ao valor da nota. */
export const PIS_COFINS_RATE = 0.0925;
/** Split da reforma: IBS ~70%, CBS ~30%. */
export const IBS_SHARE = 0.7;
