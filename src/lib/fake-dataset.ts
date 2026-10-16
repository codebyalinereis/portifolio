import { faker } from "@faker-js/faker";
import type { ProductCategory } from "@prisma/client";
import { CATEGORY_CONFIG, CATEGORY_WEIGHTS, CHANNEL_WEIGHTS, PAYMENT_WEIGHTS, UF_WEIGHTS } from "./sales-config";

/**
 * Gerador determinístico de pedidos de e-commerce fictícios para o demo de
 * ETL/analytics. Mesma fonte usada pelo seed (dataset "Demo") e pelo CSV de
 * exemplo — seed fixa no faker garante que demos sejam reproduzíveis.
 * Dev-only (faker): nunca importar de código do app em produção.
 */

export const FAKER_SEED = 20261016;

// Constantes de domínio movidas para sales-config.ts (sem deps) —
// reexportadas para manter seed.ts e scripts/generate-csv.ts intactos.
export { CATEGORY_CONFIG, CATEGORY_WEIGHTS, CHANNEL_WEIGHTS, PAYMENT_WEIGHTS, UF_WEIGHTS };

export type NewOrder = {
  numero: number;
  canal: "ONLINE" | "LOJA_FISICA";
  clienteNome: string;
  clienteUf: string;
  categoria: ProductCategory;
  pagamento: "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "BOLETO" | "DINHEIRO";
  dataPedido: Date;
  valorBruto: number;
  valorDesconto: number;
  valorFrete: number;
  valorTotal: number;
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

/** Gera `count` pedidos fictícios distribuídos nos últimos `months` meses. */
export function generateOrders(count: number, months = 12): NewOrder[] {
  faker.seed(FAKER_SEED);

  const now = new Date();
  const orders: NewOrder[] = [];

  for (let index = 0; index < count; index++) {
    const categoria = weightedPick(CATEGORY_WEIGHTS);
    const uf = weightedPick(UF_WEIGHTS);
    const canal = weightedPick(CHANNEL_WEIGHTS);
    const pagamento = weightedPick(PAYMENT_WEIGHTS[canal]);
    const config = CATEGORY_CONFIG[categoria];

    const monthsAgo = faker.number.int({ min: 0, max: months - 1 });
    const dataPedido = new Date(now.getFullYear(), now.getMonth() - monthsAgo, faker.number.int({ min: 1, max: 28 }));

    // Log-uniform dentro da faixa de ticket da categoria: muitos pedidos
    // pequenos, poucos grandes.
    const valorBruto = round2(
      Math.exp(faker.number.float({ min: Math.log(config.avgTicket[0]), max: Math.log(config.avgTicket[1]) })),
    );

    // ~2/3 dos pedidos usam cupom/promoção.
    const hasDiscount = faker.datatype.boolean(0.65);
    const discountShare = faker.number.float({ min: config.discountShare[0], max: config.discountShare[1] });
    const valorDesconto = hasDiscount ? round2(valorBruto * discountShare) : 0;

    // Frete só existe no canal online.
    const freightShare = faker.number.float({ min: config.freightShare[0], max: config.freightShare[1] });
    const valorFrete = canal === "ONLINE" ? round2(valorBruto * freightShare) : 0;

    orders.push({
      numero: index + 1,
      canal,
      clienteNome: faker.person.fullName(),
      clienteUf: uf,
      categoria,
      pagamento,
      dataPedido,
      valorBruto,
      valorDesconto,
      valorFrete,
      valorTotal: round2(valorBruto - valorDesconto + valorFrete),
    });
  }

  return orders;
}
