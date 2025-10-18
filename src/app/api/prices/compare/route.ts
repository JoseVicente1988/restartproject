import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type ReqBody = {
  items: { name: string; qty?: number; barcode?: string }[];
  geo?: { lat: number; lng: number; radiusKm?: number };
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI/180;
  const dLon = (lon2 - lon1) * Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody;
    const items = Array.isArray(body?.items) ? body.items : [];
    if (!items.length) return NextResponse.json({ ok:false, error:"items vacíos" }, { status:400 });

    const lat = body.geo?.lat ?? 0;
    const lng = body.geo?.lng ?? 0;
    const radiusKm = body.geo?.radiusKm ?? 10;

    // Comprobamos si el módulo de precios existe en el schema
    // @ts-ignore - acceder “suave”
    const hasStore = (prisma as any).store && (prisma as any).price && (prisma as any).product;
    if (!hasStore) {
      return NextResponse.json({
        ok:false,
        error:"El módulo de precios no está migrado (faltan Store/Product/Price).",
        hint:"Añade los modelos y ejecuta prisma migrate."
      }, { status:501 });
    }

    // Traer tiendas y filtrar por radio
    // @ts-ignore
    const allStores = await prisma.store.findMany({ select:{ id:true, name:true, lat:true, lng:true, address:true }});
    const stores = (allStores || [])
      .map((s:any) => ({ ...s, distKm: lat && lng ? haversineKm(lat,lng,s.lat,s.lng) : 0 }))
      .filter((s:any) => !lat || !lng || s.distKm <= radiusKm);

    if (!stores.length) {
      return NextResponse.json({ ok:true, results: [], reason:"No hay tiendas en el radio" });
    }

    // Para cada tienda, sumar precios “mejor match”: por barcode si hay, si no por nombre aproximado
    const results: any[] = [];

    for (const s of stores) {
      let total = 0;
      const breakdown: { item: string; qty:number; matched: string|null; price:number|null }[] = [];

      for (const it of items) {
        const qty = Math.max(1, it.qty ?? 1);

        let priceRow: any = null;

        if (it.barcode) {
          // @ts-ignore
          priceRow = await prisma.price.findFirst({
            where: { storeId: s.id, product: { barcode: it.barcode } },
            select: { price: true, product: { select: { name: true, barcode: true } } }
          });
        }

        if (!priceRow) {
          // Fallback por nombre (muy simple, LIKE)
          // @ts-ignore
          priceRow = await prisma.price.findFirst({
            where: {
              storeId: s.id,
              product: { name: { contains: it.name, mode:"insensitive" } }
            },
            select: { price: true, product: { select: { name: true, barcode: true } } }
          });
        }

        if (priceRow) {
          total += Number(priceRow.price) * qty;
          breakdown.push({ item: it.name, qty, matched: priceRow.product.name, price: Number(priceRow.price) });
        } else {
          breakdown.push({ item: it.name, qty, matched: null, price: null });
        }
      }

      results.push({
        store: { id: s.id, name: s.name, distKm: s.distKm, address: s.address },
        total,
        breakdown
      });
    }

    results.sort((a,b) => (a.total ?? Number.POSITIVE_INFINITY) - (b.total ?? Number.POSITIVE_INFINITY));

    return NextResponse.json({ ok:true, results });
  } catch (e:any) {
    console.error(e);
    return NextResponse.json({ ok:false, error: e?.message || "Server error" }, { status:500 });
  }
}
