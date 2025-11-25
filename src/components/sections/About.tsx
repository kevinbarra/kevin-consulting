'use client';

import Image from 'next/image';
import { MessageCircle } from 'lucide-react'; // Cambiamos iconos de redes por botón de contacto si se desea, o lo dejamos limpio
import SpotlightCard from '../layout/SpotlightCard';

export default function About() {
   return (
      <section id="nosotros" className="py-24 relative overflow-hidden">
         <div className="max-w-5xl mx-auto px-6 md:px-10">
            <SpotlightCard className="p-8 md:p-12 bg-[#0f172a]/50 border-white/5" spotlightColor="rgba(59, 130, 246, 0.15)">
               <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">

                  {/* --- FOTO DEL FUNDADOR --- */}
                  <div className="shrink-0 relative group">
                     {/* Efecto de halo/brillo detrás de la foto */}
                     <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                     {/* Contenedor de la imagen */}
                     <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                        <Image
                           src="/kevin.jpg" // <--- ASEGÚRATE DE RENOMBRAR TU FOTO A 'kevin.jpg' EN LA CARPETA PUBLIC
                           alt="Kevin Barra - Fundador"
                           fill
                           className="object-cover"
                           sizes="(max-width: 768px) 192px, 256px"
                           priority
                        />
                     </div>
                  </div>

                  {/* --- TEXTO "CARTA DEL FUNDADOR" --- */}
                  <div className="flex-1 text-left">
                     <div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm font-bold mb-4">
                        Una nota del fundador
                     </div>
                     <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                        No soy una agencia. <br className="hidden md:block" /> Soy tu socio tecnológico.
                     </h2>
                     <div className="space-y-4 text-slate-300 leading-relaxed">
                        <p>
                           Hola, soy Kevin Barra. Como ingeniero de software, he visto demasiados negocios con un potencial increíble quedarse estancados por el caos operativo o por herramientas que no entienden.
                        </p>
                        <p>
                           Fundé KevinConsulting con una misión simple: traer la tecnología de las grandes empresas a tu negocio, sin la complejidad ni el costo absurdo. No te voy a vender "código"; te voy a dar **control, tiempo y paz mental**.
                        </p>
                        <p>
                           Cuando trabajas conmigo, no hablas con un vendedor. Hablas directamente con quien diseña y construye tu solución. Mi compromiso es personal.
                        </p>
                     </div>

                     {/* Firma Simple */}
                     <div className="mt-8 border-t border-white/5 pt-6">
                        <div className="text-white font-bold text-lg">Kevin Barra</div>
                        <div className="text-blue-400 text-sm">Ingeniero de Software & Fundador</div>
                     </div>

                  </div>
               </div>
            </SpotlightCard>
         </div>
      </section>
   );
}