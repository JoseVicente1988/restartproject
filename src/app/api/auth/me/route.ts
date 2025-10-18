import { withMethods, okJSON } from "@/lib/http";
import { prisma } from "@/lib/db";

async function getHandler(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const m = cookieHeader.match(/(?:^|;\s*)auth=([^;]+)/);
  const token = m ? decodeURIComponent(m[1]) : "";
  if (!token) return okJSON({ ok:false, error:"Unauthorized" }, { status:401 });

  const sess = await prisma.session.findUnique({ where: { token } });
  if (!sess || sess.expiresAt.getTime() < Date.now()) return okJSON({ ok:false, error:"Unauthorized" }, { status:401 });

  const u = await prisma.user.findUnique({
    where: { id: sess.userId },
    select: { id:true, email:true, name:true, createdAt:true, locale:true, theme:true, photoBase64:true }
  });
  if (!u) return okJSON({ ok:false, error:"Unauthorized" }, { status:401 });

  return okJSON({ ok:true, user: { ...u, id: (u.id as any as bigint).toString?.() ?? (u.id as any) }});
}

export const dynamic = "force-dynamic";
export const GET = withMethods({ GET: getHandler });
export const OPTIONS = withMethods({ OPTIONS: async () => okJSON({}, { status:204 }) });
