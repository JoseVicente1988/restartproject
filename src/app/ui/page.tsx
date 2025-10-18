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

          <div className="row actions" style={{ marginTop: 6 }}>
            <button className="btn-primary" disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </button>
            <a className="btn" href="/ui/register" aria-label="Ir a crear cuenta">
              Crear cuenta
            </a>
          </div>

          <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
            <span className="muted" />
            <a href="/ui/forgot" className="link" aria-label="Recuperar contraseña">
              ¿Olvidaste la contraseña?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
