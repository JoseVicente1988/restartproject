import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Tema guardado en localStorage (client) con fallback a "pastel"
  const theme = "pastel";
  return (
    <html lang="es">
      <body data-theme={theme}>{children}</body>
    </html>
  );
}
