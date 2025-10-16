import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = getUserFromCookie();
  if (!user) return NextResponse.json([], { status: 200 });
  const items = await prisma.shoppingItem.findMany({ where: { userId: user.id }, orderBy: [{ done: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json(items);
}
