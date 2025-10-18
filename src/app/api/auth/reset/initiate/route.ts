// src/app/api/auth/reset/initiate/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });

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

  const user = await prisma.user.findUnique({ where: { email: data.data.email } });

  // Para no filtrar existencia, devolvemos ok siempre.
  const question = user?.securityQuestion || null;
  return json({ ok:true, question });
}
