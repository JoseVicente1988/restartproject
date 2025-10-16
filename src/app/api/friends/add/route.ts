import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const me = getUserFromCookie();
  if (!me) return NextResponse.json([], { status: 200 });

  const links = await prisma.friendship.findMany({
    where: { OR: [{ aId: me.id }, { bId: me.id }] }
  });

  const friendIds = links.map(l => (l.aId === me.id ? l.bId : l.aId));
  const friends = await prisma.user.findMany({
    where: { id: { in: friendIds } },
    select: { id: true, email: true, name: true }
  });

  return NextResponse.json(friends);
}

export async function POST(req: Request) {
  const me = getUserFromCookie();
  if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { email } = await req.json();
  const other = await prisma.user.findUnique({ where: { email } });
  if (!other || other.id === me.id) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const [a, b] = me.id < other.id ? [me.id, other.id] : [other.id, me.id];
  await prisma.friendship.upsert({
    where: { aId_bId: { aId: a, bId: b } },
    update: {},
    create: { aId: a, bId: b }
  });

  return NextResponse.json({ ok: true });
}
