import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { json } from "@/lib/utils";

export async function GET() {
  try {
    const u = await currentUser();
    if (!u) return json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const me = BigInt(u.id);
    const rows = await prisma.$queryRawUnsafe<any[]>(`
      SELECT f.id,
             f."userA"        as "userA",
             f."userB"        as "userB",
             f.status,
             f."requestedBy"  as "requestedBy",
             CASE WHEN f."userA" = ${me} THEN f."userB" ELSE f."userA" END AS "friendId",
             u.name           as "friendName",
             u.email          as "friendEmail"
      FROM "Friendship" f
      JOIN "User" u ON u.id = CASE WHEN f."userA" = ${me} THEN f."userB" ELSE f."userA" END
      WHERE (f."userA" = ${me} OR f."userB" = ${me})
      ORDER BY f.id DESC
    `);

    return json({ ok: true, friends: rows });
  } catch (err: any) {
    return json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
