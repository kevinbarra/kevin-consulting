import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import FloatingCTA from "@/components/layout/FloatingCTA"; // <--- IMPORTACIÓN NUEVA
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

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
        
        {/* Botón Flotante de WhatsApp */}
        <FloatingCTA />
        
        <Analytics />
      </body>
    </html>
  );
}