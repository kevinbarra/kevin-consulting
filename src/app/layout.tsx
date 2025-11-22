import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { Analytics } from "@vercel/analytics/react"; // <--- IMPORTACIÓN NUEVA

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kevin Consulting | Transformación Digital para Negocios",
  description: "Ingeniería de software a la medida. Optimizamos inventarios, procesos y ventas para panaderías, restaurantes y contratistas.",
  keywords: ["Consultoría de Software", "Desarrollo Web", "Inventarios", "Puebla", "Transformación Digital"],
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
        
        {/* SENSOR DE ANALÍTICAS (Invisible pero poderoso) */}
        <Analytics />
      </body>
    </html>
  );
}