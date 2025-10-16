import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clearAuthCookie } from "@/lib/cookies";

export async function POST() {
  const user = getUserFromCookie();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await prisma.user.delete({ where: { id: user.id } });
  clearAuthCookie();
  return NextResponse.json({ ok: true });
}
