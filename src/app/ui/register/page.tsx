"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [name, setName] = useState("");
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
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
          security_question: q.trim(),
          security_answer: a.trim(),
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
    <div className="center-wrap">
      <div className="center-card">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div className="title">Crear cuenta</div>
          <span className="badge">Nuevo</span>
        </div>

        <div className="card" style={{ background: "var(--chip)" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Estás en el modo registro</div>
          <div className="muted" style={{ fontSize: 13 }}>
            Añade una pregunta y respuesta de seguridad. Te permitirá recuperar tu contraseña si la olvidas.
          </div>
        </div>

        <form onSubmit={onSubmit} className="grid" style={{ gap: 10, marginTop: 12 }}>
          <input className="input" type="text" placeholder="Nombre (opcional)" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <input className="input" type="password" placeholder="Contraseña (mín. 8)" value={pwd} onChange={(e) => setPwd(e.target.value)} required minLength={8} autoComplete="new-password" />

          <input className="input" type="text" placeholder="Pregunta de seguridad (mín. 8 caracteres)" value={q} onChange={(e) => setQ(e.target.value)} required minLength={8} />
          <input className="input" type="text" placeholder="Respuesta de seguridad" value={a} onChange={(e) => setA(e.target.value)} required minLength={2} />

          {msg && <div className="card" style={{ borderColor: "var(--err)", color: "var(--err)" }}>{msg}</div>}

          <div className="row" style={{ justifyContent: "space-between", marginTop: 6 }}>
            <a className="btn secondary" href="/ui" aria-label="Volver al login">Volver al login</a>
            <button className="btn-primary" disabled={loading}>{loading ? "Creando…" : "Crear y entrar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
