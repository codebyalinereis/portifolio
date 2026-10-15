/**
 * Gera public/sample-nfes.csv — CSV de exemplo no formato brasileiro
 * (separador ; decimal vírgula, datas dd/mm/aaaa) para o visitante
 * testar o upload no /dashboard. Mesmo gerador do dataset do seed.
 * Rodar com: npm run csv:generate
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { generateInvoices } from "../src/lib/fake-dataset";

const ROWS = 2000;
const HEADERS = [
  "numero", "serie", "emitente_nome", "emitente_uf", "categoria", "cfop",
  "data_emissao", "valor_total", "valor_icms", "valor_pis", "valor_cofins",
  "valor_ibs", "valor_cbs", "credito_ibs_cbs",
];

function moneyBR(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

function dateBR(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getUTCFullYear()}`;
}

const invoices = generateInvoices(ROWS);

const lines = [HEADERS.join(";")];
for (const invoice of invoices) {
  lines.push(
    [
      invoice.numero,
      invoice.serie,
      `"${invoice.emitenteNome.replace(/"/g, "'")}"`,
      invoice.emitenteUf,
      invoice.categoria,
      invoice.cfop,
      dateBR(invoice.dataEmissao),
      moneyBR(invoice.valorTotal),
      moneyBR(invoice.valorICMS),
      moneyBR(invoice.valorPIS),
      moneyBR(invoice.valorCOFINS),
      moneyBR(invoice.valorIBS),
      moneyBR(invoice.valorCBS),
      moneyBR(invoice.creditoIbsCbs),
    ].join(";")
  );
}

mkdirSync("public", { recursive: true });
writeFileSync("public/sample-nfes.csv", `﻿${lines.join("\r\n")}\r\n`, "utf8");
console.log(`✓ public/sample-nfes.csv gerado (${ROWS} notas).`);
