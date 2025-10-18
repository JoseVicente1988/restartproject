import { withMethods, okJSON } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function postHandler(_req: Request, { params }: { params: { id: string } }) {
  const u = await currentUser(); if (!u) return okJSON({ ok:false, error:"Unauthorized" }, { status:401 });
  const pid = BigInt(params.id);
  const me = BigInt(u.id);

  const liked = await prisma.feedLike.findUnique({ where: { postId_userId: { postId: pid, userId: me } } });
  if (liked) await prisma.feedLike.delete({ where: { postId_userId: { postId: pid, userId: me } } });
  else await prisma.feedLike.create({ data: { postId: pid, userId: me } });

  const count = await prisma.feedLike.count({ where: { postId: pid } });
  return okJSON({ ok:true, like_count: count, liked: !liked });
}

export const dynamic = "force-dynamic";
export const POST = (req: Request, ctx: any) => withMethods({ POST: (r)=>postHandler(r, ctx) })(req);
export const OPTIONS = withMethods({ OPTIONS: async () => okJSON({}, { status:204 }) });
