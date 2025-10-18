import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  const id = BigInt(params.id || "0");
  if (!id) return NextResponse.json({ ok:false, error:"Invalid id" }, { status:400 });

  // Verifica propiedad y alterna
  const it = await prisma.item.findUnique({ where: { id } });
  if (!it || it.userId !== BigInt(u.id)) return NextResponse.json({ ok:false, error:"Not found" }, { status:404 });

  await prisma.item.update({
    where: { id },
    data: { done: !it.done }
  });

  return NextResponse.json({ ok:true });
}
