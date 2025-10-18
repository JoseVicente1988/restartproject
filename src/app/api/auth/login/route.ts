import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { withMethods, okJSON } from "@/lib/http";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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
  const body = await req.json().catch(() => ({} as any));
  const email = (body.email || "").toString().trim().toLowerCase();
  const password = (body.password || "").toString();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return okJSON({ ok: false, error: "Invalid email" }, { status: 400 });
  }
  if (password.length < 8 || password.length > 72) {
    return okJSON({ ok: false, error: "Invalid password length" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return okJSON({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const exp = new Date(now.getTime() + SESSION_TTL_MS);

  await prisma.session.create({
    data: { userId: user.id, token, createdAt: now, expiresAt: exp },
  });

  const res = okJSON({ ok: true });
  // cookie httpOnly de sesión
  (res.headers as Headers).append(
    "Set-Cookie",
    cookie("auth", token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
    })
  );
  return res;
}

export const dynamic = "force-dynamic";
export const POST = withMethods({ POST: postHandler });
export const OPTIONS = withMethods({ OPTIONS: async () => okJSON({}, { status: 204 }) });
