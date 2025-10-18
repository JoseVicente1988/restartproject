import { withMethods, okJSON } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function postHandler(_req: Request, { params }: { params: { id: string } }) {
  const u = await currentUser(); if (!u) return okJSON({ ok:false, error:"Unauthorized" }, { status:401 });
  const id = BigInt(params.id);
  const g = await prisma.goal.findUnique({ where: { id } });
  if (!g || g.userId !== BigInt(u.id)) return okJSON({ ok:false, error:"Not found" }, { status:404 });
  await prisma.goal.update({ where: { id }, data: { isPublic: true } });
  await prisma.feedPost.create({ data: { userId: BigInt(u.id), content: `Meta publicada: ${g.title}` } });
  return okJSON({ ok:true });
}

export const dynamic = "force-dynamic";
export const POST = (req: Request, ctx: any) => withMethods({ POST: (r)=>postHandler(r, ctx) })(req);
export const OPTIONS = withMethods({ OPTIONS: async () => okJSON({}, { status:204 }) });
