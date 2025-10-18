import { prisma } from "../src/lib/db";

async function main(){
  // Tiendas demo (pon lat/lng reales de tu zona)
  const s1 = await prisma.store.upsert({
    where: { name: "MercaCentro" },
    update: {},
    create: { name: "MercaCentro", address: "C/ Central 1", lat: 39.4699, lng: -0.3763 }
  });
  const s2 = await prisma.store.upsert({
    where: { name: "Súper Ahorro" },
    update: {},
    create: { name: "Súper Ahorro", address: "Av. Mar 12", lat: 39.47, lng: -0.38 }
  });

  // Productos demo
  const huevos = await prisma.product.upsert({
    where: { name: "Huevos L docena" },
    update: {},
    create: { name: "Huevos L docena", barcode: "1234567890123" }
  });
  const leche = await prisma.product.upsert({
    where: { name: "Leche entera 1L" },
    update: {},
    create: { name: "Leche entera 1L", barcode: "2345678901234" }
  });

  // Precios
  await prisma.price.upsert({
    where: { id: BigInt(1) },
    update: { price: 2.49 },
    create: { productId: huevos.id, storeId: s1.id, price: 2.49, currency: "EUR" }
  });
  await prisma.price.upsert({
    where: { id: BigInt(2) },
    update: { price: 2.39 },
    create: { productId: huevos.id, storeId: s2.id, price: 2.39, currency: "EUR" }
  });
  await prisma.price.upsert({
    where: { id: BigInt(3) },
    update: { price: 0.99 },
    create: { productId: leche.id, storeId: s1.id, price: 0.99, currency: "EUR" }
  });
  await prisma.price.upsert({
    where: { id: BigInt(4) },
    update: { price: 1.09 },
    create: { productId: leche.id, storeId: s2.id, price: 1.09, currency: "EUR" }
  });

  console.log("Seed OK");
}

main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});
