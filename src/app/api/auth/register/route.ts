export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() { return new NextResponse(null, { status: 204 }); }
export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  const email = (body.email || "").toString().trim().toLowerCase();
  const name = (body.name || "").toString().trim() || null;
  const password = (body.password || "").toString();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok:false, error:"Invalid email" }, 400);
  if (password.length < 8 || password.length > 72) return json({ ok:false, error:"Invalid password length" }, 400);

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return json({ ok:false, error:"Email already registered" }, 409);

  const passwordHash = bcrypt.hashSync(password, 10);
  await prisma.user.create({ data: { email, passwordHash, name } });

  return json({ ok: true }, 201);
}
