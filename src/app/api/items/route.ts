import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { itemCreateSchema } from "@/lib/validation";

type Geo = { lat?: number; lng?: number; radiusKm?: number };

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

async function findCheapestByName(
  name: string,
  geo?: Geo
): Promise<{ storeId: bigint; storeName: string; price: number } | null> {
  // comprobar que existen Store/Product/Price
  // @ts-ignore
  const hasStore = (prisma as any).store && (prisma as any).price && (prisma as any).product;
  if (!hasStore) return null;

  const n = name.trim();
  if (!n) return null;

  const lat = Number(geo?.lat ?? NaN);
  const lng = Number(geo?.lng ?? NaN);
  const radiusKm = Number(geo?.radiusKm ?? 10);

  // @ts-ignore
  const allStores = await prisma.store.findMany({
    select: { id: true, name: true, lat: true, lng: true, address: true },
  });

  let stores = allStores || [];
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    stores = stores
      .map((s: any) => ({ ...s, distKm: haversineKm(lat, lng, s.lat, s.lng) }))
      .filter((s: any) => s.distKm <= radiusKm);
  }

  if (!stores.length) return null;

  let best: { storeId: bigint; storeName: string; price: number } | null = null;

  for (const s of stores) {
    // @ts-ignore
    const priceRow = await prisma.price.findFirst({
      where: {
        storeId: s.id,
        product: { name: { contains: n, mode: "insensitive" } },
      },
      select: {
        price: true,
        product: { select: { name: true } },
        store: { select: { id: true, name: true } },
      },
    });

    if (priceRow) {
      const p = Number(priceRow.price);
      if (best === null || p < best.price) {
        best = { storeId: priceRow.store.id as bigint, storeName: priceRow.store.name, price: p };
      }
    }
  }

  return best;
}

export async function GET() {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });

  const items = await prisma.item.findMany({
    where: { userId: BigInt(u.id) },
    orderBy: [{ done: "asc" }, { id: "desc" }],
    select: { id:true, title:true, qty:true, note:true, done:true, createdAt:true }
  });

  const mapped = items.map(it => ({
    id: String(it.id),
    title: it.title,
    qty: it.qty,
    note: it.note,
    done: it.done,
    createdAt: it.createdAt
  }));

  return NextResponse.json({ ok:true, items: mapped });
}

export async function POST(req: Request) {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });

  try {
    const raw = await req.json();
    const data = itemCreateSchema.parse({ title: raw.title, qty: raw.qty, note: raw.note });
    const geo: Geo | undefined = raw?.geo;

    const created = await prisma.item.create({
      data: { userId: BigInt(u.id), title: data.title, qty: data.qty, note: data.note ?? null }
    });

    // Si al crear la lista quedó vacía de pendientes => publicar logro
    const remaining = await prisma.item.count({ where: { userId: BigInt(u.id), done: false } });
    if (remaining === 0) {
      await prisma.feedPost.create({ data: { userId: BigInt(u.id), content: "¡Lista completada hoy! 🏁" } });
    }

    // 1) Buscar precio más barato dentro del radio (Price)
    let suggestion = await findCheapestByName(data.title, geo);

    // 2) Si no hay en Price, usar memoria del usuario (UserKnownPrice)
    if (!suggestion) {
      const known = await prisma.userKnownPrice.findFirst({
        where: { userId: BigInt(u.id), name: data.title },
        include: { store: { select: { id: true, name: true } } }
      });
      if (known) {
        suggestion = { storeId: known.storeId, storeName: known.store.name, price: Number(known.price) };
      }
    }

    // 3) Actualizar memoria si encontramos algo mejor
    if (suggestion) {
      const existing = await prisma.userKnownPrice.findFirst({
        where: { userId: BigInt(u.id), name: data.title },
      });
      if (!existing || Number(existing.price) > suggestion.price) {
        if (existing) {
          await prisma.userKnownPrice.update({
            where: { id: existing.id },
            data: { storeId: suggestion.storeId, price: suggestion.price },
          });
        } else {
          await prisma.userKnownPrice.create({
            data: { userId: BigInt(u.id), name: data.title, storeId: suggestion.storeId, price: suggestion.price },
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      id: String(created.id),
      suggestion: suggestion
        ? { storeId: String(suggestion.storeId), storeName: suggestion.storeName, price: suggestion.price }
        : null
    }, { status: 201 });

  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok:false, error:"Bad request" }, { status:400 });
  }
}
