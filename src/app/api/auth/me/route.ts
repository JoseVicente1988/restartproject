export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const m = cookieHeader.match(/(?:^|;\s*)auth=([^;]+)/);
  const token = m ? decodeURIComponent(m[1]) : "";

  if (!token) return json({ ok: false, error: "Unauthorized" }, 401);

  const sess = await prisma.session.findUnique({ where: { token } });
  if (!sess || sess.expiresAt.getTime() < Date.now()) return json({ ok: false, error: "Unauthorized" }, 401);

  const u = await prisma.user.findUnique({
    where: { id: sess.userId },
    select: { id: true, email: true, name: true, createdAt: true, locale: true, theme: true, photoBase64: true },
  });
  if (!u) return json({ ok: false, error: "Unauthorized" }, 401);

  return json({
    ok: true,
    user: { ...u, id: (u.id as any as bigint).toString?.() ?? (u.id as any) },
  });
}
