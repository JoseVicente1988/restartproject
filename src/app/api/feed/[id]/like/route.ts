import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  const pid = BigInt(params.id);
  const liked = await prisma.feedLike.findUnique({ where: { postId_userId: { postId: pid, userId: BigInt(u.id) } } });
  if (liked) {
    await prisma.feedLike.delete({ where: { postId_userId: { postId: pid, userId: BigInt(u.id) } } });
  } else {
    await prisma.feedLike.create({ data: { postId: pid, userId: BigInt(u.id) } });
  }
  const count = await prisma.feedLike.count({ where: { postId: pid } });
  return NextResponse.json({ ok:true, like_count: count, liked: !liked });
}
