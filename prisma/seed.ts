// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function ensureStore(name: string, lat: number, lng: number, address?: string | null) {
  let s = await prisma.store.findUnique({ where: { name } }).catch(() => null);
  if (!s) s = await prisma.store.create({ data: { name, lat, lng, address: address ?? null } });
  return s;
}

async function ensureProduct(name: string, barcode?: string | null) {
  const code = barcode ?? `AUTO-${name.toLowerCase().replace(/\s+/g, "-")}`;
  let p = await prisma.product.findUnique({ where: { barcode: code } }).catch(() => null);
  if (!p) p = await prisma.product.create({ data: { name, barcode: code } });
  return p;
}

async function ensurePrice(productId: bigint, storeId: bigint, price: number, currency = "EUR") {
  // Clave única (productId, storeId)
  await prisma.price.upsert({
    where: { productId_storeId: { productId, storeId } },
    create: { productId, storeId, price, currency },
    update: { price, currency }
  });
}

async function main() {
  console.log("Seeding...");

  // Tiendas de ejemplo
  const mc = await ensureStore("MercaCentro", 40.4168, -3.7038, "C/ Mayor 1, Madrid");
  const sa = await ensureStore("Súper Ahorro", 40.4297, -3.7006, "Av. Barata 99, Madrid");

  // Productos de ejemplo
  const huevos = await ensureProduct("Huevos L docena", "8400000000012");
  const leche  = await ensureProduct("Leche entera 1L", "8400000000029");

  // Precios
  await ensurePrice(huevos.id, mc.id, 2.19);
  await ensurePrice(huevos.id, sa.id, 1.99);
  await ensurePrice(leche.id,  mc.id, 0.95);
  await ensurePrice(leche.id,  sa.id, 0.89);

  console.log("Seed OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
