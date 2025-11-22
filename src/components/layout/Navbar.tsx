'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detectamos el scroll para hacer la barra más sólida cuando bajas
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-[#0f172a]/80 backdrop-blur-md border-white/10 py-4'
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* LOGO (Al dar clic te lleva arriba) */}
        <a href="#" className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
            K
          </div>
          <span className="text-lg font-bold tracking-tight">
            Kevin<span className="text-blue-400">Consulting</span>
          </span>
        </a>

        {/* MENÚ ESCRITORIO (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#soluciones" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Soluciones
          </a>
          <a href="#proceso" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Cómo Funciona
          </a>
          <a 
            href="#contacto" 
            className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-sm font-semibold transition-all backdrop-blur-sm"
          >
            Agendar Cita
          </a>
        </div>

        {/* MENÚ MÓVIL (Icono Hamburguesa) */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* DESPLEGABLE MÓVIL */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0f172a] border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-5">
          <a 
            href="#soluciones" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-300 hover:text-white py-2 border-b border-white/5"
          >
            Soluciones
          </a>
          <a 
            href="#proceso" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-300 hover:text-white py-2 border-b border-white/5"
          >
            Cómo Funciona
          </a>
          <a 
            href="#contacto" 
            onClick={() => setMobileMenuOpen(false)}
            className="w-full py-3 bg-blue-600 rounded-lg font-bold mt-2 text-center"
          >
            Agendar Cita
          </a>
        </div>
      )}
    </nav>
  );
}