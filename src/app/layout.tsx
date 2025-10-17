import "./globals.css";
import { currentUser } from "@/lib/auth";
import SettingsMenu from "@/components/SettingsMenu";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser().catch(() => null);
  return (
    <html lang="es">
      <body className="min-h-screen bg-[linear-gradient(180deg,var(--bg),#0d1016)] text-[var(--ink)]">
        {u ? <SettingsMenu /> : null}
        {children}
      </body>
    </html>
  );
}
