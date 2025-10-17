import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  const url = new URL(req.url);
  const friendId = BigInt(url.searchParams.get("friend_id") || "0");
  if (!friendId) return NextResponse.json({ ok:false, error:"Missing friend_id" }, { status:400 });

  const me = BigInt(u.id);
  const a = me < friendId ? me : friendId;
  const b = me < friendId ? friendId : me;
  const fr = await prisma.friendship.findUnique({ where: { userA_userB: { userA: a, userB: b } } });
  if (!fr || fr.status !== "accepted") return NextResponse.json({ ok:false, error:"Not friends" }, { status:403 });

  const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") ?? "20", 10)));
  const offset = Math.max(0, Math.min(1_000_000, parseInt(url.searchParams.get("offset") ?? "0", 10)));

  const msgs = await prisma.dM.findMany({
    where: {
      OR: [
        { senderId: me, receiverId: friendId },
        { senderId: friendId, receiverId: me }
      ]
    },
    orderBy: { id: "desc" },
    take: limit,
    skip: offset
  });

  const mapped = msgs.map(m => ({ id: m.id, text: m.text, createdAt: m.createdAt, mine: m.senderId === me, senderId: m.senderId }));
  return NextResponse.json({ ok:true, messages: mapped });
}
