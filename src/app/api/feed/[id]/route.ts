import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  const pid = BigInt(params.id);
  const comments = await prisma.$queryRawUnsafe<any[]>(`
    SELECT c.id, c.text, c.created_at as "createdAt", u.name, u.email
    FROM "FeedComment" c JOIN "User" u ON u.id = c.user_id
    WHERE c.post_id = ${pid}
    ORDER BY c.id ASC
  `);
  return NextResponse.json({ ok:true, comments });
}
