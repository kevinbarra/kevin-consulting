'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import SpotlightCard from '../layout/SpotlightCard';
import { MapPin, Star, X, Terminal, Cpu, CheckCircle } from 'lucide-react';

export default function About() {
   const [isTerminalOpen, setIsTerminalOpen] = useState(false);
   const [terminalLines, setTerminalLines] = useState<string[]>([]);
   const [activeCommand, setActiveCommand] = useState<string | null>(null);
   const terminalBottomRef = useRef<HTMLDivElement>(null);

   // Terminal boot logs simulator
   useEffect(() => {
      if (isTerminalOpen) {
         setTerminalLines([]);
         setActiveCommand(null);
         const logs = [
            'INICIANDO CONSOLA DE DIAGNÓSTICO KEVIN_BARRA_CLI v2.4...',
            'ESTABLECIENDO ENLACE SSH SEGURO A MÓDULO CENTRAL...',
            'CONEXIÓN ESTABLECIDA • PUERTO SEGURO 2200',
            'SISTEMA: ONLINE • NÚCLEO ACTIVO • 60 FPS',
            '--------------------------------------------------',
            'MENSAJE DEL PROGRAMADOR:',
            '» "Hola. Si llegaste hasta aquí, es porque valoras los sistemas bien construidos.',
            '   No desarrollo plantillas genéricas. Creo la infraestructura digital que automatiza',
            '   tus tareas cotidianas, elimina los errores de tu personal y blinda tu margen',
            '   de ganancia. Hagamos que tu negocio crezca en piloto automático."',
            '--------------------------------------------------',
            'Escribe o selecciona un comando para interactuar:'
         ];

         let currentLine = 0;
         const interval = setInterval(() => {
            if (currentLine < logs.length) {
               setTerminalLines(prev => [...prev, logs[currentLine]]);
               currentLine++;
            } else {
               clearInterval(interval);
            }
         }, 180);

         return () => clearInterval(interval);
      }
   }, [isTerminalOpen]);

   // Scroll to bottom of terminal automatically
   useEffect(() => {
      if (terminalBottomRef.current) {
         terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
   }, [terminalLines]);

   const runCommand = (cmd: string) => {
      setActiveCommand(cmd);
      if (cmd === 'salir') {
         setTerminalLines(prev => [...prev, '> ejecutando: salir...', 'Desconectando sesión...', '¡Hasta pronto!']);
         setTimeout(() => {
            setIsTerminalOpen(false);
         }, 800);
      } else if (cmd === 'habilidades') {
         setTerminalLines(prev => [
            ...prev,
            '> ejecutando: ver_habilidades...',
            '• Sincronización instantánea de datos (menos de 100ms)',
            '• Automatización de flujos de recordatorios por mensajes',
            '• Pasarelas de cobro seguras y directas libres de comisiones',
            '• Reportes analíticos de caja y control de inventarios automáticos'
         ]);
      } else if (cmd === 'cita') {
         setTerminalLines(prev => [
            ...prev,
            '> ejecutando: agendar_cita...',
            'Abriendo agenda del sistema...',
            'Redireccionando al calendario...'
         ]);
         setTimeout(() => {
            setIsTerminalOpen(false);
            const section = document.getElementById('soluciones');
            if (section) {
               section.scrollIntoView({ behavior: 'smooth' });
            }
         }, 1200);
      }
   };

   return (
      <section id="nosotros" className="py-24 relative overflow-hidden">
         <div className="max-w-5xl mx-auto px-6 md:px-10">
            <SpotlightCard className="p-8 md:p-12 bg-[#0f172a]/50 border-white/5" spotlightColor="rgba(59, 130, 246, 0.15)">
               <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">

                  {/* --- FOTO DEL FUNDADOR CON EASTER EGG CLI --- */}
                  <div className="shrink-0 relative group flex flex-col items-center text-center cursor-pointer" onClick={() => setIsTerminalOpen(true)}>
                     {/* Efecto de halo/brillo detrás de la foto */}
                     <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full md:rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                     {/* Contenedor de la imagen */}
                     <div className="relative w-36 h-36 md:w-64 md:h-64 rounded-full md:rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl group-hover:scale-[1.03] transition-transform duration-500 mb-4 md:mb-0">
                        <Image
                           src="/kevin.jpg"
                           alt="Kevin Barra - Fundador"
                           fill
                           className="object-cover"
                           sizes="(max-width: 768px) 144px, 256px"
                           priority
                        />

                        {/* Scanlines / Hacker Terminal Overlay on Hover */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity duration-350 text-emerald-400 font-mono text-[10px] font-bold p-3 text-center">
                           <Terminal size={22} className="mb-2 animate-bounce text-emerald-400" />
                           <span>INICIAR TERMINAL</span>
                           <span className="text-[8px] text-slate-500 mt-1 font-normal">(Click para diagnosticar)</span>
                        </div>
                     </div>

                     {/* Flashing Green CLI active badge */}
                     <div className="absolute -top-2 -right-2 bg-emerald-500/90 text-black text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-1 animate-pulse border border-emerald-300/30 select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-black" />
                        CLI ACTIVA
                     </div>

                     {/* INFORMACIÓN RÁPIDA (SOLO MÓVIL) */}
                     <div className="md:hidden space-y-1 mt-2">
                        <h3 className="text-white font-bold text-xl">Kevin Barra</h3>
                        <p className="text-blue-400 text-sm font-medium">Ingeniero de Software</p>
                        <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                           <MapPin size={10} /> <span>México</span>
                        </div>
                     </div>
                  </div>

                  {/* --- TEXTO "CARTA DEL FUNDADOR" --- */}
                  <div className="flex-1 text-center md:text-left">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold mb-6 uppercase tracking-wider">
                        <Star size={10} className="fill-blue-400 text-blue-400" />
                        Mensaje Directo
                     </div>

                     <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-white">
                        No construimos sitios simples. <br className="hidden md:block" /> Diseñamos motores de rentabilidad.
                     </h2>

                     <div className="space-y-4 text-slate-300 leading-relaxed text-base md:text-lg">
                        <p>
                           Hola, soy <span className="text-white font-semibold">Kevin Barra</span>. A lo largo de mi trayectoria como ingeniero de software, he visto cómo procesos manuales y sistemas frágiles limitan el crecimiento de empresas con gran potencial.
                        </p>
                        <p>
                           Fundé **Kevin Consulting** para llevar soluciones avanzadas de automatización e infraestructura digital a negocios que buscan crecer sin fricciones. No te entrego código genérico; diseño la arquitectura que reduce el desperdicio de tu tiempo y blinda tu margen operativo.
                        </p>
                        <p>
                           Al colaborar conmigo, no tratarás con intermediarios. Trabajarás directamente con el programador y arquitecto del sistema para asegurar soluciones de alto impacto y un rendimiento óptimo.
                        </p>
                     </div>

                     {/* Métrica / Aura Grids (simplified for business audience) */}
                     <div className="grid grid-cols-2 gap-4 mt-8 border-t border-white/5 pt-6">
                        <div>
                           <div className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">99.9%</div>
                           <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Sistemas Sin Caídas</div>
                        </div>
                        <div>
                           <div className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">+30%</div>
                           <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Eficiencia en Operaciones</div>
                        </div>
                        <div>
                           <div className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">100%</div>
                           <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Adaptado a tu Negocio</div>
                        </div>
                        <div>
                           <div className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Automatizado</div>
                           <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Procesos e Inteligencia</div>
                        </div>
                     </div>

                     {/* Firma (Solo PC) */}
                     <div className="hidden md:flex mt-8 border-t border-white/5 pt-6 flex-col items-start gap-1">
                        <div className="text-white font-bold text-xl font-serif italic">Kevin Barra</div>
                        <div className="text-blue-400 text-sm uppercase tracking-widest font-bold">Ingeniero de Software & Fundador</div>
                     </div>

                  </div>
               </div>
            </SpotlightCard>
         </div>

         {/* --- HACKER CLI TERMINAL MODAL (EASTER EGG) --- */}
         <AnimatePresence>
            {isTerminalOpen && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.9, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9, y: 20 }}
                     className="w-full max-w-2xl h-[420px] bg-slate-950 border border-emerald-500/30 rounded-xl overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.25)] flex flex-col font-mono text-emerald-400"
                  >
                     {/* Window Header */}
                     <div className="bg-slate-900 border-b border-white/5 px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Terminal size={14} className="text-emerald-400" />
                           <span className="text-[10px] font-bold text-slate-300">DIAGNOSTICO_SISTEMA@KEVIN_BARRA</span>
                        </div>
                        <button
                           onClick={() => setIsTerminalOpen(false)}
                           className="p-1 rounded-md hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                           <X size={16} />
                        </button>
                     </div>

                     {/* Window Content */}
                     <div className="flex-1 p-4 overflow-y-auto space-y-1.5 text-xs select-text scrollbar-thin">
                        {terminalLines.map((line, idx) => (
                           <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                              {line}
                           </div>
                        ))}
                        <div ref={terminalBottomRef} />
                     </div>

                     {/* CLI Actions panel */}
                     <div className="bg-slate-900 border-t border-white/5 p-3.5 flex flex-wrap gap-2.5 items-center justify-between">
                        <div className="flex gap-2.5">
                           <button
                              disabled={activeCommand !== null}
                              onClick={() => runCommand('cita')}
                              className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded hover:bg-emerald-500/20 text-[10px] font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                           >
                              <CheckCircle size={10} /> 1. agendar_cita
                           </button>
                           <button
                              disabled={activeCommand !== null}
                              onClick={() => runCommand('habilidades')}
                              className="px-3 py-1.5 bg-slate-800 border border-white/10 text-slate-300 rounded hover:bg-slate-700 text-[10px] font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                           >
                              <Cpu size={10} /> 2. ver_habilidades
                           </button>
                        </div>
                        <button
                           onClick={() => runCommand('salir')}
                           className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded hover:bg-red-500/20 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                           <X size={10} /> 3. salir
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </section>
   );
}