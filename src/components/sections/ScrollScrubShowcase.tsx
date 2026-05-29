'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, CheckCircle2, Shield, Zap, Terminal, Smartphone } from 'lucide-react';

const projects = [
  {
    id: 0,
    title: "Sistema de Reservas en Línea",
    subtitle: "Optimización de Agenda y Mensajería Automática",
    description: "Automatiza la programación de citas y la gestión de caja para negocios de servicios. Permite que tus clientes agenden de forma autónoma las 24 horas, eliminando llamadas constantes y reduciendo las inasistencias mediante recordatorios automáticos por mensajes de texto.",
    tags: ["Calendario Inteligente", "Caja Digital", "Recordatorios de Citas", "Reporte de Ventas"],
    metric: "Cero pérdidas por inasistencias",
    url: "https://fulanos.agendabarber.pro/book/fulanos",
    image: "/barber.png",
    color: "from-orange-500/20 to-red-500/20",
    icon: <Zap className="text-orange-400" size={20} />
  },
  {
    id: 1,
    title: "Plataforma de Reserva Directa",
    subtitle: "Canal Directo de Rentas Vacacionales y Hotelería",
    description: "Desarrollamos sitios web para hospedajes y propiedades de descanso que permiten recibir reservas directas sin pagar comisiones intermedias a terceras plataformas. Incluye un sistema de pagos seguro y un panel intuitivo para control de tarifas, fechas bloqueadas e inventarios.",
    tags: ["Pagos Directos", "Navegación Fluida", "Gestión de Tarifas", "Cero Comisiones"],
    metric: "+40% Reservas Directas",
    url: "#",
    image: "/airbnb.png",
    color: "from-blue-500/20 to-indigo-500/20",
    icon: <Shield className="text-blue-400" size={20} />
  },
  {
    id: 2,
    title: "Aplicación de Fidelización de Clientes",
    subtitle: "Pedidos Anticipados y Monedero Digital Inteligente",
    description: "Aplicación móvil y panel administrativo para negocios de alimentos y bebidas que impulsa la recurrencia de compra. Los clientes ordenan desde su celular, acumulan saldo en su monedero digital y canjean beneficios automáticos mediante escaneo en caja.",
    tags: ["Pedidos para Llevar", "Monedero de Saldo", "Cupones Interactivos", "Escaneo en Caja"],
    metric: "+24% Frecuencia de Compra",
    url: "#",
    image: "/kofii.png",
    color: "from-amber-500/20 to-orange-500/20",
    icon: <Smartphone className="text-amber-400" size={20} />
  },
  {
    id: 3,
    title: "Gestión de Pedidos en Tiempo Real",
    subtitle: "Sincronización Inmediata entre Cajas y Pantallas de Cocina",
    description: "Orquestador operativo desarrollado para coordinar y agilizar el flujo de comandas en restaurantes. Sincroniza de forma instantánea los pedidos tomados en caja con pantallas digitales en cocina, eliminando errores de comandas, ahorrando papel y acelerando la entrega de alimentos.",
    tags: ["Sincronización Digital", "Pantallas de Cocina", "Cero Tickets de Papel", "Tiempos del Servicio"],
    metric: "-35% Tiempos de Entrega",
    url: "#",
    image: "/cloud.png",
    color: "from-purple-500/20 to-indigo-500/20",
    icon: <Terminal className="text-purple-400" size={20} />
  }
];

function ProjectInteractiveMockup({ id }: { id: number }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  if (id === 0) {
    // General Intro System Status Dashboard
    return (
      <div className="w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-slate-950/40 text-slate-200 text-[10px] sm:text-xs font-mono select-none">
        {/* Header bar of system */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span className="text-[9px] sm:text-[10px] text-blue-400 font-bold uppercase tracking-wider">MONITOR GENERAL</span>
          </div>
          <span className="text-[8px] sm:text-[9px] text-slate-500">INFRAESTRUCTURA ACTIVA</span>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 my-2 flex-1">
          {/* Box 1: Server Stats */}
          <div className="bg-slate-900/60 rounded-xl p-2 sm:p-3 border border-white/5 flex flex-col justify-between">
            <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Rendimiento</span>
            <div className="space-y-1.5 my-1">
              <div className="flex justify-between text-[9px] sm:text-[10px]">
                <span className="text-slate-400">Uso CPU</span>
                <span className="text-emerald-400 font-bold">12%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-emerald-400" 
                  animate={{ width: ["10%", "15%", "12%"] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>
              <div className="flex justify-between text-[9px] sm:text-[10px]">
                <span className="text-slate-400">Latencia</span>
                <span className="text-emerald-400 font-bold">14ms</span>
              </div>
            </div>
            <span className="text-[7px] text-slate-500">Servidores Cloud: OK</span>
          </div>

          {/* Box 2: Sincronización */}
          <div className="bg-slate-900/60 rounded-xl p-2 sm:p-3 border border-white/5 flex flex-col justify-between overflow-hidden relative">
            <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Flujo de Datos</span>
            {/* Visual nodes pulsing */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 my-2">
              <div className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-400 flex items-center justify-center text-[7px] text-blue-300 font-bold shrink-0">BD</div>
              <span className="text-slate-500 animate-pulse text-[8px] sm:text-[10px]">──➔</span>
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-[7px] text-emerald-300 font-bold shrink-0">API</div>
            </div>
            <span className="text-[7px] text-slate-500 text-center">Tasa de éxito: 100%</span>
          </div>
        </div>

        {/* Live logs terminal box */}
        <div className="bg-[#0b0f19] border border-white/5 rounded-lg p-2 font-mono text-[8px] text-slate-400">
          <div className="flex justify-between text-slate-550 border-b border-white/5 pb-1 mb-1">
            <span>Diagnóstico del Sistema</span>
            <span className="text-emerald-500 animate-pulse">● online</span>
          </div>
          <div className="space-y-0.5">
            <div>[sys] Optimización de base de datos... exitosa</div>
            <div>[sys] Carga de páginas instantánea... lista</div>
            <div>[sys] Respuesta del servidor en 14ms... activa</div>
          </div>
        </div>
      </div>
    );
  }

  if (id === 1) {
    return (
      <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-between bg-slate-950/40 text-slate-200 text-[10px] sm:text-xs font-mono select-none">
        {/* Header bar of mock mobile/web app */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold uppercase tracking-wider">RESERVAS ACTIVO</span>
          </div>
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold">12:40 PM</span>
        </div>

        {/* Calendar Grid */}
        <div className="my-1.5 bg-slate-900/60 rounded-xl p-2.5 sm:p-3 border border-white/5">
          <div className="text-[9px] sm:text-[10px] text-slate-500 mb-1.5 uppercase font-bold tracking-wider">Horarios de Hoy</div>
          <div className="grid grid-cols-4 gap-1.5">
            {['09:00', '10:30', '12:00', '14:30', '16:00', '17:30', '19:00', '20:30'].map((time, idx) => {
              const isActive = idx === 2; // 12:00 PM is selected
              return (
                <div
                  key={time}
                  className={`py-1 sm:py-2 rounded-lg text-center text-[9px] sm:text-[10px] font-bold border transition-all duration-300 ${
                    isActive 
                      ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)] scale-105' 
                      : 'bg-white/5 border-white/5 text-slate-550'
                  }`}
                >
                  {time}
                </div>
              );
            })}
          </div>
        </div>

        {/* WhatsApp message simulator */}
        <motion.div
          key={tick}
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-900 border border-white/10 p-2.5 sm:p-3 rounded-xl shadow-xl flex gap-2.5 items-start"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 text-base">
            💬
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold">Aviso Automático SMS</span>
              <span className="text-[8px] text-slate-500">Ahora</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-350 leading-tight font-sans">
              "Tu reservación para hoy a las <strong className="text-white">12:00 PM</strong> ha sido confirmada con éxito."
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (id === 2) {
    return (
      <div className="w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-slate-950/40 text-slate-200 text-[10px] sm:text-xs font-mono select-none">
        {/* Lodging Mock Card */}
        <div className="relative rounded-xl overflow-hidden bg-slate-900/80 border border-white/10 flex-1 flex flex-col">
          {/* Mock cabin landscape drawing using CSS/SVG */}
          <div className="relative h-20 sm:h-28 w-full bg-gradient-to-b from-blue-950/40 to-slate-950 border-b border-white/5 flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 100 50" className="absolute bottom-0 w-full h-16 sm:h-20 text-slate-950 fill-current opacity-60">
              <path d="M 0 50 L 30 15 L 60 50 Z" />
              <path d="M 40 50 L 70 20 L 100 50 Z" />
            </svg>
            {/* The cabin inside the landscape */}
            <svg viewBox="0 0 20 20" className="w-9 h-9 sm:w-12 sm:h-12 text-blue-400 fill-none stroke-current stroke-[1.5] absolute bottom-1.5 z-10">
              <path d="M 3 17 L 10 3 L 17 17 Z" />
              <path d="M 7 17 L 7 11 L 13 11 L 13 17" />
            </svg>
            <div className="absolute top-1.5 right-2 sm:right-3 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded-full border border-white/10 text-[8px] sm:text-[9px] text-amber-400">
              ★ 4.96
            </div>
            <div className="absolute top-1.5 left-2 sm:left-3 text-[8px] sm:text-[9px] text-slate-500 font-bold">Valle de Bravo</div>
          </div>

          {/* Details & Payment Simulator */}
          <div className="p-2 sm:p-3 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-sans font-bold text-white text-[11px] sm:text-[13px] truncate mr-2">Estancia de Descanso</span>
                <span className="text-[10px] sm:text-[11px] text-emerald-400 font-bold shrink-0">$2,200 <span className="text-[7px] sm:text-[8px] text-slate-500 font-normal">/noche</span></span>
              </div>
              <p className="text-[8px] sm:text-[9px] text-slate-550 font-sans">Reservación Directa • 3 Noches • 2 Personas</p>
            </div>

            {/* Simulated Checkout state */}
            <div className="mt-1 bg-slate-950 border border-white/5 rounded-lg p-1.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs shrink-0">💳</span>
                <span className="text-[8px] sm:text-[9px] text-slate-300 truncate">Pago Directo Seguro</span>
              </div>
              <span className="text-[8px] sm:text-[9px] text-emerald-400 font-bold uppercase tracking-wider animate-pulse flex items-center gap-1 shrink-0">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                Cero Comisiones
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (id === 3) {
    return (
      <div className="w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-slate-950/40 text-slate-200 text-[10px] sm:text-xs font-mono select-none">
        {/* Phone screen loyalty simulator */}
        <div className="mx-auto w-full max-w-[210px] sm:max-w-[240px] bg-slate-900 border border-white/10 rounded-2xl p-3 sm:p-4 flex-1 flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div className="text-center pb-1.5 border-b border-white/5">
            <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold tracking-wider uppercase">Monedero Electrónico</span>
            <div className="text-sm sm:text-base font-black text-amber-400 mt-0.5">$320.00 <span className="text-[8px] sm:text-[9px] text-slate-500 font-normal">Saldo</span></div>
          </div>

          {/* Stamp Card Grid */}
          <div className="my-2 py-1.5 bg-slate-950/50 rounded-xl p-2 sm:p-3 border border-white/5 flex flex-col items-center">
            <span className="text-[7px] sm:text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Puntos de Visita</span>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const isStamped = num <= 6; // 6 stamped, 7th animates
                const isAnimating = num === 7 && tick >= 2;
                return (
                  <div
                    key={num}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center text-[9px] sm:text-[10px] transition-all duration-500 ${
                      isStamped
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                        : isAnimating
                        ? 'bg-amber-400 border-amber-300 text-slate-950 scale-115 shadow-[0_0_15px_rgba(245,158,11,0.4)] font-bold'
                        : 'bg-white/5 border-white/5 text-slate-600'
                    }`}
                  >
                    {isStamped || isAnimating ? '★' : num}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Alert toast */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-1.5 text-center text-[7px] sm:text-[8px] text-emerald-400 font-bold leading-tight">
            {tick >= 2 ? '¡7º Sello Registrado! +$30.00' : 'Acumula saldo en cada visita'}
          </div>
        </div>
      </div>
    );
  }

  // id === 4: Restaurantes / Tiempos de servicio
  return (
    <div className="w-full h-full p-3.5 sm:p-4 flex flex-col justify-between bg-slate-950/40 text-slate-200 text-[10px] sm:text-xs font-mono select-none">
      {/* Board Layout Columns */}
      <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-1.5">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
          <span className="text-[8px] sm:text-[9px] text-blue-400 font-bold uppercase tracking-widest">MONITOR DE COMANDAS</span>
        </div>
        <span className="text-[7px] sm:text-[8px] text-slate-550">ACTIVO</span>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-1.5">
        {/* Column 1: Caja */}
        <div className="bg-slate-900/60 rounded-xl p-1.5 border border-white/5 flex flex-col">
          <div className="text-[7px] sm:text-[8px] text-slate-500 font-bold border-b border-white/5 pb-1 mb-1.5 uppercase text-center">Caja</div>
          <div className="flex-1 flex flex-col justify-center">
            {tick === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className="bg-blue-500/10 border border-blue-500/30 p-1 rounded text-[7px] text-blue-300 overflow-hidden"
              >
                <div className="font-bold truncate">Ped #42</div>
                <div className="text-[6px] text-slate-500 truncate">1x Combo</div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Column 2: Preparando */}
        <div className="bg-slate-900/60 rounded-xl p-1.5 border border-white/5 flex flex-col">
          <div className="text-[7px] sm:text-[8px] text-slate-500 font-bold border-b border-white/5 pb-1 mb-1.5 uppercase text-center">Cocina</div>
          <div className="flex-1 flex flex-col justify-center gap-1.5">
            {(tick === 1 || tick === 0) && (
              <motion.div
                layout
                className="bg-orange-500/10 border border-orange-500/30 p-1 rounded text-[7px] text-orange-300 overflow-hidden"
              >
                <div className="font-bold truncate">Ped #41</div>
                <div className="text-[6px] text-slate-500 truncate">2x Tacos</div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Column 3: Listo */}
        <div className="bg-slate-900/60 rounded-xl p-1.5 border border-white/5 flex flex-col">
          <div className="text-[7px] sm:text-[8px] text-slate-500 font-bold border-b border-white/5 pb-1 mb-1.5 uppercase text-center">Listo</div>
          <div className="flex-1 flex flex-col justify-center gap-1.5">
            {(tick === 2 || tick === 3) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/30 p-1 rounded text-[7px] text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.1)] overflow-hidden"
              >
                <div className="font-bold flex items-center justify-between gap-1">
                  <span className="truncate">Ped #40</span>
                  <span className="text-[5px] sm:text-[6px] bg-emerald-500/25 px-0.5 rounded text-emerald-450 shrink-0">Ok</span>
                </div>
                <div className="text-[6px] text-slate-550 truncate">1x Bebidas</div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Connection summary */}
      <div className="mt-1.5 text-center text-[7px] sm:text-[8px] text-slate-500 bg-[#0b0f19] border border-white/5 py-1 rounded">
        Sincronización en menos de 100ms
      </div>
    </div>
  );
}

export default function ScrollScrubShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-40% 0px -40% 0px", // Trigger when the element crosses the middle 20% of the viewport
      threshold: 0.1
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idxAttr = entry.target.getAttribute("data-showcase-idx");
          if (idxAttr !== null) {
            setActiveIndex(parseInt(idxAttr, 10));
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    const targets = document.querySelectorAll("[data-showcase-idx]");
    targets.forEach((target) => observer.observe(target));

    return () => {
      targets.forEach((target) => observer.unobserve(target));
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full bg-[#030712]">
      {/* BACKGROUND DECORATIVE SHADOWS */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(37,99,235,0.02),transparent_60%)] pointer-events-none" />

      {/* --- DESKTOP STICKY LAYOUT (md:block) --- */}
      <div className="hidden md:block relative w-full">
        {/* Added items-start to grid container to allow sticky column to slide inside the container */}
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE TEXT BLOCKS */}
          <div className="col-span-6 space-y-[10vh] pb-[20vh] z-20">
            
            {/* Header del Showcase */}
            <div data-showcase-idx="0" className="h-screen flex flex-col justify-center pr-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold mb-4 uppercase tracking-wider w-fit">
                Nuestras Soluciones
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-none text-white mb-6">
                Ingeniería aplicada <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                  al crecimiento.
                </span>
              </h2>
              <p className="text-slate-400 text-lg font-light leading-relaxed max-w-md">
                Desplaza la página para ver cómo optimizamos los procesos de tu negocio y eliminamos las ineficiencias de forma permanente.
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
              <div key={proj.id} data-showcase-idx={idx + 1} className="h-screen flex flex-col justify-center pr-12 relative">
                <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-[2px] h-[100px] bg-slate-800">
                  {activeIndex === idx + 1 && (
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
                  <span className="text-xs text-slate-500 font-mono">SOLUCIÓN 0{idx + 1}</span>
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
                    Ver demostración del sistema <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* RIGHT SIDE STICKY IMAGE MOCKUP PANEL */}
          <div className="col-span-6 sticky top-0 h-screen flex items-center justify-center z-10 self-start">
            <div className="relative w-full aspect-[4/3] max-w-lg rounded-3xl overflow-hidden border border-white/10 bg-[#0b0f19]/80 backdrop-blur-xl p-4 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              
              {/* Dynamic glowing halo behind the active mockup */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.05, y: -15 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <ProjectInteractiveMockup id={activeIndex} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Decorative Tech Grid lines on the container */}
              <div className="absolute top-2 left-4 text-[8px] text-slate-600 font-mono">SIMULATION_FRAME_V2.1</div>
              <div className="absolute bottom-2 right-4 text-[8px] text-slate-600 font-mono">STATUS: SIMULATING</div>
            </div>
          </div>

        </div>
      </div>

      {/* --- MOBILE LAYOUT (block md:hidden) --- */}
      <div className="block md:hidden py-16 px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
          Nuestras Soluciones
        </div>
        <h2 className="text-3xl font-black text-white mb-10 leading-none">
          Ingeniería en Producción
        </h2>

        <div className="space-y-12">
          {projects.map((proj, idx) => (
            <div key={proj.id} className="bg-[#0b0f19] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-blue-400">
                  {proj.icon}
                </div>
                <span className="text-xs text-slate-500 font-mono">SOLUCIÓN 0{idx + 1}</span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-1">{proj.title}</h3>
              <h4 className="text-sm font-medium text-blue-400 mb-4">{proj.subtitle}</h4>
              
              {/* Responsive SVG Mockup with fixed height to prevent mobile overlap */}
              <div className="relative w-full h-72 rounded-xl overflow-hidden border border-white/10 bg-slate-950 mb-6">
                <ProjectInteractiveMockup id={idx + 1} />
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
                  Ver demo de producción <ArrowUpRight size={12} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
