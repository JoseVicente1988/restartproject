"use client";
import { useRef, useState } from "react";
import Tesseract from "tesseract.js";

type ParsedItem = { name: string; qty?: number; barcode?: string };

export default function ReceiptUpload(){
  const [img, setImg] = useState<string>("");
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const latRef = useRef<HTMLInputElement>(null);
  const lngRef = useRef<HTMLInputElement>(null);
  const radiusRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>){
    setError(""); setResult(null); setItems([]);
    const f = e.target.files?.[0]; if(!f) return;
    const url = URL.createObjectURL(f);
    setImg(url);
  }

  function roughParseLines(text: string): ParsedItem[] {
    // Heurística simple: líneas con “producto … precio”
    const lines = text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    const out: ParsedItem[] = [];
    for(const ln of lines){
      // quita números aislados tipo totales o IVA
      if(/total|iva|cambio|pago|sum|subtotal/i.test(ln)) continue;
      // quantities tipo "x2", "2x"
      const mQty = ln.match(/\b(x?\s*\d{1,3})\b/i);
      const qty = mQty ? parseInt(mQty[0].replace(/[^\d]/g,""),10) : undefined;
      // limpia basura
      const name = ln.replace(/[€$]\s*\d+[.,]?\d*/g,"").replace(/\b(x?\s*\d{1,3})\b/i,"").replace(/\s{2,}/g," ").trim();
      if(name.length >= 2) out.push({ name, qty });
    }
    // dedup aproximado (muy básico)
    const seen = new Set<string>();
    return out.filter(it=>{
      const k = it.name.toLowerCase();
      if(seen.has(k)) return false; seen.add(k); return true;
    }).slice(0, 50);
  }

  async function runOCR(){
    if(!img) return;
    setBusy(true); setError(""); setItems([]);
    try{
      const { data } = await Tesseract.recognize(img, "spa+eng", {
        tessedit_char_blacklist: "_~^`'’“”",
      } as any);
      const parsed = roughParseLines(data.text || "");
      setItems(parsed);
    }catch(e:any){
      setError(e?.message || "OCR falló");
    }finally{
      setBusy(false);
    }
  }

  async function useMyLocation(){
    setError("");
    try{
      await new Promise<void>((res,rej)=>{
        navigator.geolocation.getCurrentPosition(
          (pos)=>{
            if(latRef.current) latRef.current.value = String(pos.coords.latitude);
            if(lngRef.current) lngRef.current.value = String(pos.coords.longitude);
            res();
          },
          (err)=>rej(err),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      });
    }catch{ setError("No se pudo obtener tu ubicación"); }
  }

  async function compare(){
    setError(""); setResult(null);
    const lat = parseFloat(latRef.current?.value || "");
    const lng = parseFloat(lngRef.current?.value || "");
    const radiusKm = parseFloat(radiusRef.current?.value || "5");
    if(!Number.isFinite(lat) || !Number.isFinite(lng)){
      setError("Lat/Lng inválidos (usa el botón de ubicación o rellena manual)");
      return;
    }
    const clean = items
      .map(i => ({ name: i.name.trim(), qty: i.qty ? Math.max(1, i.qty) : 1, barcode: i.barcode?.trim() || undefined }))
      .filter(i => i.name.length>=2);

    if(!clean.length){ setError("No hay ítems"); return; }

    const r = await fetch("/api/prices/compare",{
      method:"POST",
      headers:{ "content-type":"application/json" },
      body: JSON.stringify({ items: clean, lat, lng, radiusKm })
    });
    const j = await r.json();
    if(!j?.ok) setError(j?.error || "Error en comparación");
    else setResult(j);
  }

  return (
    <div className="card" style={{ padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>Comparador desde ticket</h3>

      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <input type="file" accept="image/*" onChange={onPick} />
        <button className="btn" onClick={runOCR} disabled={!img || busy}>{busy ? "Leyendo…" : "Leer ticket"}</button>
        <div style={{ marginLeft: "auto" }} />
        <button className="btn" onClick={useMyLocation}>Usar mi ubicación</button>
        <input ref={latRef} className="input" placeholder="Lat" style={{ maxWidth: 120 }} />
        <input ref={lngRef} className="input" placeholder="Lng" style={{ maxWidth: 120 }} />
        <input ref={radiusRef} className="input" placeholder="Radio km (5)" defaultValue="5" style={{ maxWidth: 120 }} />
        <button className="btn-primary" onClick={compare} disabled={!items.length}>Comparar</button>
      </div>

      {img && (
        <div style={{ marginTop: 10 }}>
          <img src={img} alt="ticket" style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid var(--border)" }} />
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <h4 style={{ margin: "8px 0" }}>Ítems detectados</h4>
        {!items.length && <div className="muted">Ninguno aún. Sube foto y pulsa “Leer ticket”.</div>}
        {items.map((it, idx)=>(
          <div key={idx} className="row" style={{ gap: 6, marginBottom: 6 }}>
            <input
              className="input"
              value={it.name}
              onChange={e=>{
                const arr=[...items]; arr[idx].name=e.target.value; setItems(arr);
              }}
              style={{ flex: 1 }}
            />
            <input
              className="input"
              type="number"
              min={1}
              value={it.qty ?? 1}
              onChange={e=>{
                const arr=[...items]; arr[idx].qty=parseInt(e.target.value||"1",10); setItems(arr);
              }}
              style={{ width: 80 }}
            />
            <input
              className="input"
              placeholder="barcode opcional"
              value={it.barcode ?? ""}
              onChange={e=>{
                const arr=[...items]; arr[idx].barcode=e.target.value; setItems(arr);
              }}
              style={{ width: 160 }}
            />
          </div>
        ))}
      </div>

      {error && <div className="card" style={{ borderColor: "var(--err)", color: "var(--err)" }}>{error}</div>}

      {result && (
        <div className="card" style={{ marginTop: 12 }}>
          <h4 style={{ marginTop: 0 }}>Resultados</h4>
          <div className="muted">Tiendas en radio: {result.stores.length}</div>
          <ul className="list" style={{ marginTop: 8 }}>
            {result.products.map((p:any, i:number)=>(
              <li key={i} className="item" style={{ alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div><strong>{p.product?.name || p.req.name}</strong>{p.product?.name ? "" : " (no mapeado)"}</div>
                  <div className="muted">qty: {p.req.qty ?? 1}</div>
                </div>
                <div>
                  {p.best
                    ? <span className="badge">Mejor: {p.best.storeName} — {p.best.price.toFixed(2)} {p.best.currency}</span>
                    : <span className="badge">Sin precio</span>}
                </div>
              </li>
            ))}
          </ul>

          <div className="hr" />
          <div><strong>Cesta (mejor por ítem):</strong> {result.basket.bestPerItemSum.toFixed(2)} €</div>
          {result.basket.bestSingleStore && (
            <div style={{ marginTop: 6 }}>
              <strong>Mejor tienda única:</strong> {result.basket.bestSingleStore.storeName} — {result.basket.bestSingleStore.total.toFixed(2)} €
              {result.basket.bestSingleStore.missing>0 && <span className="muted"> · faltan {result.basket.bestSingleStore.missing} ítems</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
