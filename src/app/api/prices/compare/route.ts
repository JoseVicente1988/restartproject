import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type ReqItem = { name: string; qty?: number; barcode?: string };

function haversineKm(lat1:number,lng1:number,lat2:number,lng2:number){
  const R=6371; const dLat=(lat2-lat1)*Math.PI/180; const dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}

export async function POST(req: Request){
  try{
    const body = await req.json() as {
      items: ReqItem[];
      lat: number; lng: number;
      radiusKm?: number;
    };

    const { items, lat, lng } = body;
    const radiusKm = Math.max(0.5, Math.min(50, body.radiusKm ?? 5));

    if(!Array.isArray(items) || !items.length) return NextResponse.json({ ok:false, error:"items vacíos" },{status:400});
    if(!Number.isFinite(lat) || !Number.isFinite(lng)) return NextResponse.json({ ok:false, error:"lat/lng inválidos" },{status:400});

    // 1) Tiendas candidatas por distancia (filtramos en Node usando Haversine)
    const allStores = await prisma.store.findMany({ select:{ id:true, name:true, lat:true, lng:true, address:true }});
    const stores = allStores
      .map(s => ({ ...s, distKm: haversineKm(lat,lng,s.lat,s.lng) }))
      .filter(s => s.distKm <= radiusKm)
      .sort((a,b)=>a.distKm-b.distKm);

    if(!stores.length){
      return NextResponse.json({ ok:true, stores: [], products: [], basket: null, note:"No hay tiendas en el radio" });
    }

    // 2) Para cada item, buscamos por barcode o por nombre (ILIKE %name%)
    const results: Array<{
      req: ReqItem;
      product?: { id: bigint; name: string; barcode?: string|null };
      offers: Array<{ storeId: bigint; storeName: string; price: number; currency: string; distKm: number }>;
      best?: { storeId: bigint; storeName: string; price: number; currency: string; distKm: number };
    }> = [];

    for(const reqItem of items){
      let product = null as null | { id: bigint; name: string; barcode?: string|null };

      if(reqItem.barcode){
        const p = await prisma.product.findUnique({ where:{ barcode: reqItem.barcode }, select:{ id:true, name:true, barcode:true } });
        if(p) product = p;
      }
      if(!product){
        // Búsqueda simple por nombre
        const p = await prisma.product.findFirst({
          where: { name: { contains: reqItem.name, mode: "insensitive" } },
          select: { id:true, name:true, barcode:true }
        });
        if(p) product = p;
      }

      let offers: Array<{ storeId: bigint; storeName: string; price: number; currency: string; distKm: number }> = [];

      if(product){
        // Todas las ofertas de ese producto para las tiendas candidatas
        const prices = await prisma.price.findMany({
          where: { productId: product.id, storeId: { in: stores.map(s=>s.id) } },
          select: { price:true, currency:true, storeId:true, store:{ select:{ name:true, lat:true, lng:true } } }
        });
        offers = prices.map(pr => {
          const st = stores.find(s => s.id === pr.storeId)!;
          const priceNum = Number(pr.price);
          return { storeId: pr.storeId, storeName: st?.name || pr.store.name, price: priceNum, currency: pr.currency, distKm: st?.distKm ?? haversineKm(lat,lng,pr.store.lat,pr.store.lng) };
        }).sort((a,b)=>a.price-b.price);
      }

      const best = offers[0];
      results.push({ req: reqItem, product: product||undefined, offers, best });
    }

    // 3) Sugerir cesta total más barata (sumando mejores de cada producto)
    const basketTotal = results.reduce((acc, r)=>{
      const qty = Math.max(1, r.req.qty ?? 1);
      return acc + (r.best ? (r.best.price * qty) : 0);
    }, 0);

    // También propuesta por tienda (si quieres agrupar todo en una tienda)
    const perStoreTotals = new Map<bigint, { storeId: bigint; storeName: string; total: number; missing: number }>();
    for(const st of stores){
      perStoreTotals.set(st.id, { storeId: st.id, storeName: st.name, total: 0, missing: 0 });
    }
    for(const r of results){
      const qty = Math.max(1, r.req.qty ?? 1);
      for(const st of stores){
        const rec = perStoreTotals.get(st.id)!;
        const off = r.offers.find(o => o.storeId === st.id);
        if(off) rec.total += off.price * qty;
        else rec.missing += qty;
      }
    }
    const basketByStore = Array.from(perStoreTotals.values()).sort((a,b)=>a.total-b.total);

    return NextResponse.json({
      ok:true,
      stores,
      products: results,
      basket: {
        bestPerItemSum: Number(basketTotal.toFixed(2)),
        bestSingleStore: basketByStore[0] || null,
        alternatives: basketByStore.slice(1,4)
      }
    });
  }catch(err:any){
    return NextResponse.json({ ok:false, error: err?.message || "Error" }, { status:500 });
  }
}
