"use client";

import { useState } from "react";
import { api } from "@/lib/api";

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
      const j = await api("/api/auth/login", {
        method: "POST",
        body: { email: email.trim().toLowerCase(), password: pwd },
      });
      if (!j?.ok) setMsg(j?.error || "Error al iniciar sesión");
      else window.location.href = "/app";
    } catch (err: any) {
      setMsg(err?.message || "Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-head">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="auth-title">GroFriends</div>
            <span className="badge">Beta</span>
          </div>
          <span className="badge">simple · rápido</span>
        </div>

        <p className="auth-sub">Tu lista de la compra con feed, metas y amigos.</p>

        {msg && (
          <div className="card" style={{ borderColor: "var(--err)", color: "var(--err)" }}>
            {msg}
          </div>
        )}

        <form onSubmit={onSubmit} className="auth-form" autoComplete="on" noValidate>
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            aria-label="Email"
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
            aria-label="Contraseña"
          />

          <div className="auth-actions">
            <button className="btn-primary" disabled={loading} aria-label="Entrar">
              {loading ? "Entrando…" : "Entrar"}
            </button>
            <a className="btn secondary" href="/ui/register" aria-label="Ir a crear cuenta">
              Crear cuenta
            </a>
          </div>
        </form>

        <div style={{ height: 10 }} />

        <div className="auth-note">
          ¿Nuevo por aquí? Crea tu cuenta en un paso y te redirigimos al panel.
        </div>
      </div>
    </div>
  );
}
