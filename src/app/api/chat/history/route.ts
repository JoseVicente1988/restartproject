import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const me = getUserFromCookie();
  if (!me) return NextResponse.json([], { status: 200 });
  const { searchParams } = new URL(req.url);
  const peer = searchParams.get("peer");
  if (!peer) return NextResponse.json([], { status: 200 });

  const msgs = await prisma.message.findMany({
    where: {
      OR: [
        { fromId: me.id, toId: peer },
        { fromId: peer, toId: me.id }
      ]
    },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json(msgs);
}
