import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dmSendSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  try {
    const data = dmSendSchema.parse(await req.json());
    const me = BigInt(u.id), friendId = BigInt(data.friend_id);
    const a = me < friendId ? me : friendId;
    const b = me < friendId ? friendId : me;
    const fr = await prisma.friendship.findUnique({ where: { userA_userB: { userA: a, userB: b } } });
    if (!fr || fr.status !== "accepted") return NextResponse.json({ ok:false, error:"Not friends" }, { status:403 });

    await prisma.dM.create({ data: { senderId: me, receiverId: friendId, text: data.text } });
    return NextResponse.json({ ok:true }, { status:201 });
  } catch {
    return NextResponse.json({ ok:false, error:"Bad request" }, { status:400 });
  }
}
