import { withMethods, okJSON } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function postHandler(_req: Request, { params }: { params: { id: string } }) {
  const u = await currentUser(); if (!u) return okJSON({ ok:false, error:"Unauthorized" }, { status:401 });
  const id = BigInt(params.id);
  const it = await prisma.item.findUnique({ where: { id } });
  if (!it || it.userId !== BigInt(u.id)) return okJSON({ ok:false, error:"Not found" }, { status:404 });
  await prisma.item.update({ where: { id }, data: { done: !it.done } });
  return okJSON({ ok:true });
}

export const dynamic = "force-dynamic";
// Next pasa params al 2º argumento de handlers exportados como const
export const POST = (req: Request, ctx: any) => withMethods({ POST: (r)=>postHandler(r, ctx) })(req);
export const OPTIONS = withMethods({ OPTIONS: async () => okJSON({}, { status:204 }) });
