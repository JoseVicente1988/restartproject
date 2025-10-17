import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  const id = BigInt(params.id);
  const it = await prisma.item.findUnique({ where: { id } });
  if (!it || it.userId !== BigInt(u.id)) return NextResponse.json({ ok:false, error:"Not found" }, { status:404 });
  await prisma.item.delete({ where: { id } });
  return NextResponse.json({ ok:true });
}
