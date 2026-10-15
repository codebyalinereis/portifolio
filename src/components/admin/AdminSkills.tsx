"use client";

import { useState } from "react";
import {
  adminFetch,
  CrudHeader,
  DeleteButton,
  EditButton,
  Field,
  FormActions,
  inputClass,
  TableShell,
  useAdminList,
} from "@/components/admin/crud";
import { useI18n } from "@/contexts/LocaleProvider";
import type { Dictionary } from "@/lib/i18n";

type AdminTechnology = { id: string; name: string; category: keyof Dictionary["skills"]["categories"]; level: number; order: number };

const CATEGORIES: AdminTechnology["category"][] = ["FRONTEND", "BACKEND", "DATA", "DEVOPS", "DOMAIN"];

type FormState = { name: string; category: AdminTechnology["category"]; level: number; order: number };
const EMPTY: FormState = { name: "", category: "DATA", level: 3, order: 0 };

export function AdminSkills() {
  const { d } = useI18n();
  const a = d.admin.technologies;
  const { items, loading, reload } = useAdminList<AdminTechnology>("/api/admin/skills");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (editingId === "new") await adminFetch("/api/admin/skills", { method: "POST", body: JSON.stringify(form) });
      else await adminFetch(`/api/admin/skills/${editingId}`, { method: "PATCH", body: JSON.stringify(form) });
      setEditingId(null);
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : d.common.error);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    await adminFetch(`/api/admin/skills/${id}`, { method: "DELETE" });
    await reload();
  }

  return (
    <div>
      <CrudHeader
        title={a.title}
        onNew={() => {
          setForm(EMPTY);
          setEditingId("new");
        }}
        newLabel={d.common.new}
      />

      {editingId !== null ? (
        <form onSubmit={handleSubmit} className="mb-6 grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-4">
          <Field label={a.name}>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </Field>
          <Field label={a.category}>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as AdminTechnology["category"] })} className={inputClass}>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {d.skills.categories[category]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={a.level}>
            <input type="number" min={1} max={5} value={form.level} onChange={(e) => setForm({ ...form, level: Number(e.target.value) })} className={inputClass} />
          </Field>
          <Field label={a.order}>
            <input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className={inputClass} />
          </Field>
          {error ? <p role="alert" className="text-sm text-red-600 dark:text-red-400 md:col-span-4">{error}</p> : null}
          <div className="md:col-span-4">
            <FormActions onCancel={() => setEditingId(null)} busy={busy} />
          </div>
        </form>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted">{d.common.loading}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">{a.empty}</p>
      ) : (
        <TableShell head={[a.name, a.category, a.level, a.order, ""]}>
          {items.map((tech) => (
            <tr key={tech.id} className="border-t border-border">
              <td className="px-3 py-2 font-medium">{tech.name}</td>
              <td className="px-3 py-2 text-muted">{d.skills.categories[tech.category]}</td>
              <td className="px-3 py-2 tabular-nums text-muted">{tech.level}/5</td>
              <td className="px-3 py-2 tabular-nums text-muted">{tech.order}</td>
              <td className="px-3 py-2 text-right">
                <span className="inline-flex gap-1">
                  <EditButton
                    onClick={() => {
                      setForm({ name: tech.name, category: tech.category, level: tech.level, order: tech.order });
                      setEditingId(tech.id);
                    }}
                    label={d.common.edit}
                  />
                  <DeleteButton onClick={() => void handleDelete(tech.id)} label={d.common.delete} />
                </span>
              </td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}
