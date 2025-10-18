import { withMethods, okJSON } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { goalCreateSchema } from "@/lib/validation";

async function getHandler() {
  const u = await currentUser(); if (!u) return okJSON({ ok:false, error:"Unauthorized" }, { status:401 });
  const goals = await prisma.goal.findMany({ where: { userId: BigInt(u.id) }, orderBy: { id: "asc" } });
  return okJSON({ ok:true, goals });
}

async function postHandler(req: Request) {
  const u = await currentUser(); if (!u) return okJSON({ ok:false, error:"Unauthorized" }, { status:401 });
  try {
    const body = await req.json();
    const data = goalCreateSchema.parse(body);
    const g = await prisma.goal.create({
      data: { userId: BigInt(u.id), title: data.title, targetDate: data.target_date ? new Date(data.target_date) : null }
    });
    return okJSON({ ok:true, goal_id: g.id }, { status:201 });
  } catch {
    return okJSON({ ok:false, error:"Bad request" }, { status:400 });
  }
}

export const dynamic = "force-dynamic";
export const GET  = withMethods({ GET: getHandler });
export const POST = withMethods({ POST: postHandler });
export const OPTIONS = withMethods({ OPTIONS: async () => okJSON({}, { status:204 }) });
