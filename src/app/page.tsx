'use client';

import { Canvas } from '@react-three/fiber';
import Particles from '@/components/canvas/Particles';
import TechCore from '@/components/canvas/TechCore';
import { Suspense } from 'react';
import { ArrowRight } from 'lucide-react';
import HowItWorks from '@/components/sections/HowItWorks';
import About from '@/components/sections/About';
import Testimonials from '@/components/sections/Testimonials';
import TechStack from '@/components/sections/TechStack';
import BentoSolutions from '@/components/sections/BentoSolutions';
import ScrollScrubShowcase from '@/components/sections/ScrollScrubShowcase';
import Partners from '@/components/sections/Partners';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/layout/Reveal';

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

        {/* LOGO DUPLICADO ELIMINADO (Solo se ve el del Navbar) */}

        <div className="absolute inset-0 z-0">
          {/* Configuración optimizada para rendimiento */}
          <Canvas
            camera={{ position: [0, 0, 50], fov: 50 }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, powerPreference: "high-performance" }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} color="#3b82f6" />
            <Suspense fallback={null}>
              <Particles count={400} />
              <TechCore />
            </Suspense>
          </Canvas>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/50 via-[#0f172a]/80 to-[#0f172a] z-10" />
        </div>

        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <Reveal>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
              Sistemas de Software autónomos.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Ingeniería para crecer.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-light text-center">
              Desarrollamos e implementamos software a la medida de alto rendimiento que elimina ineficiencias operativas y automatiza tus flujos de trabajo.
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={scrollToSolutions}
                className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3 text-lg cursor-pointer"
              >
                Ver soluciones de ingeniería
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- TECH STACK (CINTA INFINITA) --- */}
      <Reveal width="100%" delay={0.2}>
        <TechStack />
      </Reveal>

      {/* --- SECCIÓN SOLUCIONES BENTO --- */}
      <BentoSolutions />

      {/* --- SECCIÓN PORTAFOLIO SCROLL-SCRUB --- */}
      <ScrollScrubShowcase />

      {/* --- SECCIÓN PARTNERS LOGOS --- */}
      <Partners />

      {/* --- SECCIONES FINALES --- */}
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