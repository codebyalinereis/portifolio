"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/primitives";
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

type AdminProject = {
  id: string;
  slug: string;
  title: string;
  titleEn: string | null;
  summary: string;
  detail: string | null;
  detailEn: string | null;
  featured: boolean;
  order: number;
  repoUrl: string | null;
  liveUrl: string | null;
  technologies: { id: string; name: string }[];
};

type AdminTechnology = { id: string; name: string; category: string };

type FormState = {
  slug: string;
  title: string;
  titleEn: string;
  summary: string;
  summaryEn: string;
  detail: string;
  detailEn: string;
  order: number;
  featured: boolean;
  repoUrl: string;
  liveUrl: string;
  technologyIds: string[];
};

const EMPTY: FormState = {
  slug: "", title: "", titleEn: "", summary: "", summaryEn: "", detail: "", detailEn: "",
  order: 0, featured: false, repoUrl: "", liveUrl: "", technologyIds: [],
};

export function AdminProjects() {
  const { d } = useI18n();
  const a = d.admin.projects;
  const { items: projects, loading, reload } = useAdminList<AdminProject>("/api/admin/projects");
  const { items: technologies } = useAdminList<AdminTechnology>("/api/admin/skills");

  const [editingId, setEditingId] = useState<string | null>(null); // null = fechado; "new" = criando
  const [form, setForm] = useState<FormState>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openNew() {
    setForm(EMPTY);
    setEditingId("new");
    setError(null);
  }

  function openEdit(project: AdminProject) {
    setForm({
      slug: project.slug,
      title: project.title,
      titleEn: project.titleEn ?? "",
      summary: project.summary,
      summaryEn: "",
      detail: project.detail ?? "",
      detailEn: project.detailEn ?? "",
      order: project.order,
      featured: project.featured,
      repoUrl: project.repoUrl ?? "",
      liveUrl: project.liveUrl ?? "",
      technologyIds: project.technologies.map((tech) => tech.id),
    });
    setEditingId(project.id);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      ...form,
      titleEn: form.titleEn || null,
      summaryEn: form.summaryEn || null,
      detail: form.detail || null,
      detailEn: form.detailEn || null,
      repoUrl: form.repoUrl || null,
      liveUrl: form.liveUrl || null,
    };
    try {
      if (editingId === "new") await adminFetch("/api/admin/projects", { method: "POST", body: JSON.stringify(payload) });
      else await adminFetch(`/api/admin/projects/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) });
      setEditingId(null);
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : d.common.error);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    await adminFetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    await reload();
  }

  return (
    <div>
      <CrudHeader title={a.title} onNew={openNew} newLabel={d.common.new} />

      {editingId !== null ? (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-lg border border-border bg-surface p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={a.tableTitle}>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
            </Field>
            <Field label={`${a.titleEn} (${d.common.optional})`}>
              <input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className={inputClass} />
            </Field>
            <Field label={a.slug}>
              <input required pattern="[a-z0-9-]+" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} />
            </Field>
            <Field label={a.order}>
              <input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className={inputClass} />
            </Field>
          </div>
          <Field label={a.summary}>
            <textarea required rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className={inputClass} />
          </Field>
          <Field label={`${a.summaryEn} (${d.common.optional})`}>
            <textarea rows={2} value={form.summaryEn} onChange={(e) => setForm({ ...form, summaryEn: e.target.value })} className={inputClass} />
          </Field>
          <Field label={`${a.detail} (${d.common.optional} — "## " vira título, "- " vira item de lista)`}>
            <textarea rows={10} value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} className={`${inputClass} font-mono text-xs`} />
          </Field>
          <Field label={`${a.detailEn} (${d.common.optional})`}>
            <textarea rows={10} value={form.detailEn} onChange={(e) => setForm({ ...form, detailEn: e.target.value })} className={`${inputClass} font-mono text-xs`} />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={`${a.repoUrl} (${d.common.optional})`}>
              <input type="url" value={form.repoUrl} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })} className={inputClass} />
            </Field>
            <Field label={`${a.liveUrl} (${d.common.optional})`}>
              <input type="url" value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <Field label={a.technologies}>
            <div className="flex flex-wrap gap-1.5">
              {technologies.map((tech) => {
                const checked = form.technologyIds.includes(tech.id);
                return (
                  <button
                    type="button"
                    key={tech.id}
                    aria-pressed={checked}
                    onClick={() =>
                      setForm({
                        ...form,
                        technologyIds: checked
                          ? form.technologyIds.filter((id) => id !== tech.id)
                          : [...form.technologyIds, tech.id],
                      })
                    }
                    className={checked ? "rounded-full border border-accent bg-accent-soft px-2.5 py-0.5 text-xs text-accent" : "rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"}
                  >
                    {tech.name}
                  </button>
                );
              })}
            </div>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            {a.featured}
          </label>
          {error ? <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          <FormActions onCancel={() => setEditingId(null)} busy={busy} />
        </form>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted">{d.common.loading}</p>
      ) : projects.length === 0 ? (
        <p className="text-sm text-muted">{a.empty}</p>
      ) : (
        <TableShell head={[a.tableTitle, a.slug, a.technologies, a.featured, a.order, ""]}>
          {projects.map((project) => (
            <tr key={project.id} className="border-t border-border">
              <td className="px-3 py-2 font-medium">{project.title}</td>
              <td className="px-3 py-2 font-mono text-xs text-muted">{project.slug}</td>
              <td className="px-3 py-2">
                <div className="flex max-w-xs flex-wrap gap-1">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <Badge key={tech.id}>{tech.name}</Badge>
                  ))}
                  {project.technologies.length > 4 ? <Badge>+{project.technologies.length - 4}</Badge> : null}
                </div>
              </td>
              <td className="px-3 py-2">{project.featured ? "★" : "—"}</td>
              <td className="px-3 py-2 tabular-nums text-muted">{project.order}</td>
              <td className="px-3 py-2 text-right">
                <span className="inline-flex gap-1">
                  <EditButton onClick={() => openEdit(project)} label={d.common.edit} />
                  <DeleteButton onClick={() => void handleDelete(project.id)} label={d.common.delete} />
                </span>
              </td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}
