import type { Metadata, Viewport } from "next"; // <--- Importamos Viewport
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

// 1. CONFIGURACIÓN DE LA BARRA DEL CELULAR (APP FEEL)
export const viewport: Viewport = {
  themeColor: "#0f172a", // El mismo color oscuro de tu fondo
  width: "device-width",
  initialScale: 1,
};

// 2. METADATOS SEO
export const metadata: Metadata = {
  title: "Kevin Consulting | Transformación Digital",
  description: "Ingeniería de software a la medida. Optimizamos inventarios, procesos y ventas para panaderías, restaurantes y contratistas.",
  keywords: ["Consultoría", "Software", "Puebla", "Negocios", "App"],
  authors: [{ name: "Kevin Consulting" }],
  icons: {
    icon: '/icon',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-slate-950 text-white antialiased`}>
        <Navbar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}