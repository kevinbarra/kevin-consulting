import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

// --- AQUÍ ESTÁ EL CAMBIO DE SEO ---
export const metadata: Metadata = {
  title: "Kevin Consulting | Transformación Digital para Negocios",
  description: "Ingeniería de software a la medida. Optimizamos inventarios, procesos y ventas para panaderías, restaurantes y contratistas.",
  keywords: ["Consultoría de Software", "Desarrollo Web", "Inventarios", "Puebla", "Transformación Digital"],
  authors: [{ name: "Kevin Consulting" }],
  icons: {
    icon: '/icon', // Apunta al archivo que acabamos de crear
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
      </body>
    </html>
  );
}