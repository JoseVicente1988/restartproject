"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [name, setName] = useState("");
  const [q, setQ] = useState(""); // pregunta de seguridad
  const [a, setA] = useState(""); // respuesta de seguridad
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
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="title-row">
          <div className="title">Crear cuenta</div>
          <span className="badge">Nuevo</span>
        </div>

        <div className="note">
          <div className="note-title">Estás en el modo registro</div>
          <div className="note-text">
            Esta pantalla es distinta al login. Añade una pregunta y respuesta de seguridad para
            recuperar tu cuenta si olvidas la contraseña.
          </div>
        </div>

        <form onSubmit={onSubmit} className="form">
          <input
            className="input"
            type="text"
            placeholder="Nombre (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />

          <input
            className="input"
            type="text"
            placeholder="Pregunta de seguridad (mín. 8 caracteres)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            required
            minLength={8}
          />
          <input
            className="input"
            type="text"
            placeholder="Respuesta de seguridad"
            value={a}
            onChange={(e) => setA(e.target.value)}
            required
            minLength={2}
          />

          {msg && <div className="alert">{msg}</div>}

          <div className="actions">
            <a className="btn" href="/ui" aria-label="Volver al login">
              Volver al login
            </a>
            <button className="btn-primary" disabled={loading}>
              {loading ? "Creando…" : "Crear y entrar"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .auth-wrap {
          min-height: 100svh;
          display: grid;
          place-items: center;
          padding: 24px;
          color: var(--ink, #e8e8ea);
          background:
            radial-gradient(1000px 500px at 10% -10%, rgba(125, 211, 252, 0.07), transparent 40%),
            radial-gradient(800px 400px at 110% 0%, rgba(167, 139, 250, 0.07), transparent 40%),
            linear-gradient(180deg, var(--bg, #0b0c10) 0%, #0d1016 100%);
          font: 14px/1.5 system-ui, Segoe UI, Roboto, Apple Color Emoji, Noto Color Emoji;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          background: var(--card, #14161b);
          border: 1px solid var(--border, #23252c);
          border-radius: 16px;
          padding: 18px 16px 16px;
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.35), 0 2px 0 rgba(255, 255, 255, 0.02) inset;
          position: relative;
          isolation: isolate;
        }
        .auth-card::before {
          content: "";
          position: absolute;
          inset: -24px;
          border-radius: 24px;
          background:
            radial-gradient(500px 200px at 30% -40%, rgba(125, 211, 252, 0.12), transparent 50%),
            radial-gradient(500px 200px at 70% -40%, rgba(167, 139, 250, 0.12), transparent 50%);
          filter: blur(18px);
          z-index: -1;
        }
        .title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .title {
          font-weight: 800;
          letter-spacing: 0.2px;
          font-size: 20px;
        }
        .badge {
          padding: 4px 8px;
          border-radius: 999px;
          background: #1a1e27;
          border: 1px solid var(--border, #23252c);
          color: var(--muted, #9aa0a6);
          font-size: 12px;
        }
        .muted {
          color: var(--muted, #9aa0a6);
        }
        .note {
          border: 1px solid var(--border, #23252c);
          background: var(--chip, #0f1116);
          border-radius: 12px;
          padding: 10px 12px;
          margin: 0 0 12px 0;
        }
        .note-title {
          font-weight: 700;
          margin-bottom: 6px;
        }
        .note-text {
          font-size: 13px;
          color: var(--muted, #9aa0a6);
        }
        .form {
          display: grid;
          gap: 10px;
        }
        .input {
          width: 100%;
          padding: 11px 12px;
          border-radius: 12px;
          border: 1px solid var(--border, #23252c);
          background: #0f1116;
          color: var(--ink, #e8e8ea);
          outline: none;
        }
        .input:focus {
          border-color: #2e3240;
          box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.08);
        }
        .alert {
          border: 1px solid var(--err, #fca5a5);
          color: var(--err, #fca5a5);
          background: rgba(252, 165, 165, 0.05);
          border-radius: 12px;
          padding: 10px 12px;
        }
        .actions {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: space-between;
          min-height: 44px;
          margin-top: 6px;
        }
        .btn-primary {
          padding: 10px 14px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(90deg, rgba(125, 211, 252, 0.9), rgba(167, 139, 250, 0.9));
          color: #07131a;
          font-weight: 800;
          cursor: pointer;
        }
        .btn {
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid var(--border, #23252c);
          background: #1a1e27;
          color: var(--ink, #e8e8ea);
          cursor: pointer;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
