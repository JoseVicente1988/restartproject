import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const u = await currentUser();
    if (!u) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = BigInt(u.id);

    // Elimina datos relacionados manualmente si no tienes ON DELETE CASCADE
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.item.deleteMany({ where: { userId } });
    await prisma.goal.deleteMany({ where: { userId } });
    await prisma.feedPost.deleteMany({ where: { userId } });
    await prisma.friendship.deleteMany({
      where: { OR: [{ userA: userId }, { userB: userId }] },
    });
    await prisma.dM.deleteMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    });

    // Por último, borra el usuario
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
