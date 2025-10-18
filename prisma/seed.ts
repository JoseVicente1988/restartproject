// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function cp(a: bigint, b: bigint) {
  return a < b ? [a, b] as const : [b, a] as const;
}

async function upsertUser(email: string, name: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  const passwordHash = bcrypt.hashSync(password, 10);
  return prisma.user.create({
    data: { email, name, passwordHash, locale: "es", theme: "pastel" }
  });
}

async function ensureFriendship(u1: bigint, u2: bigint, requestedBy: bigint) {
  const [a, b] = cp(u1, u2);
  const f = await prisma.friendship.findUnique({
    where: { userA_userB: { userA: a, userB: b } }
  }).catch(() => null);
  if (f) return f;
  return prisma.friendship.create({
    data: { userA: a, userB: b, status: "accepted", requestedBy }
  });
}

async function seedItems(userId: bigint) {
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
  await prisma.goal.deleteMany({ where: { userId } });
  const g2 = await prisma.goal.create({
    data: { userId, title: "36 huevos en un mes", targetDate: null, isPublic: true }
  });
  await prisma.feedPost.deleteMany({ where: { userId } });
  const p1 = await prisma.feedPost.create({
    data: { userId, content: "Empezando fuerte la lista esta semana 💪" }
  });
  await prisma.feedPost.create({
    data: { userId, content: `Meta publicada: ${g2.title}` }
  });
  await prisma.feedLike.create({
    data: { postId: p1.id, userId: friendId }
  }).catch(() => null);
  await prisma.feedComment.create({
    data: { postId: p1.id, userId: friendId, text: "¡Dale! Esta semana lo completas fijo 👏" }
  });
}

async function seedDMs(a: bigint, b: bigint) {
  await prisma.dM.createMany({
    data: [
      { senderId: a, receiverId: b, text: "¡Hey! ¿Probaste la app ya?" },
      { senderId: b, receiverId: a, text: "Sí, está guay. Voy a invitar a un colega." },
      { senderId: a, receiverId: b, text: "Perfecto, dime si ves el feed." }
    ]
  });
}

async function seedAchievements(userId: bigint) {
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

/* ------- NUEVO: Stores / Products / Prices ------- */

async function ensureStore(name: string, lat: number, lng: number, address?: string | null) {
  let s = await prisma.store.findUnique({ where: { name } }).catch(() => null);
  if (!s) s = await prisma.store.create({ data: { name, lat, lng, address: address ?? null } });
  return s;
}

async function ensureProduct(name: string, barcode?: string | null) {
  if (barcode && barcode.trim()) {
    const byBc = await prisma.product.findUnique({ where: { barcode } }).catch(() => null);
    if (byBc) return byBc;
  }
  const byName = await prisma.product.findFirst({ where: { name } });
  if (byName) return byName;
  return prisma.product.create({ data: { name, barcode: barcode?.trim() || null } });
}

async function upsertPrice(productId: bigint, storeId: bigint, price: number, currency = "EUR") {
  const unique = await prisma.price.findUnique({
    where: { productId_storeId: { productId, storeId } }
  }).catch(() => null);
  if (unique) {
    await prisma.price.update({ where: { id: unique.id }, data: { price, currency } });
    return unique;
  }
  return prisma.price.create({ data: { productId, storeId, price, currency } });
}

async function seedPrices() {
  const s1 = await ensureStore("MercaCentro", 39.4699, -0.3763, "C/ Central 1");
  const s2 = await ensureStore("Súper Ahorro", 39.4700, -0.3800, "Av. Mar 12");

  const huevos = await ensureProduct("Huevos L docena", "1234567890123");
  const leche  = await ensureProduct("Leche entera 1L",  "2345678901234");
  const pan    = await ensureProduct("Pan de molde 500g");

  await upsertPrice(huevos.id, s1.id, 2.49);
  await upsertPrice(huevos.id, s2.id, 2.39);

  await upsertPrice(leche.id, s1.id, 0.99);
  await upsertPrice(leche.id, s2.id, 1.09);

  await upsertPrice(pan.id, s1.id, 1.45);
  await upsertPrice(pan.id, s2.id, 1.29);
}

/* -------------------------------------------------- */

async function main() {
  console.log("Seeding…");

  const alice = await upsertUser("alice@example.com", "Alice", "password123");
  const bob   = await upsertUser("bob@example.com",   "Bob",   "password123");

  await ensureFriendship(alice.id, bob.id, alice.id);
  await seedItems(alice.id);
  await seedGoalsAndFeed(alice.id, bob.id);
  await seedDMs(alice.id, bob.id);
  await seedAchievements(alice.id);

  await seedPrices();

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
