import { withMethods, okJSON } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getHandler(req: Request) {
  const u = await currentUser(); if (!u) return okJSON({ ok:false, error:"Unauthorized" }, { status:401 });
  const url = new URL(req.url);
  const friendId = BigInt(url.searchParams.get("friend_id") || "0");
  if (!friendId) return okJSON({ ok:false, error:"Missing friend_id" }, { status:400 });

  const me = BigInt(u.id);
  const [a,b] = me < friendId ? [me, friendId] : [friendId, me];
  const fr = await prisma.friendship.findUnique({ where: { userA_userB: { userA: a, userB: b } } });
  if (!fr || fr.status !== "accepted") return okJSON({ ok:false, error:"Not friends" }, { status:403 });

  const limit  = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") ?? "20", 10)));
  const offset = Math.max(0, Math.min(1_000_000, parseInt(url.searchParams.get("offset") ?? "0", 10)));

  const msgs = await prisma.dM.findMany({
    where: { OR: [ { senderId: me, receiverId: friendId }, { senderId: friendId, receiverId: me } ] },
    orderBy: { id: "desc" }, take: limit, skip: offset
  });

  const mapped = msgs.map(m => ({
    id: m.id.toString(),
    text: m.text,
    createdAt: m.createdAt,
    mine: m.senderId === me,
    senderId: m.senderId.toString()
  }));
  return okJSON({ ok:true, messages: mapped });
}

export const dynamic = "force-dynamic";
export const GET = withMethods({ GET: getHandler });
export const OPTIONS = withMethods({ OPTIONS: async () => okJSON({}, { status:204 }) });
