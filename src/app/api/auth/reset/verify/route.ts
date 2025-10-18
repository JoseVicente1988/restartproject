// src/app/api/auth/reset/verify/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  answer: z.string().trim().min(1),
});

function json(data: any, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function OPTIONS(){ return new NextResponse(null, { status: 204 }); }
export async function GET(){ return new NextResponse(null, { status: 204 }); }

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  const data = schema.safeParse(body);
  if (!data.success) return json({ ok:false, error:"Bad request" }, 400);

  const { email, answer } = data.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.securityAnswerHash) return json({ ok:false, error:"Invalid answer" }, 400);

  const ok = bcrypt.compareSync(answer, user.securityAnswerHash);
  if (!ok) return json({ ok:false, error:"Invalid answer" }, 400);

  // Crear token de 15 minutos
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.passwordReset.create({
    data: { userId: user.id, token, expiresAt }
  });

  return json({ ok:true, token }); // cliente lo usará para completar
}
