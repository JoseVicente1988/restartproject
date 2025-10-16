import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = getUserFromCookie();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const item = await prisma.shoppingItem.findFirst({ where: { id, userId: user.id } });
  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const updated = await prisma.shoppingItem.update({ where: { id }, data: { done: !item.done } });
  return NextResponse.json(updated);
}
