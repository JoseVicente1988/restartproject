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
      <div className="auth-card">
        <div className="title-row">
          <div className="title">GroFriends</div>
          <span className="badge">Beta</span>
        </div>

        <p className="muted lead">Tu lista de la compra con feed, metas y amigos.</p>

        <form onSubmit={onSubmit} className="form">
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

          {msg && <div className="alert">{msg}</div>}

          <div className="actions">
            <button className="btn-primary" disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </button>
            <a className="btn" href="/ui/register" aria-label="Ir a crear cuenta">
              Crear cuenta
            </a>
          </div>

          <div className="foot">
            <span />
            <a href="/ui/forgot" className="link" aria-label="Recuperar contraseña">
              ¿Olvidaste la contraseña?
            </a>
          </div>
        </form>
      </div>

      {/* estilos locales, no dependen de globals.css */}
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
        .lead {
          margin: 0 0 14px 0;
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
          min-height: 44px; /* fija altura de botones */
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
        .foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }
        .link {
          color: var(--acc, #7dd3fc);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
