"use client";

import { useState } from "react";

function IconSettings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
      <path fill="currentColor" d="M19.14 12.94a7.997 7.997 0 0 0 .06-.94c0-.32-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.13 7.13 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 13.86 1h-3.72a.5.5 0 0 0-.49.41l-.36 2.54c-.58.23-1.12.53-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.27 7.47a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.62-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.4 1.04.72 1.62.94l.36 2.54a.5.5 0 0 0 .49.41h3.72a.5.5 0 0 0 .49-.41l.36-2.54c.58-.22 1.12-.53 1.62-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"/>
    </svg>
  );
}

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"pastel" | "light" | "dark">("pastel");

  const cycleTheme = () => {
    const next = theme === "pastel" ? "light" : theme === "light" ? "dark" : "pastel";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    if (next === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    try { localStorage.setItem("theme_override", next); } catch {}
  };

  const handleDelete = async () => {
    if (!confirm("¿Seguro que quieres borrar tu cuenta? Esta acción no se puede deshacer.")) return;
    const r = await fetch("/api/account/delete", { method: "POST" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j?.ok) {
      alert("Error al borrar cuenta: " + (j?.error || r.statusText));
      return;
    }
    window.location.href = "/ui";
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setOpen(v => !v)}
        className="p-2 rounded-full bg-white shadow hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700"
        aria-label="Abrir ajustes"
      >
        <IconSettings />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 border border-gray-200 dark:border-gray-700">
          <button onClick={cycleTheme} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm">
            <span>Cambiar tema ({theme})</span>
          </button>
          <button onClick={() => alert("Formulario de edición aquí")} className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm">
            Editar datos
          </button>
          <button onClick={handleDelete} className="w-full text-left px-3 py-2 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded text-sm">
            Borrar cuenta
          </button>
        </div>
      )}
    </div>
  );
}
