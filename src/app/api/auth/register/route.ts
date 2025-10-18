// src/app/api/auth/register/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().max(100).optional(),
  password: z.string().min(8).max(72),
  security_question: z.string().trim().min(8).max(200),
  security_answer: z.string().trim().min(2).max(200),
});

function json(data: any, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function OPTIONS(){ return new NextResponse(null, { status: 204 }); }
export async function GET(){ return new NextResponse(null, { status: 204 }); }

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  const data = registerSchema.safeParse(body);
  if (!data.success) return json({ ok:false, error:"Bad request" }, 400);

  const { email, name, password, security_question, security_answer } = data.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return json({ ok:false, error:"Email already registered" }, 409);

  const passwordHash = bcrypt.hashSync(password, 10);
  const answerHash = bcrypt.hashSync(security_answer, 10);

  await prisma.user.create({
    data: {
      email,
      name: name || null,
      passwordHash,
      securityQuestion: security_question,
      securityAnswerHash: answerHash,
    }
  });

  return json({ ok: true }, 201);
}
