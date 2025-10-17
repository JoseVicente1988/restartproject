import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { friendInviteSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  try {
    const data = friendInviteSchema.parse(await req.json());
    const other = await prisma.user.findUnique({ where: { email: data.email } });
    if (!other) return NextResponse.json({ ok:false, error:"User not found" }, { status:404 });
    if (other.id === u.id) return NextResponse.json({ ok:false, error:"Cannot invite yourself" }, { status:400 });

    const a = BigInt(u.id) < BigInt(other.id) ? BigInt(u.id) : BigInt(other.id);
    const b = BigInt(u.id) < BigInt(other.id) ? BigInt(other.id) : BigInt(u.id);
    const existing = await prisma.friendship.findUnique({ where: { userA_userB: { userA: a, userB: b } } });
    if (existing) return NextResponse.json({ ok:false, error:"Already invited or friends" }, { status:409 });

    await prisma.friendship.create({
      data: { userA: a, userB: b, status: "pending", requestedBy: BigInt(u.id) }
    });
    return NextResponse.json({ ok:true }, { status:201 });
  } catch {
    return NextResponse.json({ ok:false, error:"Bad request" }, { status:400 });
  }
}
