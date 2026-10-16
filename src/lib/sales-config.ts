import type { ProductCategory, PaymentMethod, SalesChannel } from "@prisma/client";

/**
 * Parâmetros comerciais e pesos amostrais do demo "online × loja física".
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
  /** Ticket médio típico do pedido (R$). */
  avgTicket: [number, number];
  /** Fração média descontada (cupons, promoções). */
  discountShare: [number, number];
  /** Fração média do frete sobre o valor bruto (pedidos online). */
  freightShare: [number, number];
};

export const CATEGORY_CONFIG: Record<ProductCategory, CategoryConfig> = {
  ELETRONICOS:       { avgTicket: [800, 4500], discountShare: [0.05, 0.12], freightShare: [0.01, 0.03] },
  MODA:              { avgTicket: [150, 600],  discountShare: [0.1, 0.25],  freightShare: [0.05, 0.1] },
  CASA_DECOR:        { avgTicket: [120, 900],  discountShare: [0.08, 0.18], freightShare: [0.04, 0.09] },
  LIVROS_MIDIA:      { avgTicket: [40, 220],   discountShare: [0.05, 0.15], freightShare: [0.06, 0.12] },
  BELEZA_SAUDE:      { avgTicket: [60, 400],   discountShare: [0.1, 0.22],  freightShare: [0.05, 0.1] },
  ALIMENTOS_BEBIDAS: { avgTicket: [50, 350],   discountShare: [0.03, 0.1],  freightShare: [0.06, 0.12] },
  ESPORTES_LAZER:    { avgTicket: [100, 1200], discountShare: [0.08, 0.18], freightShare: [0.03, 0.08] },
  OUTROS:            { avgTicket: [70, 500],   discountShare: [0.05, 0.15], freightShare: [0.04, 0.1] },
};

export const CATEGORY_WEIGHTS: Record<ProductCategory, number> = {
  ELETRONICOS: 0.16, MODA: 0.2, CASA_DECOR: 0.12, LIVROS_MIDIA: 0.08,
  BELEZA_SAUDE: 0.12, ALIMENTOS_BEBIDAS: 0.16, ESPORTES_LAZER: 0.08, OUTROS: 0.08,
};

/** Participação de cada canal de venda na amostra. */
export const CHANNEL_WEIGHTS: Record<SalesChannel, number> = {
  ONLINE: 0.68,
  LOJA_FISICA: 0.32,
};

/** Mix de formas de pagamento por canal (frações que somam 1). */
export const PAYMENT_WEIGHTS: Record<SalesChannel, Record<PaymentMethod, number>> = {
  ONLINE:      { PIX: 0.38, CARTAO_CREDITO: 0.42, CARTAO_DEBITO: 0.12, BOLETO: 0.08, DINHEIRO: 0 },
  LOJA_FISICA: { PIX: 0.3, CARTAO_CREDITO: 0.28, CARTAO_DEBITO: 0.22, BOLETO: 0, DINHEIRO: 0.2 },
};
