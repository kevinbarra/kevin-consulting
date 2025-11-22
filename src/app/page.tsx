'use client';

import { Canvas } from '@react-three/fiber';
import Particles from '@/components/canvas/Particles';
import { Suspense } from 'react';
import { ArrowRight, CheckCircle2, Star, TrendingUp, Clock, Layout, FileText } from 'lucide-react'; 
import HowItWorks from '@/components/sections/HowItWorks';
import About from '@/components/sections/About';
import Testimonials from '@/components/sections/Testimonials';
import Footer from '@/components/layout/Footer';

export default function Home() {
  
  const scrollToSolutions = () => {
    const section = document.getElementById('soluciones');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="relative w-full min-h-screen bg-[#0f172a] text-white overflow-x-hidden">
      
      {/* --- SECCIÓN 1: HERO (DISEÑO PREMIUM + TEXTO EMPÁTICO) --- */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center">
        
        {/* Logo sutil */}
        <div className="absolute top-8 left-8 md:top-12 md:left-12 z-30 font-bold text-xl tracking-tight hidden md:block">
          KEVIN<span className="text-blue-500">CONSULTING</span>
        </div>

        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 50], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} color="#3b82f6" />
            <Suspense fallback={null}>
              <Particles count={3500} />
            </Suspense>
          </Canvas>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/50 via-[#0f172a]/80 to-[#0f172a] z-10" />
        </div>

        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          
          {/* TÍTULO: Empático pero Poderoso */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Tu negocio tiene potencial.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Dale la estructura para crecer.
            </span>
          </h1>
          
          {/* SUBTÍTULO: Aterrizado a la realidad (cero tecnicismos) */}
          <p className="text-slate-300 text-lg md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Olvídate del papel y el caos. Creamos el sistema exacto que necesitas para controlar tus inventarios, citas y ventas sin complicarte la vida.
          </p>

          {/* BOTÓN: Invitación a la acción clara */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={scrollToSolutions}
                className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3 text-lg"
              >
                  Ver cómo te ayudamos
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 2: SOLUCIONES (Misma que tenías, funciona perfecto) --- */}
      <section id="soluciones" className="relative z-20 py-24 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Problemas Reales, Soluciones Claras</h2>
          <p className="text-slate-400">Identifica tu caso. Así es como te ayudamos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CASO 1: PANADERÍA */}
          <div className="md:col-span-2 bg-[#1e293b]/50 border border-white/10 rounded-3xl p-8 hover:border-blue-500/30 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-[80px] rounded-full -z-10" />
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="inline-block px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold mb-4">PROBLEMA: MERMA</div>
                <h3 className="text-2xl font-bold mb-3">"Hago pan de más y se tira"</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Produces a ciegas. A las 8 PM ya no tienes lo que el cliente quiere, o te sobraron 3 charolas. Es dinero perdido.
                </p>
                <div className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} /> Solución: Dashboard de Producción Diaria
                </div>
              </div>
              <div className="w-full md:w-64 bg-[#0f172a] rounded-xl border border-white/10 p-4 shadow-xl">
                <div className="text-xs text-slate-500 mb-2 font-mono">STOCK EN TIEMPO REAL</div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white">Bolillo</span>
                      <span className="text-red-400">Critico (5)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 w-[10%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white">Concha</span>
                      <span className="text-emerald-400">Óptimo (42)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[60%]"></div>
                    </div>
                  </div>
                  <div className="p-2 bg-blue-500/20 rounded border border-blue-500/30 text-[10px] text-blue-200 text-center mt-3">
                    🔔 Sugerencia: Hornear 20 bolillos más
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CASO 2: POLLOS */}
          <div className="bg-[#1e293b]/50 border border-white/10 rounded-3xl p-8 hover:border-orange-500/30 transition-all group flex flex-col relative overflow-hidden">
             <div className="absolute bottom-0 left-0 p-20 bg-orange-500/10 blur-[60px] rounded-full -z-10" />
            <div className="inline-block px-3 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-xs font-bold mb-4 w-fit">PROBLEMA: CAOS</div>
            <h3 className="text-xl font-bold mb-3">Filas y Gritos</h3>
            <p className="text-slate-400 text-sm mb-6 flex-1">
              "¿Joven, ya está mi pedido?" Clientes estresados porque no saben cuándo les toca.
            </p>
            <div className="mt-auto">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-full h-12 bg-white text-black flex items-center justify-center font-mono text-lg font-bold rotate-[-2deg] shadow-lg rounded-sm border-t-4 border-dashed border-gray-300">#45</div>
                 <ArrowRight className="text-slate-500" />
                 <div className="w-full h-16 bg-black border border-orange-500/50 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-orange-500/10">
                    <span className="text-[10px] text-orange-500 uppercase tracking-widest">Turno</span>
                    <span className="text-2xl font-bold text-white">#45</span>
                 </div>
              </div>
              <p className="text-center text-xs text-slate-500 mt-2">Digitalizamos tu sala de espera.</p>
            </div>
          </div>

          {/* CASO 3: CONTRATISTA */}
          <div className="bg-[#1e293b]/50 border border-white/10 rounded-3xl p-8 hover:border-blue-500/30 transition-all group flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 p-20 bg-blue-500/10 blur-[60px] rounded-full -z-10" />
            <div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold mb-4 w-fit">PROBLEMA: IMAGEN</div>
            <h3 className="text-xl font-bold mb-3">"No me veo Pro"</h3>
            <p className="text-slate-400 text-sm mb-6 flex-1">
              Eres excelente trabajando, pero pierdes contratos en USA por no tener una web corporativa.
            </p>
            <div className="mt-auto bg-white rounded-lg p-2 shadow-lg opacity-90 group-hover:opacity-100 transition-opacity">
               <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                  <div className="font-bold text-slate-800 text-xs">Jairo's Roofing</div>
                  <div className="flex gap-1"><Star size={8} className="fill-yellow-400 text-yellow-400" /><Star size={8} className="fill-yellow-400 text-yellow-400" /><Star size={8} className="fill-yellow-400 text-yellow-400" /></div>
               </div>
               <div className="mt-2 w-full py-1 bg-blue-600 text-white text-[8px] text-center rounded">Get a Free Quote</div>
            </div>
          </div>

          {/* CASO 4: PAPELES */}
          <div className="md:col-span-2 bg-[#1e293b]/50 border border-white/10 rounded-3xl p-8 hover:border-purple-500/30 transition-all group overflow-hidden relative">
             <div className="absolute bottom-0 left-0 p-32 bg-purple-500/10 blur-[80px] rounded-full -z-10" />
            <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
              <div className="flex-1">
                <div className="inline-block px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-bold mb-4">PROBLEMA: DESORDEN</div>
                <h3 className="text-2xl font-bold mb-3">"Vivo enterrado en notas"</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Pedidos en WhatsApp, deudas en una libreta manchada y post-its que se pierden. Si tú no estás, nadie sabe qué hacer.
                </p>
                <div className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} /> Solución: App de Gestión Simple
                </div>
              </div>
               <div className="w-full md:w-64 relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-[#fef3c7] text-slate-800 p-3 rounded rotate-[-3deg] border border-stone-300 scale-95 opacity-50 z-0 font-handwriting text-xs">
                     <p>Juan debe $500</p>
                     <p className="line-through">Pedido Cemento</p>
                  </div>
                  <div className="relative bg-[#0f172a] rounded-xl border border-purple-500/30 p-4 shadow-2xl z-10">
                     <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-white">Pedidos Hoy</span>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                     </div>
                     <div className="space-y-2">
                        <div className="bg-white/5 p-2 rounded flex justify-between items-center text-xs">
                           <span className="text-slate-300">Casa Sra. Lupita</span>
                           <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[10px]">Pagado</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: PROCESO */}
      <HowItWorks />

      {/* SECCIÓN 4: TESTIMONIOS */}
      <Testimonials />

      {/* SECCIÓN 5: SOBRE MI */}
      <About />

      {/* FOOTER */}
      <Footer />
    </main>
  );
}