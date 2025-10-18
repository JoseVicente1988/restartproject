import { withMethods, okJSON } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getHandler() {
  const u = await currentUser(); if (!u) return okJSON({ ok:false, error:"Unauthorized" }, { status:401 });
  const me = BigInt(u.id);
  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT f.id, f."userA", f."userB", f.status, f."requestedBy",
           CASE WHEN f."userA" = ${me} THEN f."userB" ELSE f."userA" END AS "friendId",
           u.name as "friendName", u.email as "friendEmail"
    FROM "Friendship" f
    JOIN "User" u ON u.id = CASE WHEN f."userA" = ${me} THEN f."userB" ELSE f."userA" END
    WHERE (f."userA" = ${me} OR f."userB" = ${me})
    ORDER BY f.id DESC
  `);

  const friends = rows.map(r => ({
    id: r.id.toString(),
    userA: r.userA?.toString?.() ?? r.userA,
    userB: r.userB?.toString?.() ?? r.userB,
    status: r.status,
    requestedBy: r.requestedBy?.toString?.() ?? r.requestedBy,
    friendId: r.friendId?.toString?.() ?? r.friendId,
    friendName: r.friendName,
    friendEmail: r.friendEmail
  }));

  return okJSON({ ok:true, friends });
}

export const dynamic = "force-dynamic";
export const GET = withMethods({ GET: getHandler });
export const OPTIONS = withMethods({ OPTIONS: async () => okJSON({}, { status:204 }) });
