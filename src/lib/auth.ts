// src/lib/auth.ts
import { cookies as nextCookies } from "next/headers";
import { prisma } from "@/lib/db";

export type CurrentUser =
  | null
  | {
      id: string; // BigInt to string para no romper JSON
      email: string;
      name: string | null;
      createdAt: Date;
      locale: string | null;
      theme: string | null;
      photoBase64: string | null;
    };

// Intenta extraer cookie "auth" de: next/headers o del Request.headers
export function getAuthToken(req?: Request): string {
  try {
    // 1) App Router (server) — cookies()
    const jar = nextCookies();
    const v = jar.get("auth")?.value;
    if (v) return v;
  } catch {
    // ignore
  }
  // 2) Fallback: cabecera Cookie del Request
  if (req) {
    const raw = req.headers.get("cookie") || "";
    const m = raw.match(/(?:^|;\s*)auth=([^;]+)/);
    if (m) return decodeURIComponent(m[1]);
  }
  return "";
}

// currentUser() sin args → usa cookies() de Next
// currentUser(req) → usa cookie de ese request (útil en Edge/fetch tests)
export async function currentUser(req?: Request): Promise<CurrentUser> {
  const token = getAuthToken(req);
  if (!token) return null;

  const sess = await prisma.session.findUnique({ where: { token } });
  if (!sess || sess.expiresAt.getTime() < Date.now()) return null;

  const u = await prisma.user.findUnique({
    where: { id: sess.userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      locale: true,
      theme: true,
      photoBase64: true,
    },
  });
  if (!u) return null;

  // BigInt -> string
  const id =
    typeof u.id === "bigint"
      ? (u.id as unknown as bigint).toString()
      : (u.id as unknown as string);

  return {
    id,
    email: u.email,
    name: u.name,
    createdAt: u.createdAt,
    locale: u.locale,
    theme: u.theme,
    photoBase64: u.photoBase64,
  };
}
