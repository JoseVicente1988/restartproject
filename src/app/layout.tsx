import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Fallback de tema; el cambio real se hace en cliente y se guarda en localStorage
  const theme = "pastel";
  return (
    <html lang="es">
      <body data-theme={theme}>{children}</body>
    </html>
  );
}
