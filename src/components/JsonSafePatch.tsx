"use client";

/**
 * Parche global para hacer response.json() tolerante:
 * - cuerpo vacío -> {}
 * - cuerpo no-JSON -> Error legible con preview del texto
 * No toca tu fetch() ni headers, sólo Response.prototype.json.
 */
export default function JsonSafePatch() {
  // Ejecuta UNA sola vez en el navegador
  if (typeof window !== "undefined") {
    const proto = Response.prototype as any;
    if (!proto.__jsonPatched) {
      const origJson = proto.json;
      Object.defineProperty(proto, "__jsonPatched", { value: true, configurable: false });

      proto.json = async function jsonPatched(this: Response) {
        try {
          // Clonamos para no consumir el flujo original si alguien lo necesita
          const clone = this.clone();
          const text = await clone.text();

          // 204 o cuerpo vacío -> objeto vacío
          if (!text || text.trim() === "") return {};

          // Si parece JSON, parseamos; si peta, damos error claro
          try {
            return JSON.parse(text);
          } catch {
            const preview = text.slice(0, 300).replace(/\s+/g, " ");
            throw new Error(
              `Respuesta no JSON (status ${this.status}). ` +
              `Preview: ${preview}${text.length > 300 ? "…" : ""}`
            );
          }
        } catch (e) {
          // Como fallback final, intentamos el json nativo (por si el body ya fue consumido)
          try { return await (origJson.call(this)); } catch { throw e; }
        }
      };
    }
  }
  return null;
}
