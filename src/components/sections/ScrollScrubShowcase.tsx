'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { ArrowUpRight, CheckCircle2, Shield, Zap, Terminal, Smartphone } from 'lucide-react';

const projects = [
  {
    id: 0,
    title: "SaaS de Reservas",
    subtitle: "Gestión de Barberías & Citas en Producción (Fulanos)",
    description: "Nuestra plataforma propia de agendamiento y punto de venta para el sector de cuidado personal. Automatiza el control de turnos, comisiones de barberos, recordatorios interactivos por WhatsApp y analíticas financieras detalladas.",
    tags: ["Next.js 16", "Supabase", "Recharts", "Resend API", "Tailwind CSS"],
    metric: "Cero traslapes en reservas",
    url: "https://fulanos.agendabarber.pro/book/fulanos",
    image: "/barber.png",
    color: "from-orange-500/20 to-red-500/20",
    icon: <Zap className="text-orange-400" size={20} />
  },
  {
    id: 1,
    title: "Airbnb Luxury",
    subtitle: "Plataforma de Alquiler Vacacional Premium",
    description: "Clon de alto rendimiento para hospedajes exclusivos. Diseñado con una interfaz inmaculada, transiciones fluidas con GSAP y Lenis Scroll, autenticación con Supabase Auth y cobros con Stripe API.",
    tags: ["Next.js 16", "Supabase", "GSAP Timeline", "Lenis Scroll", "Stripe API"],
    metric: "Pasarela de pagos certificada",
    url: "#",
    image: "/airbnb.png",
    color: "from-blue-500/20 to-indigo-500/20",
    icon: <Shield className="text-blue-400" size={20} />
  },
  {
    id: 2,
    title: "SaaS de Cafeterías & AI",
    subtitle: "Pedidos Móviles & Sistema de Lealtad (Kofii)",
    description: "Aplicación móvil PWA y panel administrativo para optimizar la compra de café de especialidad. Integra sugerencias automáticas por inteligencia artificial (Google Gemini AI), base de datos en Supabase y cuponeras QR.",
    tags: ["Next.js 15", "Google Gemini AI", "Supabase", "HTML5 QR Reader", "Recharts"],
    metric: "+24% recurrencia de clientes",
    url: "#",
    image: "/kofii.png",
    color: "from-amber-500/20 to-orange-500/20",
    icon: <Smartphone className="text-amber-400" size={20} />
  },
  {
    id: 3,
    title: "SaaS de Restaurantes",
    subtitle: "Orquestador de Cocina & Comandas (El Puente)",
    description: "Sistema operativo y panel en tiempo real para restaurantes de alto flujo. Sincroniza cajas registradoras y pantallas de preparación en cocina por medio de WebSockets, agilizando el servicio.",
    tags: ["Next.js", "Framer Motion", "Tailwind CSS", "WebSocket Sync"],
    metric: "-35% tiempos de preparación",
    url: "#",
    image: "/cloud.png",
    color: "from-purple-500/20 to-indigo-500/20",
    icon: <Terminal className="text-purple-400" size={20} />
  }
];

export default function ScrollScrubShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Escuchamos el scroll progress para cambiar el mockup activo en el panel sticky
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      // Mapeamos el progreso de 0 a 1 en 4 tramos
      if (latest < 0.25) {
        setActiveIndex(0);
      } else if (latest >= 0.25 && latest < 0.55) {
        setActiveIndex(1);
      } else if (latest >= 0.55 && latest < 0.8) {
        setActiveIndex(2);
      } else {
        setActiveIndex(3);
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <div ref={containerRef} className="relative w-full bg-[#030712]">
      {/* BACKGROUND DECORATIVE SHADOWS */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(37,99,235,0.02),transparent_60%)] pointer-events-none" />

      {/* --- DESKTOP STICKY LAYOUT (md:block) --- */}
      <div className="hidden md:block relative w-full">
        {/* Left Column - content slides naturally */}
        {/* Right Column - sticky phone / mockup container */}
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-12 gap-8">
          
          {/* LEFT SIDE TEXT BLOCKS */}
          <div className="col-span-6 space-y-[10vh] pb-[20vh] z-20">
            
            {/* Header del Showcase */}
            <div className="h-screen flex flex-col justify-center pr-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold mb-4 uppercase tracking-wider w-fit">
                Casos de Éxito
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-none text-white mb-6">
                Ingeniería aplicada <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                  en producción.
                </span>
              </h2>
              <p className="text-slate-400 text-lg font-light leading-relaxed max-w-md">
                Desplaza la página para ver cómo transformamos arquitecturas digitales complejas en productos estables y de alta conversión.
              </p>
              <div className="mt-8 flex items-center gap-3 text-xs text-slate-500 font-mono animate-bounce">
                <span>Desliza para explorar</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            {/* Blocks de cada proyecto */}
            {projects.map((proj, idx) => (
              <div key={proj.id} className="h-screen flex flex-col justify-center pr-12 relative">
                <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-[2px] h-[100px] bg-slate-800">
                  {activeIndex === idx && (
                    <motion.div 
                      layoutId="scrollbar-indicator" 
                      className="w-full h-full bg-gradient-to-b from-blue-500 to-purple-500"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                    {proj.icon}
                  </div>
                  <span className="text-xs text-slate-500 font-mono">PROYECTO 0{idx + 1}</span>
                </div>

                <h3 className="text-4xl font-extrabold text-white mb-2">{proj.title}</h3>
                <h4 className="text-lg font-medium text-blue-400 mb-4">{proj.subtitle}</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-md">
                  {proj.description}
                </p>

                {/* Tags de stack */}
                <div className="flex flex-wrap gap-2 mb-6 max-w-md">
                  {proj.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-white/5 text-slate-300 px-2.5 py-1 rounded border border-white/5 font-mono">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Métricas destacadas */}
                <div className="flex items-center gap-2 mb-8 bg-emerald-500/5 border border-emerald-500/10 px-4 py-2.5 rounded-xl w-fit">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 font-mono">{proj.metric}</span>
                </div>

                {proj.url !== '#' && (
                  <a
                    href={proj.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-white hover:text-blue-400 font-bold transition-colors w-fit border-b border-white/20 pb-0.5"
                  >
                    Visitar plataforma en producción <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* RIGHT SIDE STICKY IMAGE MOCKUP PANEL */}
          <div className="col-span-6 sticky top-0 h-screen flex items-center justify-center z-10">
            <div className="relative w-full aspect-[4/3] max-w-lg rounded-3xl overflow-hidden border border-white/10 bg-[#0b0f19]/80 backdrop-blur-xl p-4 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              
              {/* Dynamic glowing halo behind the active mockup */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {projects.map((proj, idx) => (
                    activeIndex === idx && (
                      <motion.div
                        key={proj.id}
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05, y: -15 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0 w-full h-full"
                      >
                        <Image
                          src={proj.image}
                          alt={proj.title}
                          fill
                          className="object-cover object-center p-2 rounded-2xl"
                          sizes="(max-width: 768px) 100vw, 500px"
                          priority
                        />
                      </motion.div>
                    )
                  ))}
                </AnimatePresence>
              </div>

              {/* Decorative Tech Grid lines on the container */}
              <div className="absolute top-2 left-4 text-[8px] text-slate-600 font-mono">PREVIEW_FRAME_V2.1</div>
              <div className="absolute bottom-2 right-4 text-[8px] text-slate-600 font-mono">STATUS: RENDERING</div>
            </div>
          </div>

        </div>
      </div>

      {/* --- MOBILE LAYOUT (block md:hidden) --- */}
      <div className="block md:hidden py-16 px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
          Casos de Éxito
        </div>
        <h2 className="text-3xl font-black text-white mb-10 leading-none">
          Ingeniería en producción
        </h2>

        <div className="space-y-12">
          {projects.map((proj, idx) => (
            <div key={proj.id} className="bg-[#0b0f19] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-blue-400">
                  {proj.icon}
                </div>
                <span className="text-xs text-slate-500 font-mono">PROYECTO 0{idx + 1}</span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-1">{proj.title}</h3>
              <h4 className="text-sm font-medium text-blue-400 mb-4">{proj.subtitle}</h4>
              
              {/* Responsive Image Mockup */}
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-slate-950 mb-6">
                <Image
                  src={proj.image}
                  alt={proj.title}
                  fill
                  className="object-cover object-center p-1 rounded-xl"
                  sizes="100vw"
                />
              </div>

              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                {proj.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {proj.tags.map(tag => (
                  <span key={tag} className="text-[9px] bg-white/5 text-slate-300 px-2 py-0.5 rounded font-mono">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Métricas destacadas */}
              <div className="flex items-center gap-2 mb-6 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1.5 rounded-lg w-fit">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 font-mono">{proj.metric}</span>
              </div>

              {proj.url !== '#' && (
                <a
                  href={proj.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-white hover:text-blue-400 font-bold transition-colors w-fit border-b border-white/20 pb-0.5"
                >
                  Ver en producción <ArrowUpRight size={12} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
