"use client";

import { Badge } from "@/components/ui/primitives";
import { DeleteButton, TableShell, useAdminList } from "@/components/admin/crud";
import { useI18n } from "@/contexts/LocaleProvider";
import type { Dictionary } from "@/lib/i18n";
import type { DatasetSummary } from "@/types";

export function AdminDatasets() {
  const { d, locale } = useI18n();
  const a = d.admin.datasets;
  const { items, loading, reload } = useAdminList<DatasetSummary>("/api/analytics/datasets");

  const statusLabel = (status: DatasetSummary["status"]): string =>
    ({
      PROCESSING: d.dashboard.dataset.status.PROCESSING,
      DONE: d.dashboard.dataset.status.DONE,
      FAILED: d.dashboard.dataset.status.FAILED,
    })[status];

  async function handleDelete(id: string) {
    await fetch(`/api/etl/datasets/${id}`, { method: "DELETE" });
    await reload();
  }

  if (loading) return <p className="text-sm text-muted">{d.common.loading}</p>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">{a.title}</h1>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{a.empty}</p>
      ) : (
        <TableShell head={[a.name, a.source, a.status, a.rows, a.created, ""]}>
          {items.map((dataset) => (
            <tr key={dataset.id} className="border-t border-border">
              <td className="px-3 py-2 font-medium">{dataset.name}</td>
              <td className="px-3 py-2">
                <Badge>{dataset.source}</Badge>
              </td>
              <td className="px-3 py-2">{statusLabel(dataset.status)}</td>
              <td className="px-3 py-2 tabular-nums text-muted">{dataset.rowCount.toLocaleString("pt-BR")}</td>
              <td className="px-3 py-2 text-muted">
                {new Date(dataset.createdAt).toLocaleString(locale === "en" ? "en-US" : "pt-BR")}
              </td>
              <td className="px-3 py-2 text-right">
                <DeleteButton onClick={() => void handleDelete(dataset.id)} label={d.common.delete} />
              </td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}
