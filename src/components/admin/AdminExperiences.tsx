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

type AdminExperience = {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  order: number;
};

type FormState = {
  role: string;
  roleEn: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  descriptionEn: string;
  order: number;
};

const EMPTY: FormState = {
  role: "", roleEn: "", company: "", startDate: "", endDate: "",
  current: false, description: "", descriptionEn: "", order: 0,
};

export function AdminExperiences() {
  const { d } = useI18n();
  const a = d.admin.experiences;
  const { items, loading, reload } = useAdminList<AdminExperience>("/api/admin/experiences");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      ...form,
      roleEn: form.roleEn || null,
      descriptionEn: form.descriptionEn || null,
      startDate: new Date(`${form.startDate}T12:00:00`).toISOString(),
      endDate: form.endDate ? new Date(`${form.endDate}T12:00:00`).toISOString() : null,
    };
    try {
      if (editingId === "new") await adminFetch("/api/admin/experiences", { method: "POST", body: JSON.stringify(payload) });
      else await adminFetch(`/api/admin/experiences/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) });
      setEditingId(null);
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : d.common.error);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    await adminFetch(`/api/admin/experiences/${id}`, { method: "DELETE" });
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
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-lg border border-border bg-surface p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={a.role}>
              <input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass} />
            </Field>
            <Field label={`${a.roleEn} (${d.common.optional})`}>
              <input value={form.roleEn} onChange={(e) => setForm({ ...form, roleEn: e.target.value })} className={inputClass} />
            </Field>
            <Field label={a.company}>
              <input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputClass} />
            </Field>
            <Field label={a.order}>
              <input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className={inputClass} />
            </Field>
            <Field label={a.startDate}>
              <input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
            </Field>
            <Field label={`${a.endDate} (${d.common.optional})`}>
              <input type="date" value={form.endDate} disabled={form.current} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.current}
              onChange={(e) => setForm({ ...form, current: e.target.checked, endDate: e.target.checked ? "" : form.endDate })}
            />
            {a.current}
          </label>
          <Field label={a.description}>
            <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
          </Field>
          <Field label={`${a.descriptionEn} (${d.common.optional})`}>
            <textarea rows={3} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} className={inputClass} />
          </Field>
          {error ? <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          <FormActions onCancel={() => setEditingId(null)} busy={busy} />
        </form>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted">{d.common.loading}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">{a.empty}</p>
      ) : (
        <TableShell head={[a.role, a.company, a.startDate, a.endDate, ""]}>
          {items.map((experience) => (
            <tr key={experience.id} className="border-t border-border">
              <td className="px-3 py-2 font-medium">{experience.role}</td>
              <td className="px-3 py-2 text-muted">{experience.company}</td>
              <td className="px-3 py-2 text-muted">
                {new Date(experience.startDate).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
              </td>
              <td className="px-3 py-2 text-muted">
                {experience.current ? a.current : experience.endDate ? new Date(experience.endDate).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }) : "—"}
              </td>
              <td className="px-3 py-2 text-right">
                <span className="inline-flex gap-1">
                  <EditButton
                    onClick={() => {
                      setForm({
                        role: experience.role,
                        roleEn: "",
                        company: experience.company,
                        startDate: experience.startDate.slice(0, 10),
                        endDate: experience.endDate?.slice(0, 10) ?? "",
                        current: experience.current,
                        description: "",
                        descriptionEn: "",
                        order: 0,
                      });
                      setEditingId(experience.id);
                    }}
                    label={d.common.edit}
                  />
                  <DeleteButton onClick={() => void handleDelete(experience.id)} label={d.common.delete} />
                </span>
              </td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}
