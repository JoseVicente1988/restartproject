// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helpers seguros con esquemas sin unique(name)
async function ensureStoreByName(name: string, lat: number, lng: number, address?: string) {
  let store = await prisma.store.findFirst({ where: { name } });
  if (!store) {
    store = await prisma.store.create({
      data: { name, lat, lng, address: address ?? null },
    });
  }
  return store;
}

async function ensureProductByNameOrBarcode(name: string, barcode?: string | null) {
  let product = null;
  if (barcode && barcode.trim()) {
    product = await prisma.product.findUnique({ where: { barcode } }).catch(() => null);
  }
  if (!product) {
    product = await prisma.product.findFirst({ where: { name } });
  }
  if (!product) {
    product = await prisma.product.create({
      data: { name, barcode: barcode?.trim() || null },
    });
  }
  return product;
}

// Crea o actualiza/inyecta un precio (si existe para esa pareja producto-tienda, lo actualiza; si no, lo crea)
async function upsertPriceByProductStore(
  productId: bigint,
  storeId: bigint,
  price: number,
  currency = "EUR",
) {
  // Como no hay unique compuesto en Price(productId, storeId), simulamos upsert:
  const existing = await prisma.price.findFirst({ where: { productId, storeId } });
  if (existing) {
    await prisma.price.update({
      where: { id: existing.id },
      data: { price, currency },
    });
    return existing.id;
  } else {
    const created = await prisma.price.create({
      data: { productId, storeId, price, currency },
      select: { id: true },
    });
    return created.id;
  }
}

async function main() {
  console.log("Seeding…");

  // ===== Tiendas demo (pon coordenadas reales de tu zona) =====
  const s1 = await ensureStoreByName("MercaCentro", 39.4699, -0.3763, "C/ Central 1");
  const s2 = await ensureStoreByName("Súper Ahorro", 39.4700, -0.3800, "Av. Mar 12");

  // ===== Productos demo =====
  const huevos = await ensureProductByNameOrBarcode("Huevos L docena", "1234567890123");
  const leche = await ensureProductByNameOrBarcode("Leche entera 1L", "2345678901234");
  const panMolde = await ensureProductByNameOrBarcode("Pan de molde 500g");

  // ===== Precios demo =====
  await upsertPriceByProductStore(huevos.id, s1.id, 2.49);
  await upsertPriceByProductStore(huevos.id, s2.id, 2.39);

  await upsertPriceByProductStore(leche.id, s1.id, 0.99);
  await upsertPriceByProductStore(leche.id, s2.id, 1.09);

  await upsertPriceByProductStore(panMolde.id, s1.id, 1.45);
  await upsertPriceByProductStore(panMolde.id, s2.id, 1.29);

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
