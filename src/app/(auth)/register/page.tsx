"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });
    if (res.ok) window.location.href = "/es";
    else setMsg("No se pudo crear la cuenta (¿email ya usado?)");
  }

  return (
    <main className="container py-10 max-w-md">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-4">Crear cuenta</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="input" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
          <input className="input" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="input" placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="btn w-full">Registrar</button>
        </form>
        {msg && <p className="text-sm text-red-500 mt-2">{msg}</p>}
      </div>
    </main>
  );
}
