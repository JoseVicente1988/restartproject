"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg("Autenticando…");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const j = await r.json();
      if (!j?.ok) { setMsg(j?.error || "Error"); setBusy(false); return; }
      setMsg(null);
      window.location.href = "/app";
    } catch (err: any) {
      setMsg(String(err?.message || err));
      setBusy(false);
    }
  };

  const onRegister = async () => {
    setBusy(true); setMsg("Creando cuenta…");
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, name: "" }),
      });
      const j = await r.json();
      if (!j?.ok) { setMsg(j?.error || "Error"); setBusy(false); return; }
      setMsg("Cuenta creada. Ahora inicia sesión.");
      setBusy(false);
    } catch (e: any) {
      setMsg(String(e?.message || e));
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] shadow-[0_10px_60px_rgba(0,0,0,.35)] bg-[var(--card)] p-6">
        <h1 className="text-3xl font-extrabold mb-2">GroFriends</h1>
        <p className="text-[var(--muted)] mb-6">Listas, metas, feed y amigos — rápido y sin humo.</p>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0f1116] text-[var(--ink)] border border-[var(--border)]"
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0f1116] text-[var(--ink)] border border-[var(--border)]"
            required
            minLength={8}
          />
          <div className="flex gap-2 pt-2">
            <button
              disabled={busy}
              className="px-4 py-2 rounded-lg font-bold bg-[var(--acc)] text-[#082431]"
            >
              {busy ? "…" : "Entrar"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onRegister}
              className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--chip)] text-[var(--ink)]"
            >
              Crear cuenta
            </button>
          </div>
        </form>

        {msg && <div className="mt-4 text-sm">{msg}</div>}
      </div>
    </div>
  );
}
