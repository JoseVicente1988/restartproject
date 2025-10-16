import { getUserFromCookie } from "@/lib/auth";
import Container from "@/components/Container";
import NavBar from "@/components/NavBar";
import ThemeToggle from "@/components/ThemeToggle";
import LangSwitch from "@/components/LangSwitch";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = getUserFromCookie();
  const locale = (user?.id ? "es" : "es") as "es" | "en";

  return (
    <>
      <NavBar locale={locale} />
      <Container>
        <div className="flex items-center gap-3 mb-4">
          <ThemeToggle />
          <LangSwitch locale={locale} />
          <div className="ml-auto flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm opacity-80">{user.name}</span>
                <form action={`/${locale}/logout`} method="post">
                  <button className="btn" formAction="/(auth)/logout">Salir</button>
                </form>
              </>
            ) : (
              <>
                <Link className="btn" href={`/${locale}/login`}>Entrar</Link>
                <Link className="btn" href={`/${locale}/register`}>Crear cuenta</Link>
              </>
            )}
          </div>
        </div>
        {children}
      </Container>
    </>
  );
}
