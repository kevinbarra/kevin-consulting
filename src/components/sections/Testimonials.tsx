'use client';

import { Star, Quote, CheckCircle2, ArrowRight } from 'lucide-react';

// DATOS CON PSICOLOGÍA DE VENTAS:
// 1. Panadería: Ataca el miedo a perder dinero (Merma).
// 2. Contratista: Ataca el ego y el deseo de estatus (Ganar a los grandes).
// 3. Restaurante: Ataca el estrés operativo (Gritos/Caos).

const testimonials = [
  {
    id: 1,
    client: "Carlos M.",
    business: "Panadería La Tradición",
    role: "Dueño",
    // La psicología aquí es: "Dinero recuperado".
    highlight: "Recuperé $8,000 al mes",
    quote: "Antes tiraba charolas de pan frío todos los días. Me dolía el codo ver ese dinero en la basura. Con el dashboard de Kevin, ahora sé exactamente cuánto hornear. La merma bajó a casi cero en 3 semanas.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    avatar: "C"
  },
  {
    id: 2,
    client: "Rogelio G.",
    business: "RG Roofing & Siding (Texas)",
    role: "Contratista General",
    // La psicología aquí es: "Validación y Respeto".
    highlight: "Me gané un bid de $25k",
    quote: "Era muy bueno trabajando, pero los gringos no confiaban en mí porque mandaba cotizaciones por WhatsApp. Con la web y el correo corporativo, me ven como una empresa grande. Acabo de cerrar mi obra más grande.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    avatar: "R"
  },
  {
    id: 3,
    client: "Sra. Lupita",
    business: "Pollos Asados El Puente",
    role: "Gerente",
    // La psicología aquí es: "Paz Mental".
    highlight: "Se acabaron los gritos",
    quote: "Los fines de semana eran un infierno, los meseros se peleaban y los clientes se iban enojados. Puse la pantalla de turnos y ahora hay un silencio y un orden que no creí posible. Mis empleados trabajan felices.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    avatar: "L"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#0f172a]">

      {/* Fondos decorativos sutiles */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(37,99,235,0.05)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(147,51,234,0.05)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">

        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">No confíes en mi palabra</h2>
          <p className="text-slate-400">Confía en los números de quienes ya dieron el paso.</p>
        </div>

        {/* --- CONTENEDOR CARRUSEL (MÓVIL) / GRID (PC) --- */}
        {/* flex: Pone los elementos en fila.
            overflow-x-auto: Permite scroll horizontal.
            snap-x snap-mandatory: Hace que las tarjetas se "peguen" al centro.
            no-scrollbar: Oculta la barra fea (necesita clase en globals.css o plugin, pero native funciona bien).
        */}
        <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto snap-x snap-mandatory pb-8 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0">

          {testimonials.map((t) => (
            <div
              key={t.id}
              // min-w-[85vw]: En móvil, la tarjeta ocupa el 85% del ancho. El 15% restante deja ver la siguiente tarjeta (Pista visual).
              className="snap-center shrink-0 w-[85vw] md:w-auto bg-[#1e293b]/40 border border-white/5 rounded-2xl p-8 hover:bg-[#1e293b]/60 transition-all relative group flex flex-col"
            >

              {/* Header: Resultado + Estrellas */}
              <div className="flex justify-between items-start mb-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${t.bg} ${t.color} text-xs font-bold border border-white/5`}>
                  {t.highlight}
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={14} className="fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
              </div>

              {/* La Cita */}
              <div className="relative mb-8 flex-1">
                <Quote className="absolute -top-2 -left-2 text-white/5 w-8 h-8 transform -scale-x-100" />
                <p className="text-slate-300 text-sm leading-relaxed italic pl-4 relative z-10">
                  "{t.quote}"
                </p>
              </div>

              {/* Footer: Cliente + Verificación */}
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-white/5">
                {/* Avatar Simulado */}
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm">
                  {t.avatar}
                </div>

                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    {t.client}
                    {/* Badge de Verificado (Psicología: Confianza) */}
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded flex items-center gap-1 font-normal">
                      <CheckCircle2 size={10} /> Cliente
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">{t.business}</div>
                </div>
              </div>

            </div>
          ))}

          {/* Tarjeta Fantasma (Solo móvil): Para dar espacio final al scroll */}
          <div className="md:hidden shrink-0 w-4" />
        </div>

        {/* Indicador visual para móvil (Flecha sutil) */}
        <div className="md:hidden flex justify-center mt-4 text-xs text-slate-500 animate-pulse items-center gap-2">
          Desliza para ver más <ArrowRight size={12} />
        </div>

      </div>
    </section>
  );
}