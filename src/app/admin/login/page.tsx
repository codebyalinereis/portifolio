"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { useI18n } from "@/contexts/LocaleProvider";

export default function AdminLoginPage() {
  const { d } = useI18n();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "invalid" | "blocked">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setStatus("sending");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") }),
      });
      if (response.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }
      setStatus(response.status === 429 ? "blocked" : "invalid");
    } catch {
      setStatus("invalid");
    }
  }

  const inputClass = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-24">
      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-accent" aria-hidden="true" />
          <h1 className="text-lg font-semibold">{d.admin.login.title}</h1>
        </div>
        <p className="mb-4 text-sm text-muted">{d.admin.login.subtitle}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="admin-email" className="mb-1 block text-sm font-medium">
              {d.admin.login.email}
            </label>
            <input id="admin-email" name="email" type="email" required autoComplete="username" className={inputClass} />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1 block text-sm font-medium">
              {d.admin.login.password}
            </label>
            <input id="admin-password" name="password" type="password" required minLength={6} autoComplete="current-password" className={inputClass} />
          </div>
          <Button type="submit" className="w-full" disabled={status === "sending"}>
            {status === "sending" ? d.common.loading : d.admin.login.submit}
          </Button>
          {status === "invalid" ? <p role="alert" className="text-sm text-red-600 dark:text-red-400">{d.admin.login.invalid}</p> : null}
          {status === "blocked" ? <p role="alert" className="text-sm text-red-600 dark:text-red-400">{d.admin.login.blocked}</p> : null}
        </form>
      </div>
    </div>
  );
}
