import { parse } from "csv-parse";
import { Readable } from "node:stream";

/**
 * Detecta o delimitador UMA vez pela linha de header.
 * Fixar o delimitador é essencial: passar array pro csv-parse ativa
 * auto-detecção por linha, e aí vírgulas decimais pt-BR ("1.234,56")
 * dividem campos no meio do arquivo.
 */
function detectDelimiter(headerLine: string): string {
  const semicolons = (headerLine.match(/;/g) ?? []).length;
  const commas = (headerLine.match(/,/g) ?? []).length;
  return semicolons >= commas ? ";" : ",";
}

/** Faz o parse de um buffer CSV em objetos (colunas como header normalizado cru). */
export async function parseCsvBuffer(buffer: Buffer): Promise<Record<string, string>[]> {
  // Primeira linha não-vazia (BOM removido) define o delimitador do arquivo todo.
  const text = buffer.toString("utf8").replace(/^﻿/, "");
  const firstLine = text.split(/\r?\n/).find((line) => line.trim().length > 0) ?? "";
  const delimiter = detectDelimiter(firstLine);

  return new Promise((resolve, reject) => {
    const rows: Record<string, string>[] = [];
    Readable.from(buffer)
      .pipe(
        parse({
          columns: true,
          trim: true,
          bom: true,
          skip_empty_lines: true,
          delimiter,
          cast: false,
        })
      )
      .on("data", (row: Record<string, string>) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", (error: Error) => reject(error));
  });
}
