import { Prisma } from "@prisma/client";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type Serializable = string | number | boolean | null | Date | bigint | Prisma.Decimal | undefined | Serializable[] | { [key: string]: Serializable };

/**
 * Converte objetos do Prisma em JSON seguro:
 * - Decimal  → Number (valores ≤ 14 dígitos, perda insignificante)
 * - DateTime → string ISO
 * Nunca deixar Prisma.Decimal vazar no JSON.stringify (estoura).
 */
export function serialize<T extends Serializable>(value: T): Json {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Prisma.Decimal || typeof value === "bigint") return Number(value);
  if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map((item) => serialize(item));
  if (typeof value === "object") {
    const out: { [key: string]: Json } = {};
    for (const [key, val] of Object.entries(value as { [key: string]: Serializable })) {
      out[key] = serialize(val);
    }
    return out;
  }
  return null;
}

/** Formata moeda BRL a partir de número. */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

/** Formata número com separadores pt-BR. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}
