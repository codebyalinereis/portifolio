/**
 * Fonte única dos metadados da API — usada pela página /docs.
 * Descrições bilíngues (pt/en) renderizadas conforme o locale ativo.
 */

export type EndpointDoc = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  summary: { pt: string; en: string };
  params?: { name: string; example: string; note?: { pt: string; en: string } }[];
  response: string;
};

export const API_ENDPOINTS: EndpointDoc[] = [
  {
    method: "GET",
    path: "/api/projects",
    summary: {
      pt: "Projetos do portfólio, com tecnologias vinculadas.",
      en: "Portfolio projects, with linked technologies.",
    },
    params: [{ name: "featured", example: "true", note: { pt: "apenas destaques", en: "featured only" } }],
    response: `{
  "data": [
    {
      "slug": "automacao-guias-st",
      "title": "Automação de guias de Substituição Tributária",
      "featured": true,
      "technologies": [{ "name": "Node.js", "category": "BACKEND" }]
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/skills",
    summary: { pt: "Tecnologias agrupadas por categoria.", en: "Technologies grouped by category." },
    response: `{
  "data": [{ "name": "PostgreSQL", "category": "DATA", "level": 5 }]
}`,
  },
  {
    method: "GET",
    path: "/api/experiences",
    summary: { pt: "Experiências profissionais.", en: "Professional experience." },
    response: `{
  "data": [{ "role": "Data Developer", "company": "Ctributária", "current": true }]
}`,
  },
  {
    method: "POST",
    path: "/api/contact",
    summary: { pt: "Envia uma mensagem de contato (grava no banco).", en: "Sends a contact message (stored in the database)." },
    params: [
      { name: "body", example: `{ "name": "...", "email": "...", "message": "..." }`, note: { pt: "JSON; campo company é honeypot", en: "JSON; company field is a honeypot" } },
    ],
    response: `{ "ok": true }`,
  },
  {
    method: "GET",
    path: "/api/analytics/datasets",
    summary: {
      pt: "Datasets disponíveis (seed + uploads). Use o id nas demais queries.",
      en: "Available datasets (seed + uploads). Use the id in the other queries.",
    },
    response: `{
  "data": [{ "id": "cm2f...", "name": "Demo — Pedidos 12 meses", "status": "DONE", "rowCount": 12000 }]
}`,
  },
  {
    method: "GET",
    path: "/api/analytics/kpis",
    summary: {
      pt: "KPIs agregados: contagem, receita, ticket médio e comparação de canais (online × loja física).",
      en: "Aggregated KPIs: count, revenue, average ticket and channel comparison (online × in-store).",
    },
    params: [{ name: "datasetId", example: "cm2f...", note: { pt: "obrigatório", en: "required" } }],
    response: `{
  "data": {
    "count": 12000,
    "totalValue": 9143205.87,
    "avgValue": 761.93,
    "receitaOnline": 6472871.02,
    "receitaLoja": 2670334.85,
    "deltaPct": 142.4,
    "descontos": 1028410.36
  }
}`,
  },
  {
    method: "GET",
    path: "/api/analytics/timeseries",
    summary: {
      pt: "Série mensal (date_trunc) de receita total e por canal (SUM … FILTER).",
      en: "Monthly series (date_trunc) of total revenue and by channel (SUM … FILTER).",
    },
    params: [
      { name: "datasetId", example: "cm2f...", note: { pt: "obrigatório", en: "required" } },
      { name: "metric", example: "receita_online", note: { pt: "total | receita_online | receita_loja", en: "total | receita_online | receita_loja" } },
    ],
    response: `{
  "data": [
    { "mes": "2025-11-01", "total": 762044.28, "receita_online": 529018.75, "receita_loja": 233025.53 }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/analytics/breakdown",
    summary: {
      pt: "Quebra por dimensão (UF ou categoria) com participação no total — top 12.",
      en: "Breakdown by dimension (state or category) with share of total — top 12.",
    },
    params: [
      { name: "datasetId", example: "cm2f...", note: { pt: "obrigatório", en: "required" } },
      { name: "dimension", example: "uf", note: { pt: "uf | categoria", en: "uf | categoria" } },
    ],
    response: `{
  "data": [
    { "key": "SP", "count": 3011, "total": 2312844.10, "online": 1625010.44, "share": 0.253 }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/analytics/sample",
    summary: { pt: "Amostra dos 50 pedidos mais recentes do dataset.", en: "Sample of the 50 most recent orders in the dataset." },
    params: [{ name: "datasetId", example: "cm2f...", note: { pt: "obrigatório", en: "required" } }],
    response: `{
  "data": [{ "numero": 8231, "canal": "ONLINE", "clienteUf": "MG", "categoria": "ELETRONICOS", "pagamento": "PIX", "valorTotal": 4520.90 }]
}`,
  },
  {
    method: "POST",
    path: "/api/etl/upload",
    summary: {
      pt: "Envia um CSV (multipart/form-data, campo file, ≤ 5 MB) e dispara o ETL em background. Responde 202 com o datasetId.",
      en: "Uploads a CSV (multipart/form-data, file field, ≤ 5 MB) and triggers the ETL in the background. Responds 202 with the datasetId.",
    },
    params: [
      { name: "file", example: "pedidos.csv", note: { pt: ".csv; separador ; ou , e valores 1.234,56", en: ".csv; ; or , separator and 1,234.56-style values" } },
    ],
    response: `{ "datasetId": "cm2f...", "status": "PROCESSING" }`,
  },
  {
    method: "GET",
    path: "/api/etl/datasets/{id}",
    summary: {
      pt: "Status do job de ETL (rowCount, errorCount, durationMs) — usado no polling do dashboard.",
      en: "ETL job status (rowCount, errorCount, durationMs) — used by the dashboard polling.",
    },
    response: `{
  "data": { "status": "DONE", "rowCount": 2000, "errorCount": 3, "durationMs": 1180 }
}`,
  },
];
