'use client';

import { Star, Quote, ArrowUpRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    client: "Panadería La Espiga",
    role: "Dueño de Negocio",
    result: "-18% Merma Mensual",
    quote: "Antes tirábamos charolas enteras de pan frío. Con el sistema de Kevin, ahora producimos exacto lo que se vende. El sistema se pagó solo en 2 meses.",
    color: "text-red-400",
    bg: "bg-red-500/10"
  },
  {
    id: 2,
    client: "Jairo Roofing LLC",
    role: "Contractor en Texas",
    result: "+3 Contratos Grandes",
    quote: "Perdía trabajos porque me veían como un 'handyman' informal. Con la web corporativa y el correo profesional, cerramos un contrato de $15k la semana pasada.",
    color: "text-blue-400",
    bg: "bg-blue-500/10"
  },
  {
    id: 3,
    client: "Pollos 'El Carbón'",
    role: "Gerente Operativo",
    result: "Cero Quejas por Espera",
    quote: "El fin de semana era un caos de gritos. Desde que pusimos la pantalla de turnos, la gente espera tranquila y hasta consumen más refrescos mientras esperan.",
    color: "text-orange-400",
    bg: "bg-orange-500/10"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6 bg-[#0f172a] relative overflow-hidden">
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Resultados que pagan tu inversión</h2>
          <p className="text-slate-400">No confíes en nuestra palabra. Confía en sus números.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-[#1e293b]/40 border border-white/5 rounded-2xl p-8 hover:bg-[#1e293b]/60 transition-colors relative group">
              
              {/* Comillas decorativas */}
              <Quote className="absolute top-6 right-6 text-white/5 w-10 h-10 group-hover:text-white/10 transition-colors" />

              {/* Resultado Resaltado (ROI) */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${t.bg} ${t.color} text-xs font-bold mb-6 border border-white/5`}>
                <ArrowUpRight size={14} />
                {t.result}
              </div>

              {/* Estrellas */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={14} className="fill-yellow-500 text-yellow-500" />
                ))}
              </div>

              {/* La Cita */}
              <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                "{t.quote}"
              </p>

              <div className="w-full h-[1px] bg-white/5 mb-4" />

              {/* Datos del Cliente */}
              <div>
                <div className="font-bold text-white">{t.client}</div>
                <div className="text-xs text-slate-500">{t.role}</div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}