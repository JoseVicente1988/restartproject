"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const j = await api("/api/auth/register", {
        method: "POST",
        body: {
          email: email.trim().toLowerCase(),
          name: name.trim() || email.split("@")[0],
          password: pwd,
        },
      });
      if (!j?.ok) {
        setMsg(j?.error || "No se pudo crear la cuenta");
      } else {
        const j2 = await api("/api/auth/login", {
          method: "POST",
          body: { email: email.trim().toLowerCase(), password: pwd },
        });
        if (!j2?.ok) setMsg(j2?.error || "Cuenta creada, pero el login falló");
        else window.location.href = "/app";
      }
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
            <div className="auth-title">Crear cuenta</div>
            <span className="badge">Nuevo</span>
          </div>
          <a className="btn ghost" href="/ui" aria-label="Volver al login">
            Volver
          </a>
        </div>

        <div className="card" style={{ background: "var(--chip)" }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Estás en el modo registro</div>
          <div className="muted" style={{ fontSize: 13 }}>
            Crea tu cuenta y entrarás directo. Puedes volver al login cuando quieras.
          </div>
        </div>

        {msg && (
          <div className="card" style={{ borderColor: "var(--err)", color: "var(--err)", marginTop: 10 }}>
            {msg}
          </div>
        )}

        <form onSubmit={onSubmit} className="auth-form" style={{ marginTop: 12 }} autoComplete="on" noValidate>
          <input
            className="input"
            type="text"
            placeholder="Nombre (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            aria-label="Nombre"
          />
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
            autoComplete="new-password"
            aria-label="Contraseña"
          />

          <div className="auth-actions">
            <a className="btn secondary" href="/ui" aria-label="Volver al login">
              Ya tengo cuenta
            </a>
            <button className="btn-primary" disabled={loading} aria-label="Crear y entrar">
              {loading ? "Creando…" : "Crear y entrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
