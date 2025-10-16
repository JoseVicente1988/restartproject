"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function LangSwitch({ locale }: { locale: "es" | "en" }) {
  const [val, setVal] = useState(locale);
  const router = useRouter();
  const pathname = usePathname();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const l = e.target.value;
    setVal(l as any);
    const parts = pathname.split("/");
    parts[1] = l;
    router.push(parts.join("/"));
  }

  return (
    <select className="input max-w-xs" value={val} onChange={onChange}>
      <option value="es">ES</option>
      <option value="en">EN</option>
    </select>
  );
}
