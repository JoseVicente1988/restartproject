import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  const id = BigInt(params.id);
  const g = await prisma.goal.findUnique({ where: { id } });
  if (!g || g.userId !== BigInt(u.id)) return NextResponse.json({ ok:false, error:"Not found" }, { status:404 });
  await prisma.goal.update({ where: { id }, data: { isPublic: true } });
  await prisma.feedPost.create({ data: { userId: BigInt(u.id), goalId: id, content: `Meta publicada: ${g.title}` } });
  return NextResponse.json({ ok:true });
}
