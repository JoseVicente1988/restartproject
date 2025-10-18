import { prisma } from "@/lib/db";
import { withMethods, okJSON } from "@/lib/http";

function cookie(name: string, val: string, opts: Record<string, any> = {}) {
  const parts = [`${name}=${val}`];
  if (opts.path !== undefined) parts.push(`Path=${opts.path}`);
  if (opts.maxAge !== undefined) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.secure) parts.push("Secure");
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  return parts.join("; ");
}

async function postHandler(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const m = cookieHeader.match(/(?:^|;\s*)auth=([^;]+)/);
  const token = m ? decodeURIComponent(m[1]) : "";

  if (token) {
    try { await prisma.session.delete({ where: { token } }); } catch {}
  }

  const res = okJSON({ ok: true });
  // Expira cookie
  (res.headers as Headers).append(
    "Set-Cookie",
    cookie("auth", "", { path: "/", httpOnly: true, secure: true, sameSite: "Lax", maxAge: 0 })
  );
  return res;
}

export const dynamic = "force-dynamic";
export const POST = withMethods({ POST: postHandler });
export const OPTIONS = withMethods({ OPTIONS: async () => okJSON({}, { status: 204 }) });
