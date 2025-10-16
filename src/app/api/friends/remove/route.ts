import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const me = getUserFromCookie();
  if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await req.json();

  const [a, b] = me.id < id ? [me.id, id] : [id, me.id];
  await prisma.friendship.delete({ where: { aId_bId: { aId: a, bId: b } } }).catch(() => {});

  return NextResponse.json({ ok: true });
}
