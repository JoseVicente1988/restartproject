// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function cp(a: bigint, b: bigint) {
  return a < b ? [a, b] as const : [b, a] as const;
}

async function upsertUser(email: string, name: string, password: string) {
  const passwordHash = bcrypt.hashSync(password, 10);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      locale: "es",
      theme: "pastel"
    }
  });
}

async function ensureFriendship(u1: bigint, u2: bigint, requestedBy: bigint) {
  const [a, b] = cp(u1, u2);
  const f = await prisma.friendship.findUnique({
    where: { userA_userB: { userA: a, userB: b } }
  }).catch(() => null);

  if (f) return f;

  return prisma.friendship.create({
    data: {
      userA: a,
      userB: b,
      status: "accepted",
      requestedBy
    }
  });
}

async function seedItems(userId: bigint) {
  // Limpio y vuelvo a crear un set básico de items
  await prisma.item.deleteMany({ where: { userId } });
  await prisma.item.createMany({
    data: [
      { userId, title: "Leche entera 1L", qty: 2, done: false },
      { userId, title: "Huevos L docena", qty: 1, done: false },
      { userId, title: "Pan de molde", qty: 1, done: true }
    ]
  });
}

async function seedGoalsAndFeed(userId: bigint, friendId: bigint) {
  // Metas
  await prisma.goal.deleteMany({ where: { userId } });
  const g1 = await prisma.goal.create({
    data: {
      userId,
      title: "4 semanas completas sin olvidar nada",
      targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // ~30 días
      isPublic: false
    }
  });
  const g2 = await prisma.goal.create({
    data: {
      userId,
      title: "36 huevos en un mes",
      targetDate: null,
      isPublic: true
    }
  });

  // Feed básico
  await prisma.feedPost.deleteMany({ where: { userId } });
  const p1 = await prisma.feedPost.create({
    data: {
      userId,
      content: "Empezando fuerte la lista esta semana 💪"
    }
  });
  const p2 = await prisma.feedPost.create({
    data: {
      userId,
      content: `Meta publicada: ${g2.title}`
    }
  });

  // Likes y comentarios del amigo
  await prisma.feedLike.create({
    data: { postId: p1.id, userId: friendId }
  }).catch(() => null);

  await prisma.feedComment.create({
    data: {
      postId: p1.id,
      userId: friendId,
      text: "¡Dale! Esta semana lo completas fijo 👏"
    }
  });
}

async function seedDMs(a: bigint, b: bigint) {
  // conversa mínima
  await prisma.dM.createMany({
    data: [
      { senderId: a, receiverId: b, text: "¡Hey! ¿Probaste la app ya?" },
      { senderId: b, receiverId: a, text: "Sí, está guay. Voy a invitar a un colega." },
      { senderId: a, receiverId: b, text: "Perfecto, dime si ves el feed." }
    ]
  });
}

async function seedAchievements(userId: bigint) {
  // Logros y progreso
  // Nota: Achievement.code es unique según tu esquema
  const codes = [
    { code: "FIRST_LIST_DONE", title: "Primera lista completada", desc: "Marca todos los items de una lista." },
    { code: "FOUR_WEEKS_PERFECT", title: "4 semanas perfectas", desc: "Completa cuatro semanas sin olvidos." }
  ];

  for (const c of codes) {
    await prisma.achievement.upsert({
      where: { code: c.code },
      create: c,
      update: c
    });
  }

  const first = await prisma.achievement.findUnique({ where: { code: "FIRST_LIST_DONE" } });
  if (first) {
    await prisma.achievementProgress.upsert({
      where: { userId_achievementId: { userId, achievementId: first.id } },
      create: { userId, achievementId: first.id, progress: 1, achieved: true },
      update: { progress: 1, achieved: true }
    });
  }
}

async function main() {
  console.log("Seeding con esquema actual…");

  // Usuarios demo (email es unique)
  const alice = await upsertUser("alice@example.com", "Alice", "password123");
  const bob   = await upsertUser("bob@example.com",   "Bob",   "password123");

  // Amistad aceptada
  await ensureFriendship(alice.id, bob.id, alice.id);

  // Items de Alice
  await seedItems(alice.id);

  // Metas, feed, likes/comentarios
  await seedGoalsAndFeed(alice.id, bob.id);

  // DMs entre ambos
  await seedDMs(alice.id, bob.id);

  // Logros y progreso
  await seedAchievements(alice.id);

  console.log("Seed OK ✅");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
