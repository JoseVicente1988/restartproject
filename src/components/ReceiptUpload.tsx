"use client";

import { useRef, useState } from "react";

type ParsedItem = { name: string; qty?: number; barcode?: string };

export default function ReceiptUpload() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [rawText, setRawText] = useState("");
  const [items, setItems] = useState<ParsedItem[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function runOCR(file: File) {
    // import dinámico para evitar SSR
    const T = await import("tesseract.js");
    const res = await T.recognize(file, "spa", { logger: () => {} });
    return res.data.text || "";
  }

  function quickParse(text: string): ParsedItem[] {
    return text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .map((line) => {
        const mQty = line.match(/(\d+)\s*[xX]?\s*$/);
        const qty = mQty ? parseInt(mQty[1], 10) : undefined;

        const mBarcode = line.match(/\b(\d{8}|\d{13})\b/);
        const barcode = mBarcode ? mBarcode[1] : undefined;

        const name = line.replace(/\s+(\d+)\s*[xX]?\s*$/, "").trim();

        return { name: name || line, qty, barcode };
      })
      .slice(0, 100);
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    setBusy(true);
    setItems([]);
    setRawText("");
    try {
      const text = await runOCR(f);
      setRawText(text);
      setItems(quickParse(text));
    } catch (err: any) {
      console.error(err);
      if (/Cannot find module/.test(String(err?.message))) {
        setError("No se pudo cargar tesseract.js. Ejecuta `npm install tesseract.js`.");
      } else {
        setError(err?.message || "Fallo procesando la imagen.");
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Escanear ticket (OCR)</h3>
        <input ref={inputRef} type="file" accept="image/*" onChange={onPick} disabled={busy} />
      </div>

      {error && (
        <div className="card" style={{ marginTop: 12, borderColor: "var(--err)", color: "var(--err)" }}>
          {error}
        </div>
      )}

      {busy && (
        <div className="muted" style={{ marginTop: 12 }}>
          Procesando imagen… puede tardar unos segundos.
        </div>
      )}

      {!busy && rawText && (
        <div style={{ marginTop: 12 }}>
          <h4 style={{ margin: "8px 0" }}>Texto OCR</h4>
          <textarea
            className="input"
            style={{ minHeight: 140, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              setItems(quickParse(e.target.value));
            }}
          />
        </div>
      )}

      {!busy && items.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h4 style={{ margin: "8px 0" }}>Líneas detectadas</h4>
          <ul className="list">
            {items.map((it, i) => (
              <li key={i} className="item">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{it.name}</div>
                  <div className="meta">
                    {it.qty ? `Cantidad: ${it.qty} · ` : ""}
                    {it.barcode ? `Código: ${it.barcode}` : ""}
                  </div>
                </div>
                {/* Aquí luego puedes lanzar /api/prices/compare con los items + geo */}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
