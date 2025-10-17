import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { goalCreateSchema } from "@/lib/validation";
import { json } from "@/lib/utils";

export async function GET() {
  try {
    const u = await currentUser();
    if (!u) return json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const goals = await prisma.goal.findMany({
      where: { userId: BigInt(u.id) },
      orderBy: { id: "asc" },
    });

    return json({ ok: true, goals });
  } catch (err: any) {
    return json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const u = await currentUser();
    if (!u) return json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = goalCreateSchema.parse(body);

    const g = await prisma.goal.create({
      data: { userId: BigInt(u.id), title: data.title, targetDate: data.target_date ? new Date(data.target_date) : null },
    });

    return json({ ok: true, goal_id: g.id }, { status: 201 });
  } catch (err: any) {
    return json({ ok: false, error: err?.message || "Bad request" }, { status: 400 });
  }
}
