"use client";

import { useState } from "react";

function IconSettings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
      <path fill="currentColor" d="M19.14 12.94a7.997 7.997 0 0 0 .06-.94c0-.32-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.13 7.13 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 13.86 1h-3.72a.5.5 0 0 0-.49.41l-.36 2.54c-.58.23-1.12.53-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.27 7.47a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.62-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.4 1.04.72 1.62.94l.36 2.54a.5.5 0 0 0 .49.41h3.72a.5.5 0 0 0 .49-.41l.36-2.54c.58-.22 1.12-.53 1.62-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"/>
    </svg>
  );
}
function IconSun(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden {...props}>
      <path fill="currentColor" d="M6.76 4.84 5.34 3.42 3.92 4.84l1.42 1.42 1.42-1.42ZM1 13h3v-2H1v2Zm10 10h2v-3h-2v3ZM20.08 4.84 18.66 3.42l-1.42 1.42 1.42 1.42 1.42-1.42ZM20 11v2h3v-2h-3Zm-8-6h2V2h-2v3ZM6.76 19.16l-1.42 1.42 1.42 1.42 1.42-1.42-1.42-1.42Zm9.9 0-1.42 1.42 1.42 1.42 1.42-1.42-1.42-1.42ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/>
    </svg>
  );
}
function IconMoon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden {...props}>
      <path fill="currentColor" d="M21 12.79A9 9 0 0 1 11.21 3c-.31 0-.62.02-.93.05A7 7 0 1 0 21 12.79Z"/>
    </svg>
  );
}
function IconUser(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden {...props}>
      <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14Z"/>
    </svg>
  );
}
function IconTrash(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden {...props}>
      <path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2Zm2 7h2v8h-2v-8Zm-4 0h2v8H7v-8Zm8 0h2v8h-2v-8Z"/>
    </svg>
  );
}

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"pastel" | "light" | "dark">("pastel");

  const cycleTheme = () => {
    const next = theme === "pastel" ? "light" : theme === "light" ? "dark" : "pastel";
    setTheme(next);
    // Usa data-theme, que ya manejas en tu CSS (pastel/light/dark)
    document.documentElement.setAttribute("data-theme", next);
    // Si además tienes variantes dark por clase:
    if (next === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    // Guarda preferencia local
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
    // Logout visual
    window.location.href = "/ui";
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-full bg-white shadow hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700"
        aria-label="Abrir ajustes"
      >
        <IconSettings />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 border border-gray-200 dark:border-gray-700">
          <button
            onClick={cycleTheme}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
          >
            {theme === "light" ? <IconMoon /> : <IconSun />}
            <span>Cambiar tema ({theme})</span>
          </button>

          <button
            onClick={() => alert("Aquí iría el formulario de edición de datos")}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
          >
            <IconUser />
            <span>Editar datos</span>
          </button>

          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded text-sm"
          >
            <IconTrash />
            <span>Borrar cuenta</span>
          </button>
        </div>
      )}
    </div>
  );
}
