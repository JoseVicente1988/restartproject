"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>("system");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "system";
    setTheme(saved);
    apply(saved);
  }, []);

  function apply(val: string) {
    const root = document.documentElement;
    if (val === "dark") root.classList.add("dark");
    else if (val === "light") root.classList.remove("dark");
    else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (mq.matches) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setTheme(val);
    localStorage.setItem("theme", val);
    apply(val);
  }

  return (
    <select className="input max-w-xs" value={theme} onChange={handleChange}>
      <option value="light">Claro</option>
      <option value="dark">Oscuro</option>
      <option value="system">Sistema</option>
    </select>
  );
}
