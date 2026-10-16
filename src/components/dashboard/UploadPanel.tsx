"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Download, Loader2, Upload, XCircle } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { useI18n } from "@/contexts/LocaleProvider";

export function UploadPanel({ onDatasetCreated }: { onDatasetCreated: () => void }) {
  const { d } = useI18n();
  const u = d.dashboard.upload;

  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [dataset, setDataset] = useState<{ status: string; rowCount: number; errorCount: number; durationMs: number | null; errorMessage: string | null } | null>(null);
  const [step, setStep] = useState(0); // 0 = idle; 1..5 = steps
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  // Progressão visual do pipeline (o status real chega pelo polling)
  useEffect(() => {
    if (!datasetId || dataset?.status !== "PROCESSING") return;
    const timer = setInterval(() => setStep((current) => Math.min(current + 1, 4)), 900);
    return () => clearInterval(timer);
  }, [datasetId, dataset?.status]);

  useEffect(() => {
    if (!datasetId || dataset?.status !== "PROCESSING") return;
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/etl/datasets/${datasetId}`);
        if (!response.ok) return;
        const body = await response.json();
        setDataset(body.data);
        if (body.data.status !== "PROCESSING") {
          stopPolling();
          setStep(5);
          if (body.data.status === "DONE") onDatasetCreated();
        }
      } catch {
        /* rede instável: tenta de novo no próximo tick */
      }
    }, 1000);
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId, dataset?.status === "PROCESSING"]);

  async function handleFile(file: File) {
    setError(null);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError(u.invalidType);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(u.tooLarge);
      return;
    }

    setFileName(file.name);
    setDataset(null);
    setDatasetId(null);
    setStep(1);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/etl/upload", { method: "POST", body: formData });
      if (!response.ok && response.status !== 202) {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? d.common.error);
        setStep(0);
        return;
      }
      const body = await response.json();
      setDatasetId(body.datasetId);
      setDataset({ status: "PROCESSING", rowCount: 0, errorCount: 0, durationMs: null, errorMessage: null });
    } catch {
      setError(d.common.error);
      setStep(0);
    }
  }

  const done = dataset?.status === "DONE";
  const failed = dataset?.status === "FAILED";

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold">{u.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted">{u.hint}</p>

      <div
        role="button"
        tabIndex={0}
        aria-label={u.choose}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-background px-4 py-6 text-center text-sm text-muted transition-colors hover:border-accent hover:text-foreground"
      >
        <Upload className="h-5 w-5 text-accent" aria-hidden="true" />
        {fileName ? <span className="font-medium text-foreground">{fileName}</span> : <span>{u.dragHint}</span>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />

      <a
        href="/sample-orders.csv"
        download
        className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" /> {u.sampleCta}
        <span className="text-muted"> — {u.sampleHint}</span>
      </a>

      {error ? (
        <p role="alert" className="mt-3 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {datasetId && dataset ? (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{u.pipelineTitle}</p>
          <ol className="mt-2 space-y-1.5">
            {u.steps.map((label, index) => {
              const stepNumber = index + 1;
              const isActive = !done && !failed && stepNumber === step;
              const isDone = done || stepNumber < step;
              return (
                <li key={label} className="flex items-center gap-2 text-xs">
                  {isDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  ) : failed && stepNumber === step ? (
                    <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" aria-hidden="true" />
                  ) : isActive ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" aria-hidden="true" />
                  ) : (
                    <span aria-hidden="true" className="inline-block h-3.5 w-3.5 rounded-full border border-border" />
                  )}
                  <span className={isDone || isActive ? "text-foreground" : "text-muted"}>{label}</span>
                </li>
              );
            })}
          </ol>

          {done ? (
            <p className="mt-3 text-xs text-muted" role="status">
              ✓ {dataset.rowCount.toLocaleString("pt-BR")} {u.rows}
              {dataset.errorCount > 0 ? ` · ${dataset.errorCount} ${u.errors}` : ""}
              {dataset.durationMs ? ` · ${dataset.durationMs} ms` : ""}
            </p>
          ) : null}
          {failed ? (
            <p role="alert" className="mt-3 break-words text-xs text-red-600 dark:text-red-400">
              {dataset.errorMessage ?? d.common.error}
            </p>
          ) : null}
        </div>
      ) : null}

      <Button type="button" variant="outline" className="mt-4 w-full" onClick={() => inputRef.current?.click()} disabled={dataset?.status === "PROCESSING"}>
        {dataset?.status === "PROCESSING" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {u.processing}
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" aria-hidden="true" /> {u.choose}
          </>
        )}
      </Button>
    </div>
  );
}
