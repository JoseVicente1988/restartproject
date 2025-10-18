import { withMethods, okJSON } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function postHandler(req: Request) {
  const u = await currentUser(); if (!u) return okJSON({ ok:false, error:"Unauthorized" }, { status:401 });
  const { friend_id, text } = await req.json().catch(()=>({}));
  const friendId = BigInt(friend_id||0); const t = (text||"").toString().trim();
  if (!friendId || !t) return okJSON({ ok:false, error:"Missing friend_id or text" }, { status:400 });

  const me = BigInt(u.id);
  const [a,b] = me < friendId ? [me, friendId] : [friendId, me];
  const fr = await prisma.friendship.findUnique({ where: { userA_userB: { userA: a, userB: b } } });
  if (!fr || fr.status !== "accepted") return okJSON({ ok:false, error:"Not friends" }, { status:403 });

  await prisma.dM.create({ data: { senderId: me, receiverId: friendId, text: t } });
  return okJSON({ ok:true }, { status:201 });
}

export const dynamic = "force-dynamic";
export const POST = withMethods({ POST: postHandler });
export const OPTIONS = withMethods({ OPTIONS: async () => okJSON({}, { status:204 }) });
