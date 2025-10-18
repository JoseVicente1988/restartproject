// src/app/api/prices/compare/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = parseFloat(url.searchParams.get("lat") ?? "0");
  const lng = parseFloat(url.searchParams.get("lng") ?? "0");
  const radiusKm = Math.max(0, Math.min(50, parseFloat(url.searchParams.get("radiusKm") ?? "5")));

  const q = (url.searchParams.get("q") || "").trim();
  const barcodesParam = (url.searchParams.get("barcodes") || "").trim();

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ ok: false, error: "Invalid coordinates" }, { status: 400 });
  }
  if (!q && !barcodesParam) {
    return NextResponse.json({ ok: false, error: "Provide q or barcodes" }, { status: 400 });
  }

  // 1) Tiendas candidatas por distancia (filtramos en Node)
  const allStores = await prisma.store.findMany({
    select: { id: true, name: true, lat: true, lng: true, address: true }
  });
  const stores = allStores
    .map((s) => ({ ...s, distKm: haversineKm(lat, lng, s.lat, s.lng) }))
    .filter((s) => s.distKm <= radiusKm)
    .sort((a, b) => a.distKm - b.distKm);

  if (!stores.length) {
    return NextResponse.json({
      ok: true,
      stores: [],
      products: [],
      cheapest: [],
      totalsByStore: [],
      message: "No hay tiendas en el radio indicado."
    });
  }

  // 2) Productos solicitados
  const names = q
    ? q
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const barcodes = barcodesParam
    ? barcodesParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Buscar productos por barcode (unique) o por nombre (icontains)
  const productsByBarcode = barcodes.length
    ? await prisma.product.findMany({ where: { barcode: { in: barcodes } } })
    : [];

  // Para nombres, aceptamos varias coincidencias; nos quedamos con la más parecida
  const productsByName = names.length
    ? await prisma.product.findMany({
        where: {
          OR: names.map((n) => ({ name: { contains: n, mode: "insensitive" as const } }))
        }
      })
    : [];

  // Reducimos a un set de productos objetivo
  const targetProductsMap = new Map<bigint, { id: bigint; name: string; barcode: string | null }>();

  for (const p of productsByBarcode) {
    targetProductsMap.set(p.id, { id: p.id, name: p.name, barcode: p.barcode });
  }

  // Para cada nombre pedido, si hay varias coincidencias, coge la más corta (heurística simple)
  for (const n of names) {
    const matches = productsByName.filter((p) =>
      p.name.toLowerCase().includes(n.toLowerCase())
    );
    if (matches.length) {
      matches.sort((a, b) => a.name.length - b.name.length);
      const p = matches[0];
      targetProductsMap.set(p.id, { id: p.id, name: p.name, barcode: p.barcode });
    }
  }

  const targetProducts = Array.from(targetProductsMap.values());
  if (!targetProducts.length) {
    return NextResponse.json({
      ok: true,
      stores,
      products: [],
      cheapest: [],
      totalsByStore: [],
      message: "No se encontraron productos que coincidan."
    });
  }

  // 3) Traemos todos los precios para esos products y stores
  const storeIds = stores.map((s) => s.id);
  const productIds = targetProducts.map((p) => p.id);

  const prices = await prisma.price.findMany({
    where: {
      storeId: { in: storeIds },
      productId: { in: productIds }
    },
    include: {
      store: { select: { id: true, name: true } },
      product: { select: { id: true, name: true, barcode: true } }
    }
  });

  // 4) Mejor precio por producto
  type CheapestRow = {
    productId: bigint;
    productName: string;
    barcode: string | null;
    storeId: bigint;
    storeName: string;
    price: number;
  };

  const cheapestMap = new Map<bigint, CheapestRow>();
  for (const p of prices) {
    const key = p.productId;
    const maybe = cheapestMap.get(key);
    if (!maybe || p.price < maybe.price) {
      cheapestMap.set(key, {
        productId: p.productId,
        productName: p.product.name,
        barcode: p.product.barcode,
        storeId: p.storeId,
        storeName: p.store.name,
        price: p.price
      });
    }
  }
  const cheapest = Array.from(cheapestMap.values()).sort((a, b) =>
    a.productName.localeCompare(b.productName, "es")
  );

  // 5) Totales por tienda (sumando el precio más barato de cada producto si corresponde a esa tienda)
  const totalsMap = new Map<bigint, { storeId: bigint; storeName: string; total: number; items: number }>();
  for (const s of stores) {
    totalsMap.set(s.id, { storeId: s.id, storeName: s.name, total: 0, items: 0 });
  }
  for (const ch of cheapest) {
    const t = totalsMap.get(ch.storeId);
    if (t) {
      t.total += ch.price;
      t.items += 1;
    }
  }
  const totalsByStore = Array.from(totalsMap.values())
    .filter((t) => t.items > 0)
    .sort((a, b) => a.total - b.total);

  return NextResponse.json({
    ok: true,
    stores,
    products: targetProducts,
    cheapest,
    totalsByStore
  });
}
