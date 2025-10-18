export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() { return new NextResponse(null, { status: 204 }); }
export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }

export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const m = cookieHeader.match(/(?:^|;\s*)auth=([^;]+)/);
  const token = m ? decodeURIComponent(m[1]) : "";
  if (token) { try { await prisma.session.delete({ where: { token } }); } catch {} }

  const res = json({ ok: true }, 200);
  res.headers.append("Set-Cookie", "auth=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure");
  return res;
}
