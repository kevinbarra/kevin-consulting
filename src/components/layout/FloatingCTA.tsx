'use client';

import { MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // El botón aparece solo después de que el usuario baja 100px
    const toggleVisibility = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const handleClick = () => {
    // TU NÚMERO AQUÍ
    const telefono = "522291589149"; 
    const mensaje = "Hola Kevin, quiero cotizar un proyecto para mi negocio.";
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#1ebc57] text-white rounded-full shadow-lg shadow-green-500/30 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={28} />
      {/* Punto de notificación para llamar la atención */}
      <span className="absolute top-0 right-0 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </span>
    </button>
  );
}