"use client";

import { adminFetch, DeleteButton, useAdminList } from "@/components/admin/crud";
import { useI18n } from "@/contexts/LocaleProvider";
import { cn } from "@/lib/utils";

type AdminMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export function AdminMessages() {
  const { d, locale } = useI18n();
  const a = d.admin.messages;
  const { items, loading, reload } = useAdminList<AdminMessage>("/api/admin/messages");

  async function toggleRead(message: AdminMessage) {
    await adminFetch(`/api/admin/messages/${message.id}`, { method: "PATCH", body: JSON.stringify({ read: !message.read }) });
    await reload();
  }

  async function handleDelete(id: string) {
    await adminFetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    await reload();
  }

  if (loading) return <p className="text-sm text-muted">{d.common.loading}</p>;
  if (items.length === 0) return <p className="text-sm text-muted">{a.empty}</p>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">{a.title}</h1>
      <div className="space-y-3">
        {items.map((message) => (
          <article
            key={message.id}
            className={cn("rounded-lg border bg-surface p-4", message.read ? "border-border" : "border-accent/50")}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">
                  {message.name} <span className="font-normal text-muted">· {message.email}</span>
                </p>
                <p className="text-xs text-muted">
                  {new Date(message.createdAt).toLocaleString(locale === "en" ? "en-US" : "pt-BR")} ·{" "}
                  {message.read ? a.read : a.unread}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => void toggleRead(message)}
                  className="rounded-md px-2 py-1 text-xs text-muted hover:bg-surface-2 hover:text-foreground"
                >
                  {message.read ? a.markUnread : a.markRead}
                </button>
                <DeleteButton onClick={() => void handleDelete(message.id)} label={d.common.delete} />
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">{message.message}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
