'use client';

import { Search, Code2, Rocket, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    id: 1,
    title: "Diagnóstico Sin Costo",
    description: "No vendemos por vender. Primero nos sentamos contigo, vemos cómo opera tu negocio y encontramos dónde se está fugando el dinero.",
    icon: <Search className="w-6 h-6 text-blue-400" />,
    color: "blue",
    glowColor: "bg-sky-500/30",
    borderColor: "border-sky-500/50",
  },
  {
    id: 2,
    title: "Ingeniería a la Medida",
    description: "Nada de plantillas genéricas. Desarrollamos el sistema exacto que necesitas. Si ocupas inventario, hacemos inventario.",
    icon: <Code2 className="w-6 h-6 text-purple-400" />,
    color: "purple",
    glowColor: "bg-purple-500/20",
    borderColor: "border-purple-500/50",
  },
  {
    id: 3,
    title: "Implementación y Despegue",
    description: "Te entregamos el control. Te enseñamos a usarlo (es tan fácil como usar Facebook) y te damos soporte para asegurar que tu negocio crezca.",
    icon: <Rocket className="w-6 h-6 text-emerald-400" />,
    color: "emerald",
    glowColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/50",
  },
];

export default function HowItWorks() {
  const RAY_SPEED = 5;
  const PAUSE = 2;
  const TIMING = [0, 0.38, 0.85];

  return (
    <section id="proceso" className="py-24 relative overflow-hidden">

      {/* --- OPTIMIZACIÓN DE RENDIMIENTO --- */}
      {/* Reemplazamos el 'blur-[120px]' (pesado) por un gradiente radial (ligero) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] bg-[radial-gradient(circle,rgba(37,99,235,0.1)_0%,rgba(0,0,0,0)_70%)] -z-10" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">

        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Cómo logramos el cambio?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Un proceso transparente de 3 pasos diseñado para dueños de negocio, no para programadores.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* --- LÍNEA VERTICAL (MÓVIL) --- */}
          <div className="md:hidden absolute top-0 bottom-0 left-1/2 w-0.5 bg-gradient-to-b from-blue-500/0 via-blue-500/20 to-blue-500/0 -translate-x-1/2" />

          {/* RAYO VERTICAL (MÓVIL) */}
          <motion.div
            className="md:hidden absolute top-0 left-1/2 w-0.5 bg-gradient-to-b from-transparent via-blue-400 to-transparent -translate-x-1/2 z-0"
            initial={{ top: "-10%", opacity: 0 }}
            whileInView={{
              top: "110%",
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: RAY_SPEED,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: PAUSE
            }}
          />

          {/* --- LÍNEA HORIZONTAL (DESKTOP) --- */}
          <div className="hidden md:block absolute top-12 left-[16%] w-[68%] h-0.5 bg-white/5 rounded-full" />

          {/* RAYO HORIZONTAL (DESKTOP) */}
          <motion.div
            className="hidden md:block absolute top-12 left-[16%] h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] z-0"
            initial={{ width: "0%", left: "16%", opacity: 0 }}
            whileInView={{
              width: ["0%", "20%", "0%"],
              left: ["16%", "40%", "84%"],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: RAY_SPEED,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: PAUSE
            }}
          />

          {steps.map((step, index) => (
            <div key={step.id} className="relative flex flex-col items-center text-center group bg-[#0f172a] md:bg-transparent pt-4 md:pt-0 z-10">

              {/* Círculo Principal */}
              <motion.div
                className="w-24 h-24 bg-[#0f172a] border border-white/10 rounded-full flex items-center justify-center relative z-10"
                animate={{
                  borderColor: ["rgba(255,255,255,0.1)", step.borderColor.replace("group-hover:", ""), "rgba(255,255,255,0.1)"],
                  scale: [1, 1.1, 1],
                  boxShadow: ["0 0 0 rgba(0,0,0,0)", `0 0 30px ${step.color === 'blue' ? 'rgba(14,165,233,0.4)' : step.color === 'purple' ? 'rgba(168,85,247,0.4)' : 'rgba(16,185,129,0.4)'}`, "0 0 0 rgba(0,0,0,0)"]
                }}
                transition={{
                  duration: RAY_SPEED,
                  repeat: Infinity,
                  delay: (RAY_SPEED * TIMING[index]),
                  repeatDelay: PAUSE,
                  times: [0, 0.1, 0.3],
                  ease: "easeOut"
                }}
              >
                {/* Glow Interno */}
                <motion.div
                  className={`absolute inset-0 ${step.glowColor} rounded-full blur-xl opacity-40`}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: RAY_SPEED,
                    repeat: Infinity,
                    delay: (RAY_SPEED * TIMING[index]),
                    repeatDelay: PAUSE,
                    times: [0, 0.1, 0.5],
                  }}
                />

                <div className="relative z-20">
                  {step.icon}
                </div>

                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#1e293b] border border-white/10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  {step.id}
                </div>
              </motion.div>

              <div className="mt-8 relative z-10 bg-[#0f172a] md:bg-transparent px-2">
                <motion.h3
                  className="text-xl font-bold mb-3 transition-colors duration-300"
                  animate={{ color: ["#fff", step.id === 1 ? "#38bdf8" : step.id === 2 ? "#c084fc" : "#34d399", "#fff"] }}
                  transition={{
                    duration: RAY_SPEED,
                    repeat: Infinity,
                    delay: (RAY_SPEED * TIMING[index]),
                    repeatDelay: PAUSE,
                    times: [0, 0.1, 0.5],
                  }}
                >
                  {step.title}
                </motion.h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            </div>
          ))}

        </div>

        {/* Banner de Confianza */}
        <motion.div
          className="mt-24 p-1 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-[#0b1121] rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0">
                <CheckCircle2 />
              </div>
              <div>
                <h4 className="font-bold text-lg text-white">Garantía de Usabilidad 100%</h4>
                <p className="text-slate-400 text-sm mt-1">
                  Tu equipo aprenderá a usar el sistema en menos de 30 minutos, o te devolvemos tu dinero.
                </p>
              </div>
            </div>
            <a
              href="#contacto"
              className="whitespace-nowrap px-8 py-3 bg-white hover:bg-slate-200 text-black font-bold rounded-full transition-colors shadow-lg shadow-white/5"
            >
              Comenzar Ahora
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
}