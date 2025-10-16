import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = getUserFromCookie();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { title } = await req.json();
  const item = await prisma.shoppingItem.create({ data: { userId: user.id, title } });
  return NextResponse.json(item);
}
