import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Control de Inventarios y Campañas Logísticas | Logtay",
  description: "Gestiona tus campañas de conteo de inventarios, reportes de diferencias y almacenes en tiempo real con la plataforma logística Logtay.",
  keywords: ["logística", "inventarios", "gestión de almacenes", "supabase", "conteo"],
  openGraph: {
    title: "Control de Inventarios y Campañas Logísticas | Logtay",
    description: "Optimiza tus auditorías de stock y almacenes en tiempo real.",
    type: "website",
  },
  verification: {
    google: "ai0ywvDpZ9qiehbUHByLV2ckTWpOcDytZfB1mkq7bfI",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
