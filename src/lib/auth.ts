import { cookies } from "next/headers";
import { getIronSession, type IronSession } from "iron-session";

export type AdminSessionData = { id?: number; email?: string };
export type AdminSession = IronSession<AdminSessionData>;

export const SESSION_COOKIE = "portfolio_admin";

export async function getAdminSession(): Promise<AdminSession> {
  const cookieStore = await cookies();
  return getIronSession<AdminSessionData>(cookieStore, {
    password: process.env.SESSION_SECRET ?? "",
    cookieName: SESSION_COOKIE,
    ttl: 60 * 60 * 24 * 7, // 7 dias
    cookieOptions: {
      // ALLOW_INSECURE_COOKIES=true é para rodar `next start` local em HTTP
      // (demo). Em deploy com HTTPS, não defina a flag.
      secure: process.env.NODE_ENV === "production" && process.env.ALLOW_INSECURE_COOKIES !== "true",
      httpOnly: true,
      sameSite: "lax",
    },
  });
}

/**
 * Hash bcrypt da senha do admin.
 * O .env guarda em BASE64 (ADMIN_PASSWORD_HASH_B64): o dotenv-expand do Next
 * interpreta '$' no hash como referência de variável e corrompe o valor —
 * base64 não tem caracteres especiais.
 */
export function getAdminPasswordHash(): string {
  const b64 = process.env.ADMIN_PASSWORD_HASH_B64;
  if (b64) {
    try {
      const hash = Buffer.from(b64, "base64").toString("utf8");
      if (/^\$2[aby]\$/.test(hash)) return hash;
    } catch {
      // cai no fallback abaixo
    }
  }
  // Fallback: hash direto (só funciona se não passar pelo .env — ex.: env real)
  return process.env.ADMIN_PASSWORD_HASH ?? "";
}

/** Retorna a sessão se autenticada, senão null. Usado nas routes admin. */
export async function getAuthenticatedSession(): Promise<AdminSession | null> {
  const session = await getAdminSession();
  return session.email ? session : null;
}
