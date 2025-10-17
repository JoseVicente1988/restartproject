"use client";

import { useState } from "react";
import { Sun, Moon, Settings, Trash2, User } from "lucide-react";

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("pastel");

  const toggleTheme = () => {
    const newTheme =
      theme === "pastel" ? "light" : theme === "light" ? "dark" : "pastel";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleDelete = async () => {
    if (!confirm("¿Seguro que quieres borrar tu cuenta? Esta acción no se puede deshacer.")) return;

    const res = await fetch("/api/account/delete", { method: "POST" });
    if (res.ok) {
      window.location.href = "/";
    } else {
      const body = await res.json();
      alert("Error al borrar cuenta: " + body.error);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full bg-white shadow hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
      >
        <Settings className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 border border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
            <span>Cambiar tema ({theme})</span>
          </button>

          <button
            onClick={() => alert("Aquí iría el formulario de edición de datos")}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
          >
            <User className="w-4 h-4" />
            <span>Editar datos</span>
          </button>

          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Borrar cuenta</span>
          </button>
        </div>
      )}
    </div>
  );
}
