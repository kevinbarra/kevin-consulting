'use client';

import Image from 'next/image';
import SpotlightCard from '../layout/SpotlightCard';
import { MapPin, Code2, Star } from 'lucide-react';

export default function About() {
   return (
      <section id="nosotros" className="py-24 relative overflow-hidden">
         <div className="max-w-5xl mx-auto px-6 md:px-10">
            <SpotlightCard className="p-8 md:p-12 bg-[#0f172a]/50 border-white/5" spotlightColor="rgba(59, 130, 246, 0.15)">
               <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">

                  {/* --- FOTO DEL FUNDADOR (DISEÑO HÍBRIDO) --- */}
                  <div className="shrink-0 relative group flex flex-col items-center">
                     {/* Efecto de halo/brillo detrás de la foto */}
                     <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full md:rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                     {/* Contenedor de la imagen: Círculo en Móvil, Cuadrado en PC */}
                     <div className="relative w-32 h-32 md:w-64 md:h-64 rounded-full md:rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
                        <Image
                           src="/kevin.jpg"
                           alt="Kevin Barra - Fundador"
                           fill
                           className="object-cover"
                           sizes="(max-width: 768px) 128px, 256px"
                           priority
                        />
                     </div>

                     {/* Badges de Datos (Solo visibles en Móvil para dar contexto rápido) */}
                     <div className="flex gap-2 mt-4 md:hidden">
                        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] text-slate-300 flex items-center gap-1">
                           <MapPin size={10} /> México
                        </div>
                        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] text-slate-300 flex items-center gap-1">
                           <Code2 size={10} /> Senior Dev
                        </div>
                     </div>
                  </div>

                  {/* --- TEXTO "CARTA DEL FUNDADOR" --- */}
                  <div className="flex-1 text-center md:text-left">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm font-bold mb-6">
                        <Star size={12} className="fill-blue-400" />
                        Una nota personal
                     </div>

                     <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-white">
                        No soy una agencia. <br className="hidden md:block" /> Soy tu socio tecnológico.
                     </h2>

                     <div className="space-y-4 text-slate-300 leading-relaxed text-base md:text-lg">
                        <p>
                           Hola, soy <span className="text-white font-semibold">Kevin Barra</span>. Como ingeniero de software, he visto demasiados negocios con un potencial increíble quedarse estancados por el caos operativo o por herramientas que no entienden.
                        </p>
                        <p>
                           Fundé KevinConsulting con una misión simple: traer la tecnología de las grandes empresas a tu negocio, sin la complejidad ni el costo absurdo. No te voy a vender "código"; te voy a dar <span className="text-white font-semibold">control, tiempo y paz mental</span>.
                        </p>
                        <p>
                           Cuando trabajas conmigo, no hablas con un vendedor. Hablas directamente con quien diseña y construye tu solución. Mi compromiso es personal.
                        </p>
                     </div>

                     {/* Firma Simple */}
                     <div className="mt-8 border-t border-white/5 pt-6 flex flex-col md:flex-row items-center md:items-start gap-2">
                        <div className="text-white font-bold text-xl font-serif italic">Kevin Barra</div>
                        <div className="hidden md:block text-slate-600">|</div>
                        <div className="text-blue-400 text-sm uppercase tracking-widest font-bold mt-1">Ingeniero de Software & Fundador</div>
                     </div>

                  </div>
               </div>
            </SpotlightCard>
         </div>
      </section>
   );
}