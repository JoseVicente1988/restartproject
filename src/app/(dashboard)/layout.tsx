// src/app/(dashboard)/layout.tsx
import Link from "next/link";
// si no lo tienes ya:
type Locale = "es" | "en";

export default function Layout({ children, params }: { children: React.ReactNode; params: { locale: Locale } }) {
  const { locale } = params;

  return (
    <header>
      {/* … */}
      {/* antes: <Link href={`/${locale}/login`}>Entrar</Link> */}
      <Link
        className="btn"
        href={{ pathname: "/[locale]/login", params: { locale } }}
      >
        Entrar
      </Link>

      {/* antes: <Link href={`/${locale}/register`}>Crear cuenta</Link> */}
      <Link
        className="btn"
        href={{ pathname: "/[locale]/register", params: { locale } }}
      >
        Crear cuenta
      </Link>
      {/* … */}
    </header>
  );
}
