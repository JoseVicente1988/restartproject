"use client";
import { useState } from "react";
import { api } from "@/lib/api";

type Mode = "login" | "register";

export default function AuthPage(){
  const [mode, setMode] = useState<Mode>("login");
  const [email,setEmail] = useState("");
  const [name,setName] = useState("");
  const [password,setPassword] = useState("");
  const [msg,setMsg] = useState("");

  const swap = () => {
    setMode(m => (m === "login" ? "register" : "login"));
    setMsg("");
  };

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    setMsg(mode === "login" ? "Autenticando…" : "Creando usuario…");
    try{
      if (mode === "login") {
        const j = await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: email.trim().toLowerCase(), password })
        });
        if (j.ok) window.location.href = "/app";
      } else {
        const j = await api("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim(), password })
        });
        if (j.ok) {
          setMsg("Cuenta creada. Entrando…");
          const j2 = await api("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email: email.trim().toLowerCase(), password })
          });
          if (j2.ok) window.location.href = "/app";
        }
      }
    } catch (err: any) {
      setMsg(err?.message || "Error");
    }
  }

  return (
    <main className="center-wrap">
      <div className="auth-card">
        <div className="auth-head">
          <div className="auth-brand">G</div>
          <div>
            <div className="auth-title">{mode === "login" ? "GroFriends — Iniciar sesión" : "GroFriends — Crear cuenta"}</div>
            <div className="auth-sub">{mode === "login" ? "Accede a tu cuenta" : "Es gratis y rápido"}</div>
          </div>
        </div>
        <form className="auth-form" onSubmit={onSubmit}>
          <input
            className="input"
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={e=>setEmail(e.target.value)}
          />
          {mode === "register" && (
            <input
              className="input"
              type="text"
              placeholder="Nombre (opcional)"
              value={name}
              onChange={e=>setName(e.target.value)}
            />
          )}
          <input
            className="input"
            type="password"
            placeholder={mode === "login" ? "Password" : "Password (min 8)"}
            required
            minLength={8}
            value={password}
            onChange={e=>setPassword(e.target.value)}
          />
          <div className="auth-actions">
            <button className="btn" type="submit">
              {mode === "login" ? "Entrar" : "Registrar y entrar"}
            </button>
            <button
              className="btn secondary"
              type="button"
              onClick={swap}
              aria-label={mode === "login" ? "Cambiar a registro" : "Cambiar a login"}
            >
              {mode === "login" ? "Crear cuenta" : "Ya tengo cuenta"}
            </button>
          </div>
          {msg && (
            <div
              className="small-muted"
              style={{
                color: msg.startsWith("Autenticando") || msg.startsWith("Creando") ? "var(--muted)"
                     : msg.startsWith("Cuenta creada") ? "var(--ok)"
                     : "var(--err)"
              }}
            >
              {msg}
            </div>
          )}
        </form>
        <div className="hr-text">o</div>
        <div className="small-muted">
          {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button className="btn ghost" onClick={swap} type="button" style={{padding: "6px 10px"}}>
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </div>
      </div>
    </main>
  );
}
