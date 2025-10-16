// src/app/(dashboard)/layout.tsx
import Link from "next/link";
type Locale = "es" | "en";

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const { locale } = params;

  return (
    <header>
      <Link
        className="btn"
        href={{ pathname: "/[locale]/login", query: { locale } }}
      >
        Entrar
      </Link>

      <Link
        className="btn"
        href={{ pathname: "/[locale]/register", query: { locale } }}
      >
        Crear cuenta
      </Link>
    </header>
  );
}
  