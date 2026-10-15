"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button, buttonClass } from "@/components/ui/primitives";
import { useI18n } from "@/contexts/LocaleProvider";

/** Fetch helper autenticado para o CRUD admin. */
export async function adminFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function useAdminList<T>(url: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const body = await adminFetch<{ data: T[] }>(url);
      setItems(body.data ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "erro");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, loading, error, reload };
}

export function CrudHeader({ title, onNew, newLabel }: { title: string; onNew: () => void; newLabel: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h1 className="text-xl font-semibold">{title}</h1>
      <Button type="button" onClick={onNew} variant="primary">
        <Plus className="h-4 w-4" aria-hidden="true" /> {newLabel}
      </Button>
    </div>
  );
}

export function EditButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
    >
      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}

export function DeleteButton({ onClick, label }: { onClick: () => void; label: string }) {
  const { d } = useI18n();
  return (
    <button
      type="button"
      onClick={() => {
        if (window.confirm(d.common.confirmDelete)) onClick();
      }}
      aria-label={label}
      title={label}
      className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-red-600 dark:hover:text-red-400"
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}

export const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted focus:border-accent";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

export function FormActions({ onCancel, busy }: { onCancel: () => void; busy: boolean }) {
  const { d } = useI18n();
  return (
    <div className="flex gap-2">
      <Button type="submit" disabled={busy}>
        {busy ? d.common.saving : d.common.save}
      </Button>
      <Button type="button" variant="ghost" onClick={onCancel}>
        {d.common.cancel}
      </Button>
    </div>
  );
}

export function TableShell({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-2">
          <tr>
            {head.map((heading) => (
              <th key={heading} scope="col" className="px-3 py-2 text-xs font-semibold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
