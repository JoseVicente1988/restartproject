// src/app/api/goals/[id]/publish/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
export async function GET() { return new NextResponse(null, { status: 204 }); }

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const u = await currentUser();
  if (!u) return json({ ok: false, error: "Unauthorized" }, 401);

  const id = BigInt(params.id);
  const me = BigInt(u.id);

  const g = await prisma.goal.findUnique({ where: { id } });
  if (!g || g.userId !== me) return json({ ok: false, error: "Not found" }, 404);

  await prisma.goal.update({ where: { id }, data: { isPublic: true } });

  await prisma.feedPost.create({
    data: { userId: me, content: `Meta publicada: ${g.title}` },
  });

  return json({ ok: true });
}
