import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  const me = BigInt(u.id);
  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT f.id, f.user_a as "userA", f.user_b as "userB", f.status, f.requested_by as "requestedBy",
           CASE WHEN f.user_a = ${me} THEN f.user_b ELSE f.user_a END AS "friendId",
           u.name as "friendName", u.email as "friendEmail"
    FROM "Friendship" f
    JOIN "User" u ON u.id = CASE WHEN f.user_a = ${me} THEN f.user_b ELSE f.user_a END
    WHERE (f.user_a = ${me} OR f.user_b = ${me})
    ORDER BY f.id DESC
  `);
  return NextResponse.json({ ok:true, friends: rows });
}
