import { z } from "zod";
import type { NfeCategory } from "@prisma/client";
import { CATEGORY_CONFIG, PIS_COFINS_RATE } from "@/lib/nfe-config";
import { UF_LIST } from "@/lib/validation";

/**
 * Transform do ETL: normaliza cabeçalhos e valores no formato brasileiro,
 * valida cada linha com Zod e deriva campos ausentes.
 */

const CATEGORY_MAP: Record<string, NfeCategory> = {
  alimentos: "ALIMENTOS",
  combustiveis: "COMBUSTIVEIS",
  combustivel: "COMBUSTIVEIS",
  eletronicos: "ELETRONICOS",
  eletronico: "ELETRONICOS",
  farmaceutico: "FARMACEUTICO",
  metalurgico: "METALURGICO",
  servicos: "SERVICOS",
  servico: "SERVICOS",
  vestuario: "VESTUARIO",
  outros: "OUTROS",
};

/** Alias aceitos → chave canônica. */
const HEADER_ALIASES: Record<string, string> = {
  numero: "numero",
  nfe: "numero",
  "numero nfe": "numero",
  serie: "serie",
  emitente: "emitenteNome",
  emitente_nome: "emitenteNome",
  emitentenome: "emitenteNome",
  nome_emitente: "emitenteNome",
  razao_social: "emitenteNome",
  uf: "emitenteUf",
  emitente_uf: "emitenteUf",
  emitenteuf: "emitenteUf",
  estado: "emitenteUf",
  categoria: "categoria",
  cfop: "cfop",
  data: "dataEmissao",
  data_emissao: "dataEmissao",
  dataemissao: "dataEmissao",
  emissao: "dataEmissao",
  valor_total: "valorTotal",
  valortotal: "valorTotal",
  valor: "valorTotal",
  valor_icms: "valorICMS",
  valoricms: "valorICMS",
  icms: "valorICMS",
  valor_pis: "valorPIS",
  valorpis: "valorPIS",
  pis: "valorPIS",
  valor_cofins: "valorCOFINS",
  valorcofins: "valorCOFINS",
  cofins: "valorCOFINS",
  valor_ibs: "valorIBS",
  valoribs: "valorIBS",
  ibs: "valorIBS",
  valor_cbs: "valorCBS",
  valorcbs: "valorCBS",
  cbs: "valorCBS",
  credito_ibs_cbs: "creditoIbsCbs",
  creditoibscbs: "creditoIbsCbs",
  credito: "creditoIbsCbs",
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

const invoiceRowSchema = z.object({
  numero: z.coerce.number().int().min(1),
  serie: z.coerce.number().int().min(1).default(1),
  emitenteNome: z.string().min(2).max(160),
  emitenteUf: z.string().refine((uf) => (UF_LIST as readonly string[]).includes(uf), "UF inválida"),
  categoria: z.enum([
    "ALIMENTOS", "COMBUSTIVEIS", "ELETRONICOS", "FARMACEUTICO",
    "METALURGICO", "SERVICOS", "VESTUARIO", "OUTROS",
  ]),
  cfop: z.string().regex(/^\d{4}$/, "CFOP deve ter 4 dígitos"),
  dataEmissao: z.coerce.date(),
  valorTotal: z.number().positive().max(1e12),
  valorICMS: z.number().min(0).max(1e12).default(0),
  valorPIS: z.number().min(0).max(1e12).default(0),
  valorCOFINS: z.number().min(0).max(1e12).default(0),
  valorIBS: z.number().min(0).max(1e12).default(0),
  valorCBS: z.number().min(0).max(1e12).default(0),
  creditoIbsCbs: z.number().min(0).max(1e12).default(0),
});

export type InvoiceRow = z.infer<typeof invoiceRowSchema>;

export type TransformResult =
  | { ok: true; row: InvoiceRow }
  | { ok: false; line: number; error: string };

/** Normaliza e valida uma linha crua do CSV. */
export function transformRow(rawRow: Record<string, string>, line: number): TransformResult {
  const row: Record<string, string> = {};
  for (const [header, value] of Object.entries(rawRow)) {
    row[normalizeHeader(header)] = value;
  }

  const categoriaRaw = row.categoria?.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  const categoria = CATEGORY_MAP[categoriaRaw ?? ""] ?? "OUTROS";

  const parsed = invoiceRowSchema.safeParse({
    numero: row.numero,
    serie: row.serie ?? "1",
    emitenteNome: row.emitenteNome,
    emitenteUf: row.emitenteUf?.toUpperCase(),
    categoria,
    cfop: row.cfop,
    dataEmissao: parseDateBR(row.dataEmissao),
    valorTotal: parseMoneyBR(row.valorTotal),
    valorICMS: parseMoneyBR(row.valorICMS) ?? 0,
    valorPIS: parseMoneyBR(row.valorPIS) ?? 0,
    valorCOFINS: parseMoneyBR(row.valorCOFINS) ?? 0,
    valorIBS: parseMoneyBR(row.valorIBS) ?? 0,
    valorCBS: parseMoneyBR(row.valorCBS) ?? 0,
    creditoIbsCbs: parseMoneyBR(row.creditoIbsCbs) ?? 0,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue.path.join(".");
    return { ok: false, line, error: `${field}: ${issue.message}` };
  }

  let invoice = parsed.data;

  // Derivações quando o CSV não traz a carga da reforma nem créditos:
  // alíquotas médias por categoria (mesma lógica do gerador do dataset demo).
  const reformaMissing = invoice.valorIBS === 0 && invoice.valorCBS === 0;
  if (reformaMissing) {
    const [min, max] = CATEGORY_CONFIG[invoice.categoria].reformaRate;
    const rate = (min + max) / 2;
    invoice = {
      ...invoice,
      valorIBS: Math.round(invoice.valorTotal * rate * 0.7 * 100) / 100,
      valorCBS: Math.round(invoice.valorTotal * rate * 0.3 * 100) / 100,
    };
  }
  if (invoice.creditoIbsCbs === 0 && reformaMissing) {
    const [min, max] = CATEGORY_CONFIG[invoice.categoria].creditShare;
    const share = (min + max) / 2;
    invoice = {
      ...invoice,
      creditoIbsCbs: Math.round((invoice.valorIBS + invoice.valorCBS) * share * 100) / 100,
    };
  }
  // PIS/COFINS ausentes → aplica 9,25% (regime cumulativo)
  if (invoice.valorPIS === 0 && invoice.valorCOFINS === 0 && invoice.valorICMS > 0) {
    const total = invoice.valorTotal * PIS_COFINS_RATE;
    invoice = { ...invoice, valorPIS: Math.round(total * 0.27 * 100) / 100, valorCOFINS: Math.round(total * 0.73 * 100) / 100 };
  }

  return { ok: true, row: invoice };
}

export { normalizeHeader };
