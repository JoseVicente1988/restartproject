import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const me = getUserFromCookie();
  if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { toId, text } = await req.json();
  if (!toId || !text) return NextResponse.json({ error: "missing" }, { status: 400 });

  const [a, b] = me.id < toId ? [me.id, toId] : [toId, me.id];
  const friends = await prisma.friendship.findUnique({ where: { aId_bId: { aId: a, bId: b } } });
  if (!friends) return NextResponse.json({ error: "not_friends" }, { status: 403 });

  const msg = await prisma.message.create({ data: { fromId: me.id, toId, text } });
  return NextResponse.json(msg);
}
