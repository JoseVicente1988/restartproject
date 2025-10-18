// src/app/api/prices/compare/route.ts
import { NextResponse } from "next/server";

/**
 * Endpoint placeholder para comparar precios.
 * No toca Prisma ni modelos inexistentes. Devuelve un resultado vacío
 * hasta que activemos el módulo de tiendas/productos/precios.
 *
 * GET /api/prices/compare?lat=39.47&lng=-0.38&radiusKm=5
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = parseFloat(url.searchParams.get("lat") ?? "0");
  const lng = parseFloat(url.searchParams.get("lng") ?? "0");
  const radiusKm = Math.max(0, Math.min(50, parseFloat(url.searchParams.get("radiusKm") ?? "5")));

  // Validaciones suaves para no romper UI si aún no se envían coords
  const coordsOk = Number.isFinite(lat) && Number.isFinite(lng);

  return NextResponse.json({
    ok: true,
    coordsOk,
    lat,
    lng,
    radiusKm,
    results: [],
    message:
      "El comparador de precios está desactivado en este build (sin modelos Store/Product/Price). " +
      "Cuando se habilite el módulo de precios, este endpoint devolverá resultados reales."
  });
}
