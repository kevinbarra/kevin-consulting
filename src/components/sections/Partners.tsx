'use client';

import { motion } from 'framer-motion';
import SpotlightCard from '../layout/SpotlightCard';

const partners = [
  {
    name: "Kofii",
    url: "#", 
    description: "App de Pedidos & Lealtad",
    // Modern coffee icon / brand SVG
    logo: (
      <svg className="w-12 h-12 text-amber-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <line x1="6" y1="2" x2="6" y2="4" />
        <line x1="10" y1="2" x2="10" y2="4" />
        <line x1="14" y1="2" x2="14" y2="4" />
      </svg>
    ),
    spotlight: "rgba(245, 158, 11, 0.15)"
  },
  {
    name: "Fulanos Barber",
    url: "https://fulanos.agendabarber.pro/book/fulanos", 
    description: "Sistema de Citas & POS",
    // Elegant barber scissors / comb style SVG
    logo: (
      <svg className="w-12 h-12 text-slate-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="9.8" y1="8.2" x2="20" y2="17" />
        <line x1="9.8" y1="15.8" x2="20" y2="7" />
      </svg>
    ),
    spotlight: "rgba(255, 255, 255, 0.1)"
  },
  {
    name: "Del Valle Asesores",
    url: "https://delvalleasesores.mx/", 
    description: "Portal de Clientes & Cotizador",
    // Shield representing protection / insurance SVG
    logo: (
      <svg className="w-12 h-12 text-emerald-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    spotlight: "rgba(52, 211, 153, 0.15)"
  },
  {
    name: "RG Roofing & Siding",
    url: "#", 
    description: "SaaS de Cotizaciones & Contratos",
    // Roof / construction SVG
    logo: (
      <svg className="w-12 h-12 text-blue-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 22h20" />
        <path d="M20 12v10H4V12" />
        <path d="m2 12 10-9 10 9" />
        <path d="M10 12h4v10h-4z" />
      </svg>
    ),
    spotlight: "rgba(96, 165, 250, 0.15)"
  },
  {
    name: "La Tradición Panadería",
    url: "#", 
    description: "ERP & Control de Producción",
    // Circular seal / wheat SVG
    logo: (
      <svg className="w-12 h-12 text-amber-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12a4 4 0 0 1 8 0" />
        <line x1="12" y1="8" x2="12" y2="16" />
      </svg>
    ),
    spotlight: "rgba(217, 119, 6, 0.15)"
  },
  {
    name: "Pollos Asados El Puente",
    url: "#", 
    description: "Orquestador de Flujo & Pedidos",
    // Bridge / arch SVG
    logo: (
      <svg className="w-12 h-12 text-orange-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 20a9 9 0 0 1 18 0" />
        <path d="M12 11v9" />
        <path d="M8 14v6" />
        <path d="M16 14v6" />
      </svg>
    ),
    spotlight: "rgba(249, 115, 22, 0.15)"
  }
];

export default function Partners() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#0a0f1d]/40 border-t border-white/5">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[350px] bg-[radial-gradient(circle,rgba(37,99,235,0.04)_0%,rgba(0,0,0,0)_70%)] -z-10" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Negocios que confían en nuestra ingeniería</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Sistemas reales en producción que automatizan operaciones, reducen mermas y multiplican la rentabilidad diariamente.
          </p>
        </div>

        {/* LOGO WALL GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <a
                href={partner.url}
                target={partner.url === '#' ? undefined : "_blank"}
                rel="noopener noreferrer"
                className={`block h-full ${partner.url === '#' ? 'cursor-default' : 'cursor-pointer'}`}
                onClick={partner.url === '#' ? (e) => e.preventDefault() : undefined}
              >
                <SpotlightCard
                  className="p-6 flex flex-col items-center justify-center text-center h-full group bg-[#111827]/40 hover:bg-[#111827]/80 transition-colors border-white/5 hover:border-white/10"
                  spotlightColor={partner.spotlight}
                >
                  {/* Container for Logo with hover filter transition */}
                  <div className="mb-4 filter grayscale contrast-75 brightness-75 group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 transition-all duration-500 ease-out transform group-hover:scale-110">
                    {partner.logo}
                  </div>
                  
                  <h3 className="font-bold text-sm text-slate-300 group-hover:text-white transition-colors">
                    {partner.name}
                  </h3>
                  
                  <p className="text-[10px] text-slate-500 group-hover:text-slate-400 mt-1 font-medium transition-colors">
                    {partner.description}
                  </p>
                </SpotlightCard>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
