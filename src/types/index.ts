export type DatasetStatus = "PROCESSING" | "DONE" | "FAILED";

export type DatasetSummary = {
  id: string;
  name: string;
  source: string;
  status: DatasetStatus;
  rowCount: number;
  createdAt: string;
};

export type DatasetFull = DatasetSummary & {
  originalFilename: string | null;
  errorCount: number;
  errorMessage: string | null;
  durationMs: number | null;
  completedAt: string | null;
};

export type SampleRow = {
  numero: number;
  dataEmissao: string;
  emitenteNome: string;
  emitenteUf: string;
  categoria: string;
  valorTotal: number;
  cfop: string;
};
