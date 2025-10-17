import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { itemCreateSchema } from "@/lib/validation";

export async function GET() {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  const items = await prisma.item.findMany({ where: { userId: BigInt(u.id) }, orderBy: [{ done: "asc" }, { id: "desc" }] });
  return NextResponse.json({ ok:true, items });
}

export async function POST(req: Request) {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  try {
    const data = itemCreateSchema.parse(await req.json());
    await prisma.item.create({
      data: { userId: BigInt(u.id), title: data.title, qty: data.qty, note: data.note ?? null }
    });
    const remaining = await prisma.item.count({ where: { userId: BigInt(u.id), done: false } });
    if (remaining === 0) {
      await prisma.feedPost.create({ data: { userId: BigInt(u.id), content: "¡Lista completada hoy! 🏁" } });
    }
    return NextResponse.json({ ok:true }, { status:201 });
  } catch {
    return NextResponse.json({ ok:false, error:"Bad request" }, { status:400 });
  }
}
