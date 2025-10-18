// src/app/api/auth/login/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function json(data: any, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function isHttps(url: string | null) {
  try {
    return url ? new URL(url).protocol === "https:" : false;
  } catch {
    return false;
  }
}

function setAuthCookie(res: NextResponse, reqUrl: string | null, token: string) {
  const maxAgeSec = Math.floor(SESSION_TTL_MS / 1000);
  const base =
    `auth=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAgeSec}; HttpOnly; SameSite=Lax`;
  const secure = isHttps(reqUrl) || !!process.env.VERCEL ? "; Secure" : "";
  res.headers.append("Set-Cookie", base + secure);
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
export async function GET() { return new NextResponse(null, { status: 204 }); }

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  const email = (body.email || "").toString().trim().toLowerCase();
  const password = (body.password || "").toString();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok:false, error:"Invalid email" }, 400);
  if (password.length < 8 || password.length > 72) return json({ ok:false, error:"Invalid password length" }, 400);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) return json({ ok:false, error:"Invalid credentials" }, 401);

  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date(); const exp = new Date(now.getTime() + SESSION_TTL_MS);
  await prisma.session.create({ data: { userId: user.id, token, createdAt: now, expiresAt: exp } });

  const res = json({ ok: true }, 200);
  setAuthCookie(res, req.url || null, token);
  return res;
}
