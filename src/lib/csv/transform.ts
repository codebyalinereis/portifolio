import { z } from "zod";
import type { PaymentMethod, ProductCategory, SalesChannel } from "@prisma/client";
import { CATEGORY_CONFIG } from "@/lib/sales-config";
import { UF_LIST } from "@/lib/validation";

/**
 * Transform do ETL: normaliza cabeçalhos e valores no formato brasileiro,
 * valida cada linha com Zod e deriva campos ausentes.
 */

const CATEGORY_MAP: Record<string, ProductCategory> = {
  eletronicos: "ELETRONICOS",
  eletronico: "ELETRONICOS",
  moda: "MODA",
  vestuario: "MODA",
  casa_decor: "CASA_DECOR",
  casa: "CASA_DECOR",
  livros_midia: "LIVROS_MIDIA",
  livros: "LIVROS_MIDIA",
  beleza_saude: "BELEZA_SAUDE",
  beleza: "BELEZA_SAUDE",
  alimentos_bebidas: "ALIMENTOS_BEBIDAS",
  alimentos: "ALIMENTOS_BEBIDAS",
  esportes_lazer: "ESPORTES_LAZER",
  esportes: "ESPORTES_LAZER",
  outros: "OUTROS",
};

const CANAL_MAP: Record<string, SalesChannel> = {
  online: "ONLINE",
  loja_online: "ONLINE",
  e_commerce: "ONLINE",
  ecommerce: "ONLINE",
  loja_fisica: "LOJA_FISICA",
  fisica: "LOJA_FISICA",
  loja: "LOJA_FISICA",
};

const PAGAMENTO_MAP: Record<string, PaymentMethod> = {
  pix: "PIX",
  cartao_de_credito: "CARTAO_CREDITO",
  cartao_credito: "CARTAO_CREDITO",
  credito: "CARTAO_CREDITO",
  cartao_de_debito: "CARTAO_DEBITO",
  cartao_debito: "CARTAO_DEBITO",
  debito: "CARTAO_DEBITO",
  boleto: "BOLETO",
  dinheiro: "DINHEIRO",
};

/** Alias aceitos → chave canônica. */
const HEADER_ALIASES: Record<string, string> = {
  numero: "numero",
  pedido: "numero",
  numero_pedido: "numero",
  numeropedido: "numero",
  order: "numero",
  canal: "canal",
  channel: "canal",
  cliente: "clienteNome",
  cliente_nome: "clienteNome",
  clientenome: "clienteNome",
  nome_cliente: "clienteNome",
  consumidor: "clienteNome",
  uf: "clienteUf",
  cliente_uf: "clienteUf",
  clienteuf: "clienteUf",
  estado: "clienteUf",
  categoria: "categoria",
  pagamento: "pagamento",
  metodo_pagamento: "pagamento",
  payment: "pagamento",
  data: "dataPedido",
  data_pedido: "dataPedido",
  datapedido: "dataPedido",
  valor_bruto: "valorBruto",
  valorbruto: "valorBruto",
  bruto: "valorBruto",
  valor_desconto: "valorDesconto",
  valordesconto: "valorDesconto",
  desconto: "valorDesconto",
  valor_frete: "valorFrete",
  valorfrete: "valorFrete",
  frete: "valorFrete",
  valor_total: "valorTotal",
  valortotal: "valorTotal",
  valor: "valorTotal",
  total: "valorTotal",
};

function normalizeHeader(header: string): string {
  const normalized = header
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase()
    .replace(/[\s.]+/g, "_")
    .replace(/_+/g, "_");
  return HEADER_ALIASES[normalized] ?? normalized;
}

/** "1.234.567,89" | "1234,56" | "1234.56" → number */
export function parseMoneyBR(raw: string | undefined): number | undefined {
  if (raw === undefined || raw === null || raw.trim() === "") return undefined;
  let text = raw.trim().replace(/[R$\s]/g, "");
  const hasComma = text.includes(",");
  const hasDot = text.includes(".");
  if (hasComma && hasDot) {
    text = text.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    text = text.replace(",", ".");
  } else if (hasDot) {
    // "1.234" milhar vs "1234.56" decimal: assume decimal quando há 1-2 casas
    const parts = text.split(".");
    if (parts.length > 2 || parts[parts.length - 1].length === 3) text = text.replace(/\./g, "");
  }
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
}

/** "dd/mm/aaaa" (ou ISO "aaaa-mm-dd") → Date */
export function parseDateBR(raw: string | undefined): Date | undefined {
  if (!raw) return undefined;
  const text = raw.trim();
  const br = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) {
    const date = new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  const iso = new Date(text);
  return Number.isNaN(iso.getTime()) ? undefined : iso;
}

function slugify(raw: string | undefined): string {
  return (
    raw
      ?.normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_") ?? ""
  );
}

const orderRowSchema = z.object({
  numero: z.coerce.number().int().min(1),
  canal: z.enum(["ONLINE", "LOJA_FISICA"]),
  clienteNome: z.string().min(2).max(160),
  clienteUf: z.string().refine((uf) => (UF_LIST as readonly string[]).includes(uf), "UF inválida"),
  categoria: z.enum([
    "ELETRONICOS", "MODA", "CASA_DECOR", "LIVROS_MIDIA",
    "BELEZA_SAUDE", "ALIMENTOS_BEBIDAS", "ESPORTES_LAZER", "OUTROS",
  ]),
  pagamento: z.enum(["PIX", "CARTAO_CREDITO", "CARTAO_DEBITO", "BOLETO", "DINHEIRO"]),
  dataPedido: z.coerce.date(),
  valorBruto: z.number().positive().max(1e12),
  // Opcionais: ausentes no CSV → derivados abaixo (parâmetros por categoria).
  valorDesconto: z.number().min(0).max(1e12).optional(),
  valorFrete: z.number().min(0).max(1e12).optional(),
  valorTotal: z.number().min(0).max(1e12).optional(),
});

export type OrderRow = {
  numero: number;
  canal: SalesChannel;
  clienteNome: string;
  clienteUf: string;
  categoria: ProductCategory;
  pagamento: PaymentMethod;
  dataPedido: Date;
  valorBruto: number;
  valorDesconto: number;
  valorFrete: number;
  valorTotal: number;
};

export type TransformResult =
  | { ok: true; row: OrderRow }
  | { ok: false; line: number; error: string };

/** Normaliza e valida uma linha crua do CSV. */
export function transformRow(rawRow: Record<string, string>, line: number): TransformResult {
  const row: Record<string, string> = {};
  for (const [header, value] of Object.entries(rawRow)) {
    row[normalizeHeader(header)] = value;
  }

  // Defaults explícitos: coluna ausente ou valor não mapeado não derruba a linha.
  const categoria = CATEGORY_MAP[slugify(row.categoria)] ?? "OUTROS";
  const canal = CANAL_MAP[slugify(row.canal)] ?? "ONLINE";
  const pagamento = PAGAMENTO_MAP[slugify(row.pagamento)] ?? "PIX";

  const parsed = orderRowSchema.safeParse({
    numero: row.numero,
    canal,
    clienteNome: row.clienteNome,
    clienteUf: row.clienteUf?.toUpperCase(),
    categoria,
    pagamento,
    dataPedido: parseDateBR(row.dataPedido),
    // CSV mínimo sem coluna de bruto: aproxima pelo total.
    valorBruto: parseMoneyBR(row.valorBruto) ?? parseMoneyBR(row.valorTotal),
    valorDesconto: parseMoneyBR(row.valorDesconto),
    valorFrete: parseMoneyBR(row.valorFrete),
    valorTotal: parseMoneyBR(row.valorTotal),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue.path.join(".");
    return { ok: false, line, error: `${field}: ${issue.message}` };
  }

  const base = parsed.data;

  // Derivações quando o CSV não traz desconto/frete/total:
  // parâmetros médios por categoria (mesma lógica do gerador do dataset demo).
  const [descontoMin, descontoMax] = CATEGORY_CONFIG[base.categoria].discountShare;
  const valorDesconto = base.valorDesconto ?? round2(base.valorBruto * ((descontoMin + descontoMax) / 2));

  const [freteMin, freteMax] = CATEGORY_CONFIG[base.categoria].freightShare;
  const valorFrete =
    base.valorFrete ?? (base.canal === "ONLINE" ? round2(base.valorBruto * ((freteMin + freteMax) / 2)) : 0);

  const valorTotal = base.valorTotal ?? round2(base.valorBruto - valorDesconto + valorFrete);

  return { ok: true, row: { ...base, valorDesconto, valorFrete, valorTotal } };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export { normalizeHeader };
