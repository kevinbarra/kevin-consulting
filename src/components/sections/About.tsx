'use client';

import Image from 'next/image';
import SpotlightCard from '../layout/SpotlightCard';
import { MapPin, Star } from 'lucide-react'; // Quitamos Code2, usamos MapPin y Star

export default function About() {
   return (
      <section id="nosotros" className="py-24 relative overflow-hidden">
         <div className="max-w-5xl mx-auto px-6 md:px-10">
            <SpotlightCard className="p-8 md:p-12 bg-[#0f172a]/50 border-white/5" spotlightColor="rgba(59, 130, 246, 0.15)">
               <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">

                  {/* --- FOTO DEL FUNDADOR (DISEÑO HÍBRIDO) --- */}
                  <div className="shrink-0 relative group flex flex-col items-center text-center">
                     {/* Efecto de halo/brillo detrás de la foto */}
                     <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full md:rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                     {/* Contenedor de la imagen */}
                     <div className="relative w-32 h-32 md:w-64 md:h-64 rounded-full md:rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl group-hover:scale-[1.02] transition-transform duration-500 mb-4 md:mb-0">
                        <Image
                           src="/kevin.jpg"
                           alt="Kevin Barra - Fundador"
                           fill
                           className="object-cover"
                           sizes="(max-width: 768px) 128px, 256px"
                           priority
                        />
                     </div>

                     {/* INFORMACIÓN RÁPIDA (SOLO MÓVIL) - Reemplaza a los badges */}
                     <div className="md:hidden space-y-1">
                        <h3 className="text-white font-bold text-xl">Kevin Barra</h3>
                        <p className="text-blue-400 text-sm font-medium">Ingeniero de Software</p>
                        <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                           <MapPin size={10} /> <span>México</span>
                        </div>
                     </div>
                  </div>

                  {/* --- TEXTO "CARTA DEL FUNDADOR" --- */}
                  <div className="flex-1 text-center md:text-left">
                     {/* Etiqueta sutil */}
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold mb-6 uppercase tracking-wider">
                        <Star size={10} className="fill-blue-400" />
                        Nota Personal
                     </div>

                     <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-white">
                        No construimos sitios simples. <br className="hidden md:block" /> Diseñamos motores de rentabilidad.
                     </h2>

                     <div className="space-y-4 text-slate-300 leading-relaxed text-base md:text-lg">
                        <p>
                           Hola, soy <span className="text-white font-semibold">Kevin Barra</span>. A lo largo de mi trayectoria como ingeniero de software, he visto cómo procesos manuales y sistemas frágiles limitan el crecimiento de empresas con gran potencial.
                        </p>
                        <p>
                           Fundé **Kevin Consulting** para llevar la arquitectura de software avanzada y la automatización en la nube a empresas en fase de escalamiento. No entregamos código genérico; diseñamos la infraestructura digital que automatiza tus operaciones y blinda tu margen operativo.
                        </p>
                        <p>
                           Al colaborar conmigo, no tratarás con intermediarios. Trabajarás directamente con el arquitecto del sistema para asegurar soluciones de alto impacto y rendimiento óptimo.
                        </p>
                     </div>

                     {/* Métrica / Aura Grids */}
                     <div className="grid grid-cols-2 gap-4 mt-8 border-t border-white/5 pt-6">
                        <div>
                           <div className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">99.9%</div>
                           <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Disponibilidad en Sistemas</div>
                        </div>
                        <div>
                           <div className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">+30%</div>
                           <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Eficiencia Operativa Media</div>
                        </div>
                        <div>
                           <div className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">100%</div>
                           <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Ingeniería a la Medida</div>
                        </div>
                        <div>
                           <div className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">CI/CD</div>
                           <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Despliegue Continuo Automatizado</div>
                        </div>
                     </div>

                     {/* Firma (Solo PC porque en móvil ya pusimos los datos arriba) */}
                     <div className="hidden md:flex mt-8 border-t border-white/5 pt-6 flex-col items-start gap-1">
                        <div className="text-white font-bold text-xl font-serif italic">Kevin Barra</div>
                        <div className="text-blue-400 text-sm uppercase tracking-widest font-bold">Ingeniero de Software & Fundador</div>
                     </div>

                  </div>
               </div>
            </SpotlightCard>
         </div>
      </section>
   );
}