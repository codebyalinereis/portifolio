/**
 * Gera public/sample-orders.csv — CSV de exemplo no formato brasileiro
 * (separador ; decimal vírgula, datas dd/mm/aaaa) para o visitante
 * testar o upload no /dashboard. Mesmo gerador do dataset do seed.
 * Rodar com: npm run csv:generate
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { generateOrders } from "../src/lib/fake-dataset";

const ROWS = 2000;
const HEADERS = [
  "numero", "canal", "cliente_nome", "cliente_uf", "categoria", "pagamento",
  "data_pedido", "valor_bruto", "valor_desconto", "valor_frete", "valor_total",
];

function moneyBR(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

function dateBR(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getUTCFullYear()}`;
}

const orders = generateOrders(ROWS);

const lines = [HEADERS.join(";")];
for (const order of orders) {
  lines.push(
    [
      order.numero,
      order.canal,
      `"${order.clienteNome.replace(/"/g, "'")}"`,
      order.clienteUf,
      order.categoria,
      order.pagamento,
      dateBR(order.dataPedido),
      moneyBR(order.valorBruto),
      moneyBR(order.valorDesconto),
      moneyBR(order.valorFrete),
      moneyBR(order.valorTotal),
    ].join(";")
  );
}

mkdirSync("public", { recursive: true });
writeFileSync("public/sample-orders.csv", `﻿${lines.join("\r\n")}\r\n`, "utf8");
console.log(`✓ public/sample-orders.csv gerado (${ROWS} pedidos).`);
