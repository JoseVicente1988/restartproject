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
    <div className="min-h-screen grid place-items-center p-4 bg-grad">
      <div className="login-card">
        <div className="login-header">
          <h1>GroFriends</h1>
          <p>Listas, metas, feed y amigos — rápido y sin humo.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            className="inp" required
          />
          <input
            placeholder="Password (min 8)"
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            className="inp" required minLength={8}
          />
          <div className="btn-row">
            <button disabled={busy} className="btn-primary">
              {busy ? "…" : "Entrar"}
            </button>
            <button type="button" disabled={busy} onClick={onRegister} className="btn-ghost">
              Crear cuenta
            </button>
          </div>
        </form>

        {msg && <div className="login-msg">{msg}</div>}
      </div>
    </div>
  );
}
