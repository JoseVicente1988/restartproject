"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const r = await fetch("/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: pwd }),
      });
      const j = await r.json();
      if (!j?.ok) {
        setMsg(j?.error || "Error al iniciar sesión");
      } else {
        // Cookie de sesión la pone el backend; aquí solo navegamos
        window.location.href = "/app";
      }
    } catch (err: any) {
      setMsg(err?.message || "Error de red");
    } finally {
      setLoading(false);
    }
  }

  async function onRegister() {
    setMsg("");
    setLoading(true);
    try {
      // registro rápido en la misma pantalla
      const r = await fetch("/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: email.split("@")[0],
          password: pwd,
        }),
      });
      const j = await r.json();
      if (!j?.ok) {
        setMsg(j?.error || "No se pudo crear la cuenta");
      } else {
        // tras crear, logueamos directo
        const r2 = await fetch("/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password: pwd }),
        });
        const j2 = await r2.json();
        if (!j2?.ok) {
          setMsg(j2?.error || "Cuenta creada, pero el login falló");
        } else {
          window.location.href = "/app";
        }
      }
    } catch (err: any) {
      setMsg(err?.message || "Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center-wrap">
      <div className="center-card">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div className="title">GroFriends</div>
          <span className="badge">Beta</span>
        </div>

        <p className="muted" style={{ marginTop: 0, marginBottom: 14 }}>
          Tu lista de la compra con feed, metas y amigos.
        </p>

        <form onSubmit={onSubmit} className="grid" style={{ gap: 10 }}>
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            className="input"
            type="password"
            placeholder="Contraseña (mín. 8)"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
            minLength={8}
            autoComplete="current-password"
          />

          {msg && (
            <div className="card" style={{ borderColor: "var(--err)", color: "var(--err)" }}>
              {msg}
            </div>
          )}

          <div className="row" style={{ justifyContent: "space-between", marginTop: 6 }}>
            <button className="btn-primary" disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={onRegister}
              disabled={loading}
              title="Crear cuenta con los mismos datos de arriba"
            >
              {loading ? "Creando…" : "Crear cuenta"}
            </button>
          </div>
        </form>

        <div className="hr" />

        <div className="muted" style={{ fontSize: 12, textAlign: "center" }}>
          Consejito: usa una contraseña larga. Nosotros la guardamos hasheada.
        </div>
      </div>
    </div>
  );
}
