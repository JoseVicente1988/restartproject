import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { friendActionSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  try {
    const { friendship_id } = friendActionSchema.parse(await req.json());
    const f = await prisma.friendship.findUnique({ where: { id: friendship_id } });
    if (!f) return NextResponse.json({ ok:false, error:"Not found" }, { status:404 });
    if (f.userA !== BigInt(u.id) && f.userB !== BigInt(u.id)) return NextResponse.json({ ok:false, error:"Forbidden" }, { status:403 });
    await prisma.friendship.update({ where: { id: friendship_id }, data: { status: "accepted" } });
    return NextResponse.json({ ok:true });
  } catch {
    return NextResponse.json({ ok:false, error:"Bad request" }, { status:400 });
  }
}
