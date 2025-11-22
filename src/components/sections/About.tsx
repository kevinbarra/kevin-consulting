'use client';

import { MessageCircle } from 'lucide-react';

export default function About() {
  return (
    <section id="contacto" className="py-24 px-6 bg-[#0b1121] border-y border-white/5 relative">
      <div className="max-w-4xl mx-auto text-center">
          
          {/* FOTO DE PERFIL / AVATAR */}
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-1 mb-6 shadow-2xl shadow-blue-500/20">
             <div className="w-full h-full bg-[#0f172a] rounded-full flex items-center justify-center text-3xl">
                👨‍💻
             </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6">
             Ingeniería experta.<br/>
             <span className="text-blue-500">Trato directo.</span>
          </h2>
          
          <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
             Hola, soy <strong>Kevin</strong>. Ingeniero en Sistemas. <br/>
             A diferencia de las agencias donde eres un número más, yo me involucro personalmente. Analizo tu negocio, entiendo tus dolores y programo la solución exacta.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
             <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="font-bold text-white text-xl">100%</div>
                <div className="text-xs text-slate-400">A la Medida</div>
             </div>
             <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="font-bold text-white text-xl">24/7</div>
                <div className="text-xs text-slate-400">Soporte Directo</div>
             </div>
             <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="font-bold text-white text-xl">ROI</div>
                <div className="text-xs text-slate-400">Enfocado en Ganancias</div>
             </div>
          </div>

          <button 
            onClick={() => {
                // CAMBIA ESTO POR TU NÚMERO REAL
                const telefono = "522291589149"; 
                const mensaje = "Hola Kevin, vi tu página web y quiero analizar mi negocio.";
                const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
                window.open(url, '_blank');
            }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] hover:bg-[#1ebc57] text-white font-bold rounded-full transition-all shadow-lg shadow-green-500/20 transform hover:scale-105"
          >
             <MessageCircle size={20} />
             Enviar WhatsApp Directo
          </button>
          <p className="mt-4 text-xs text-slate-500">Respuesta promedio: Menos de 1 hora.</p>
      </div>
    </section>
  );
}