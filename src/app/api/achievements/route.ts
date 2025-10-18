// src/app/api/achievements/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
export async function GET() {
  const u = await currentUser();
  if (!u) return json({ ok: false, error: "Unauthorized" }, 401);
  const me = BigInt(u.id);

  // Semilla mínima de logros
  const defaults = [
    { code: "LISTA_COMPLETA_DIA", title: "Lista completa (hoy)", desc: "Has completado toda la lista de compra." },
    { code: "HUEVOS_36_MES",      title: "36 huevos/mes",        desc: "Has comprado al menos 36 huevos en el último mes." },
  ];
  for (const d of defaults) {
    await prisma.achievement.upsert({
      where: { code: d.code },
      update: {},
      create: d,
    });
  }

  const [all, progress] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { id: "asc" } }),
    prisma.achievementProgress.findMany({ where: { userId: me } }),
  ]);

  const byId = new Map(progress.map(p => [p.achievementId.toString(), p]));
  const achievements = all.map(a => {
    const p = byId.get(a.id.toString());
    return {
      id: a.id.toString(),
      code: a.code,
      title: a.title,
      desc: a.desc,
      achieved: !!p?.achieved,
      progress: p?.progress ?? 0,
    };
  });

  return json({ ok: true, achievements });
}
