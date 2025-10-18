// src/app/api/auth/reset/complete/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  token: z.string().min(10),
  new_password: z.string().min(8).max(72),
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

  const { email, token, new_password } = data.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return json({ ok:false, error:"Invalid token" }, 400);

  const reset = await prisma.passwordReset.findUnique({ where: { token } });
  if (!reset || reset.userId !== user.id) return json({ ok:false, error:"Invalid token" }, 400);
  if (reset.expiresAt.getTime() < Date.now()) {
    await prisma.passwordReset.delete({ where: { token } });
    return json({ ok:false, error:"Token expired" }, 400);
  }

  const passwordHash = bcrypt.hashSync(new_password, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  // limpiar todos los resets del usuario
  await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

  return json({ ok:true });
}
