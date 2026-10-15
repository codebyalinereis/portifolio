import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

/**
 * Layout do painel (grupo de rota (painel) — /admin/login fica fora daqui).
 * Validação real da sessão selada; o proxy.ts só faz a checagem leve do cookie.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session.email) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <AdminNav />
      <div className="mt-8">{children}</div>
    </div>
  );
}
