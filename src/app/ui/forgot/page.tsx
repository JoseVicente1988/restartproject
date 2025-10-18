"use client";
import { useState } from "react";
import { api } from "@/lib/api";

type Step = "email" | "question" | "password";

export default function ForgotPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setMsg(""); setLoading(true);
    try {
      const j = await api("/api/auth/reset/initiate", { method: "POST", body: { email: email.trim().toLowerCase() } });
      if (!j?.ok) { setMsg(j?.error || "Error"); return; }
      setQuestion(j.question || null);
      setStep("question");
    } catch (err: any) {
      setMsg(err?.message || "Error de red");
    } finally { setLoading(false); }
  }

  async function submitAnswer(e: React.FormEvent) {
    e.preventDefault();
    setMsg(""); setLoading(true);
    try {
      const j = await api("/api/auth/reset/verify", {
        method: "POST",
        body: { email: email.trim().toLowerCase(), answer: answer.trim() },
      });
      if (!j?.ok || !j.token) { setMsg(j?.error || "Respuesta incorrecta"); return; }
      setToken(j.token);
      setStep("password");
    } catch (err: any) {
      setMsg(err?.message || "Error de red");
    } finally { setLoading(false); }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setMsg(""); setLoading(true);
    try {
      if (pwd1 !== pwd2) { setMsg("Las contraseñas no coinciden"); setLoading(false); return; }
      const j = await api("/api/auth/reset/complete", {
        method: "POST",
        body: {
          email: email.trim().toLowerCase(),
          token,
          new_password: pwd1,
        },
      });
      if (!j?.ok) { setMsg(j?.error || "No se pudo actualizar"); return; }
      // login directo opcional
      const j2 = await api("/api/auth/login", {
        method: "POST",
        body: { email: email.trim().toLowerCase(), password: pwd1 },
      });
      if (j2?.ok) window.location.href = "/app";
      else window.location.href = "/ui";
    } catch (err: any) {
      setMsg(err?.message || "Error de red");
    } finally { setLoading(false); }
  }

  return (
    <div className="center-wrap">
      <div className="center-card">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div className="title">Recuperar acceso</div>
          <span className="badge">Seguro</span>
        </div>

        {step === "email" && (
          <form onSubmit={submitEmail} className="grid" style={{ gap: 10 }}>
            <input className="input" type="email" placeholder="Tu email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {msg && <div className="card" style={{ borderColor: "var(--err)", color: "var(--err)" }}>{msg}</div>}
            <div className="row" style={{ justifyContent: "space-between" }}>
              <a className="btn secondary" href="/ui">Volver</a>
              <button className="btn-primary" disabled={loading}>{loading ? "Cargando…" : "Continuar"}</button>
            </div>
          </form>
        )}

        {step === "question" && (
          <form onSubmit={submitAnswer} className="grid" style={{ gap: 10 }}>
            <div className="card" style={{ background: "var(--chip)" }}>
              <div className="muted" style={{ fontSize: 13 }}>Responde tu pregunta de seguridad.</div>
              <div style={{ fontWeight: 700, marginTop: 6 }}>{question || "Sin pregunta configurada"}</div>
            </div>
            <input className="input" type="text" placeholder="Tu respuesta" value={answer} onChange={(e) => setAnswer(e.target.value)} required />
            {msg && <div className="card" style={{ borderColor: "var(--err)", color: "var(--err)" }}>{msg}</div>}
            <div className="row" style={{ justifyContent: "space-between" }}>
              <button type="button" className="btn secondary" onClick={() => setStep("email")}>Atrás</button>
              <button className="btn-primary" disabled={loading}>{loading ? "Verificando…" : "Verificar"}</button>
            </div>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={submitPassword} className="grid" style={{ gap: 10 }}>
            <input className="input" type="password" placeholder="Nueva contraseña (mín. 8)" value={pwd1} onChange={(e) => setPwd1(e.target.value)} required minLength={8} />
            <input className="input" type="password" placeholder="Repite la contraseña" value={pwd2} onChange={(e) => setPwd2(e.target.value)} required minLength={8} />
            {msg && <div className="card" style={{ borderColor: "var(--err)", color: "var(--err)" }}>{msg}</div>}
            <div className="row" style={{ justifyContent: "space-between" }}>
              <button type="button" className="btn secondary" onClick={() => setStep("question")}>Atrás</button>
              <button className="btn-primary" disabled={loading}>{loading ? "Guardando…" : "Cambiar contraseña"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
