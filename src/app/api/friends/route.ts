import { withMethods, okJSON } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getHandler() {
  const u = await currentUser(); if (!u) return okJSON({ ok:false, error:"Unauthorized" }, { status:401 });
  const me = BigInt(u.id);
  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT f.id, f."userA" as "userA", f."userB" as "userB", f.status, f."requestedBy" as "requestedBy",
           CASE WHEN f."userA" = ${me} THEN f."userB" ELSE f."userA" END AS "friendId",
           u.name as "friendName", u.email as "friendEmail"
    FROM "Friendship" f
    JOIN "User" u ON u.id = CASE WHEN f."userA" = ${me} THEN f."userB" ELSE f."userA" END
    WHERE (f."userA" = ${me} OR f."userB" = ${me})
    ORDER BY f.id DESC
  `);
  return okJSON({ ok:true, friends: rows });
}

async function postHandler(req: Request) {
  const u = await currentUser(); if (!u) return okJSON({ ok:false, error:"Unauthorized" }, { status:401 });
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  if (action === "invite") {
    const { email } = await req.json().catch(()=>({}));
    if (!email || typeof email !== "string") return okJSON({ ok:false, error:"Invalid email" }, { status:400 });
    const other = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!other) return okJSON({ ok:false, error:"User not found" }, { status:404 });
    const me = BigInt(u.id);
    if (other.id === me) return okJSON({ ok:false, error:"Cannot invite yourself" }, { status:400 });
    const [a,b] = me < other.id ? [me, other.id] : [other.id, me];
    const existing = await prisma.friendship.findUnique({ where: { userA_userB: { userA: a, userB: b } } });
    if (existing) return okJSON({ ok:false, error:"Already invited or friends" }, { status:409 });
    await prisma.friendship.create({ data: { userA: a, userB: b, status: "pending", requestedBy: me } });
    return okJSON({ ok:true }, { status:201 });
  }

  if (action === "accept") {
    const { friendship_id } = await req.json().catch(()=>({}));
    const id = BigInt(friendship_id||0);
    const fr = await prisma.friendship.findUnique({ where: { id } });
    if (!fr) return okJSON({ ok:false, error:"Not found" }, { status:404 });
    const me = BigInt(u.id);
    if (fr.userA !== me && fr.userB !== me) return okJSON({ ok:false, error:"Forbidden" }, { status:403 });
    await prisma.friendship.update({ where: { id }, data: { status: "accepted" } });
    return okJSON({ ok:true });
  }

  if (action === "remove") {
    const { friendship_id } = await req.json().catch(()=>({}));
    const id = BigInt(friendship_id||0);
    const fr = await prisma.friendship.findUnique({ where: { id } });
    if (!fr) return okJSON({ ok:false, error:"Not found" }, { status:404 });
    const me = BigInt(u.id);
    if (fr.userA !== me && fr.userB !== me) return okJSON({ ok:false, error:"Forbidden" }, { status:403 });
    await prisma.friendship.delete({ where: { id } });
    return okJSON({ ok:true });
  }

  return okJSON({ ok:false, error:"Missing ?action=invite|accept|remove" }, { status:400 });
}

export const dynamic = "force-dynamic";
export const GET = withMethods({ GET: getHandler });
export const POST = withMethods({ POST: postHandler });
export const OPTIONS = withMethods({ OPTIONS: async () => okJSON({}, { status:204 }) });
