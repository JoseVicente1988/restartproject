import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET() {
  const u = await currentUser();
  if (!u) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  // logros base del sistema
  const defaults = [
    { code: "first_item", title: "Primer producto", description: "Añadiste tu primer producto 🛒", icon: "🥇" },
    { code: "list_completed", title: "Lista completada", description: "Completaste tu primera lista ✅", icon: "🏁" },
    { code: "ten_items", title: "Organizado", description: "Has añadido 10 productos a tus listas 📦", icon: "🗂️" },
  ];

  for (const d of defaults) {
    await prisma.achievement.upsert({
      where: { code: d.code },
      update: {},
      create: d,
    });
  }

  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId: BigInt(u.id) },
    include: { achievement: true },
  });

  return NextResponse.json({
    ok: true,
    achievements: userAchievements.map((a) => ({
      id: a.achievement.id,
      code: a.achievement.code,
      title: a.achievement.title,
      description: a.achievement.description,
      icon: a.achievement.icon,
      achievedAt: a.achievedAt,
    })),
  });
}
