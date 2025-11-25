'use client';

import { Canvas } from '@react-three/fiber';
import Particles from '@/components/canvas/Particles';
import { Suspense } from 'react';
import { ArrowRight, CheckCircle2, Star, BarChart3, Users, Layers, MousePointerClick, TrendingUp, Clock, Layout, FileText } from 'lucide-react';
import HowItWorks from '@/components/sections/HowItWorks';
import About from '@/components/sections/About';
import Testimonials from '@/components/sections/Testimonials';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/layout/Reveal';
import SpotlightCard from '@/components/layout/SpotlightCard';
import CountUp from '@/components/layout/CountUp'; // <--- IMPORTACIÓN NUEVA

export default function Home() {

  const scrollToSolutions = () => {
    const section = document.getElementById('soluciones');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="relative w-full min-h-screen bg-[#0f172a] text-white overflow-x-hidden">

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Canvas
            camera={{ position: [0, 0, 50], fov: 50 }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, powerPreference: "high-performance" }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} color="#3b82f6" />
            <Suspense fallback={null}>
              <Particles count={400} />
            </Suspense>
          </Canvas>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/50 via-[#0f172a]/80 to-[#0f172a] z-10" />
        </div>

        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <Reveal>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Tu negocio tiene potencial.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Dale la estructura para crecer.
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-slate-300 text-lg md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed font-light text-center">
              Olvídate del papel y el caos. Creamos el sistema exacto que necesitas para controlar tus inventarios, citas y ventas sin complicarte la vida.
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={scrollToSolutions}
                className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3 text-lg"
              >
                Ver cómo te ayudamos
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- SECCIÓN SOLUCIONES --- */}
      <section id="soluciones" className="relative z-20 py-24 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-16 flex flex-col items-center">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Problemas que te cuestan dinero</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-slate-400">Identifica tu cuello de botella. Nosotros lo destapamos.</p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* TARJETA 1: INVENTARIO */}
          <div className="md:col-span-2">
            <Reveal width="100%">
              <SpotlightCard className="h-full p-8 group">
                <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-[80px] rounded-full -z-10" />
                <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                  <div className="flex-1">
                    <div className="inline-block px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold mb-4">PROBLEMA: FUGA DE DINERO</div>
                    <h3 className="text-2xl font-bold mb-3">"Compro mucho y vendo poco"</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                      Si compras a ciegas, el dinero se queda estancado en la bodega o se va a la basura (merma).
                    </p>
                    <div className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                      <CheckCircle2 size={16} /> Solución: Control de Stock Inteligente
                    </div>
                  </div>
                  <div className="w-full md:w-64 bg-[#0f172a] rounded-xl border border-white/10 p-4 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs text-slate-500 font-mono">REPORTE SEMANAL</span>
                      <BarChart3 size={14} className="text-slate-500" />
                    </div>
                    <div className="flex items-end gap-2 h-20 mb-2 px-2 border-b border-white/5">
                      <div className="w-1/4 h-[80%] bg-red-500/50 rounded-t-sm relative group-hover:h-[40%] transition-all duration-1000 ease-out"></div>
                      <div className="w-1/4 h-[40%] bg-emerald-500/50 rounded-t-sm relative group-hover:h-[90%] transition-all duration-1000 ease-out delay-100"></div>
                      <div className="w-1/4 h-[30%] bg-blue-500/50 rounded-t-sm group-hover:h-[50%] transition-all duration-1000 ease-out delay-200"></div>
                      <div className="w-1/4 h-[50%] bg-purple-500/50 rounded-t-sm group-hover:h-[70%] transition-all duration-1000 ease-out delay-300"></div>
                    </div>
                    <div className="text-[10px] text-slate-400 text-center mt-2">
                      Detectamos fuga de <CountUp value={3000} prefix="$" />
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </Reveal>
          </div>

          {/* TARJETA 2: ATENCIÓN */}
          <div className="h-full">
            <Reveal width="100%" delay={0.2}>
              <SpotlightCard className="h-full p-8 group flex flex-col" spotlightColor="rgba(249, 115, 22, 0.2)">
                <div className="absolute bottom-0 left-0 p-20 bg-orange-500/10 blur-[60px] rounded-full -z-10" />
                <div className="inline-block px-3 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-xs font-bold mb-4 w-fit">PROBLEMA: CAOS</div>
                <h3 className="text-xl font-bold mb-3">Mala Atención</h3>
                <p className="text-slate-400 text-sm mb-6 flex-1">
                  Clientes esperando sin saber su turno, pedidos perdidos o mala comunicación. Un cliente enojado no vuelve.
                </p>
                <div className="text-emerald-400 font-bold text-sm flex items-center gap-2 mb-6">
                  <CheckCircle2 size={16} /> Solución: Pantallas de Turno
                </div>
                <div className="mt-auto">
                  <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5 animate-pulse">
                    <div className="flex items-center gap-3">
                      <Users size={16} className="text-orange-400" />
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">En Espera</div>
                        <div className="text-lg font-bold text-white">
                          <CountUp value={3} suffix=" Personas" />
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                  </div>
                  <p className="text-center text-xs text-slate-500 mt-2">Flujo de servicio optimizado.</p>
                </div>
              </SpotlightCard>
            </Reveal>
          </div>

          {/* TARJETA 3: IMAGEN */}
          <div className="h-full">
            <Reveal width="100%">
              <SpotlightCard className="h-full p-8 group flex flex-col" spotlightColor="rgba(59, 130, 246, 0.2)">
                <div className="absolute top-0 right-0 p-20 bg-blue-500/10 blur-[60px] rounded-full -z-10" />
                <div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold mb-4 w-fit">PROBLEMA: DESCONFIANZA</div>
                <h3 className="text-xl font-bold mb-3">Perder Clientes</h3>
                <p className="text-slate-400 text-sm mb-6 flex-1">
                  Eres bueno en lo que haces, pero tu imagen no lo refleja. Las empresas pagan más a quien se ve profesional.
                </p>
                <div className="text-emerald-400 font-bold text-sm flex items-center gap-2 mb-6">
                  <CheckCircle2 size={16} /> Solución: Web Profesional
                </div>
                <div className="mt-auto bg-white/5 p-4 rounded-xl border border-white/10 text-center group-hover:bg-white/10 transition-colors relative overflow-hidden">
                  <div className="text-xs text-slate-300 mb-2">Tu Web Trabajando 24/7</div>
                  <button className="w-full py-2 bg-blue-600 text-white text-[10px] font-bold rounded shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                    <MousePointerClick size={12} />
                    Solicitar Cotización
                  </button>
                </div>
              </SpotlightCard>
            </Reveal>
          </div>

          {/* TARJETA 4: DEPENDENCIA */}
          <div className="md:col-span-2">
            <Reveal width="100%" delay={0.2}>
              <SpotlightCard className="h-full p-8 group" spotlightColor="rgba(168, 85, 247, 0.2)">
                <div className="absolute bottom-0 left-0 p-32 bg-purple-500/10 blur-[80px] rounded-full -z-10" />
                <div className="flex flex-col md:flex-row-reverse gap-8 items-center relative z-10">
                  <div className="flex-1">
                    <div className="inline-block px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-bold mb-4">PROBLEMA: DEPENDENCIA</div>
                    <h3 className="text-2xl font-bold mb-3">"El negocio soy yo"</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                      Si tú no estás, nadie sabe qué cobrar, qué pedir o qué hacer. Vives atado a tu teléfono.
                    </p>
                    <div className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                      <CheckCircle2 size={16} /> Solución: Tu negocio en la Nube (Autónomo)
                    </div>
                  </div>

                  <div className="w-full md:w-64 relative">
                    <div className="relative bg-[#0f172a] rounded-xl border border-purple-500/30 p-4 shadow-2xl z-10 overflow-hidden">
                      <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite]"></div>
                      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2 relative z-10">
                        <span className="text-xs font-bold text-white">ESTADO DEL NEGOCIO</span>
                        <div className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[8px] font-bold rounded uppercase animate-pulse">Online</div>
                      </div>
                      <div className="space-y-3 relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-blue-500/20 rounded text-blue-400"><Layers size={12} /></div>
                          <div className="flex-1">
                            <div className="text-[10px] text-slate-400">Ventas de Hoy</div>
                            <div className="text-xs font-bold text-white">
                              {/* NUMERO VIVO */}
                              <CountUp value={12450} prefix="$" decimals={2} />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-purple-500/20 rounded text-purple-400"><Users size={12} /></div>
                          <div className="flex-1">
                            <div className="text-[10px] text-slate-400">Personal Activo</div>
                            <div className="text-xs font-bold text-white">
                              {/* NUMERO VIVO */}
                              <CountUp value={4} suffix=" Empleados" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-[10px] text-slate-500 text-center italic relative z-10">
                        Tú estás descansando. Tu sistema trabaja.
                      </div>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </Reveal>
          </div>

        </div>
      </section>

      <Reveal width="100%">
        <HowItWorks />
      </Reveal>

      <Reveal width="100%">
        <Testimonials />
      </Reveal>

      <Reveal width="100%">
        <About />
      </Reveal>

      <Footer />
    </main>
  );
}