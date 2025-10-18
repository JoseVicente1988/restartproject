import { withMethods, okJSON } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function postHandler(req: Request) {
  const u = await currentUser(); if (!u) return okJSON({ ok:false, error:"Unauthorized" }, { status:401 });
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

export const dynamic = "force-dynamic";
export const POST = withMethods({ POST: postHandler });
export const OPTIONS = withMethods({ OPTIONS: async () => okJSON({}, { status:204 }) });
