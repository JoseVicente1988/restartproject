// src/app/api/items/[id]/toggle/route.ts
// (Si ya pegaste esta versión antes, déjala. Si no, usa esta completa.)
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
export async function GET() { return new NextResponse(null, { status: 204 }); }

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const u = await currentUser();
  if (!u) return json({ ok: false, error: "Unauthorized" }, 401);

  const id = BigInt(params.id);
  const me = BigInt(u.id);

  const it = await prisma.item.findUnique({ where: { id } });
  if (!it || it.userId !== me) return json({ ok: false, error: "Not found" }, 404);

  await prisma.item.update({
    where: { id },
    data: { done: !it.done },
  });

  const remaining = await prisma.item.count({
    where: { userId: me, done: false },
  });

  if (remaining === 0) {
    await prisma.feedPost.create({
      data: { userId: me, content: "¡Lista completada hoy! 🏁" },
    });

    const ach = await prisma.achievement.upsert({
      where: { code: "LISTA_COMPLETA_DIA" },
      update: {},
      create: {
        code: "LISTA_COMPLETA_DIA",
        title: "Lista completa (hoy)",
        desc: "Has completado toda la lista de compra.",
      },
    });

    await prisma.achievementProgress.upsert({
      where: { userId_achievementId: { userId: me, achievementId: ach.id } },
      update: { achieved: true, progress: 1 },
      create: { userId: me, achievementId: ach.id, achieved: true, progress: 1 },
    });
  }

  return json({ ok: true });
}
