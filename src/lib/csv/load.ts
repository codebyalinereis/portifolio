import { prisma } from "@/lib/prisma";
import { parseCsvBuffer } from "./parse";
import { transformRow } from "./transform";
import type { OrderRow } from "./transform";

const CHUNK_SIZE = 1000;
export const MAX_ERROR_LINES = 100;

/**
 * Pipeline completo de load: createMany em chunks dentro do Dataset.
 * Retorna contadores. Erros são acumulados (linha + motivo).
 */
async function loadRows(datasetId: string, rows: OrderRow[]): Promise<void> {
  for (let index = 0; index < rows.length; index += CHUNK_SIZE) {
    const chunk = rows.slice(index, index + CHUNK_SIZE).map((row) => ({ ...row, datasetId }));
    await prisma.salesOrder.createMany({ data: chunk });
  }
}

/**
 * Pipeline ETL completo: parse → transform → load → atualização do Dataset.
 * Chamado em fire-and-forget pelo route handler de upload.
 */
export async function runEtl(datasetId: string, buffer: Buffer): Promise<void> {
  const startedAt = Date.now();
  try {
    // 1. Parse
    const rawRows = await parseCsvBuffer(buffer);

    // 2. Transform (valida linha a linha; acumula erros)
    const valid: OrderRow[] = [];
    const errors: string[] = [];
    for (let index = 0; index < rawRows.length; index++) {
      const result = transformRow(rawRows[index], index + 2); // +2: header + 1-indexed
      if (result.ok) valid.push(result.row);
      else errors.push(`L${result.line}: ${result.error}`);
      if (errors.length >= MAX_ERROR_LINES) break;
    }

    if (rawRows.length === 0) {
      throw new Error("CSV vazio ou sem colunas reconhecíveis (header ausente?).");
    }
    if (errors.length >= MAX_ERROR_LINES) {
      throw new Error(`Mais de ${MAX_ERROR_LINES} linhas inválidas. Primeiros erros: ${errors.slice(0, 5).join(" | ")}`);
    }
    if (valid.length === 0) {
      throw new Error(`Nenhuma linha válida (${errors.length} com erro). Primeiros: ${errors.slice(0, 5).join(" | ")}`);
    }

    // 3. Load
    await loadRows(datasetId, valid);

    // 4. Conclui o job
    await prisma.dataset.update({
      where: { id: datasetId },
      data: {
        status: "DONE",
        rowCount: valid.length,
        errorCount: errors.length,
        durationMs: Date.now() - startedAt,
        completedAt: new Date(),
        errorMessage: errors.length > 0 ? errors.slice(0, 20).join("\n") : null,
      },
    });
  } catch (error) {
    await prisma.dataset
      .update({
        where: { id: datasetId },
        data: {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Erro desconhecido no ETL",
          durationMs: Date.now() - startedAt,
          completedAt: new Date(),
        },
      })
      .catch(() => undefined);
  }
}
