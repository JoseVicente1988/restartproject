import { withMethods, okJSON } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function postHandler(req: Request) {
  const u = await currentUser(); if (!u) return okJSON({ ok:false, error:"Unauthorized" }, { status:401 });
  const { friendship_id } = await req.json().catch(()=>({}));
  const id = BigInt(friendship_id || 0);
  const fr = await prisma.friendship.findUnique({ where: { id } });
  if (!fr) return okJSON({ ok:false, error:"Not found" }, { status:404 });
  const me = BigInt(u.id);
  if (fr.userA !== me && fr.userB !== me) return okJSON({ ok:false, error:"Forbidden" }, { status:403 });
  await prisma.friendship.delete({ where: { id } });
  return okJSON({ ok:true });
}

export const dynamic = "force-dynamic";
export const POST = withMethods({ POST: postHandler });
export const OPTIONS = withMethods({ OPTIONS: async () => okJSON({}, { status:204 }) });
