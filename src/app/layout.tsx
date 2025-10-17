import "./globals.css";
import SettingsMenu from "@/components/SettingsMenu";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition">
        <SettingsMenu />
        {children}
      </body>
    </html>
  );
}
