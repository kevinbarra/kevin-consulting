'use client';

import { Search, Code2, Rocket, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: "Diagnóstico Sin Costo",
    description: "No vendemos por vender. Primero nos sentamos contigo (o por Zoom), vemos cómo opera tu panadería o negocio, y encontramos dónde se está fugando el dinero.",
    icon: <Search className="w-6 h-6 text-blue-400" />,
  },
  {
    id: 2,
    title: "Ingeniería a la Medida",
    description: "Nada de plantillas genéricas. Desarrollamos el sistema exacto que necesitas. Si ocupas inventario, hacemos inventario. Si ocupas citas, hacemos citas.",
    icon: <Code2 className="w-6 h-6 text-purple-400" />,
  },
  {
    id: 3,
    title: "Implementación y Despegue",
    description: "Te entregamos el control. Te enseñamos a usarlo (es tan fácil como usar Facebook) y te damos soporte para asegurar que tu negocio crezca.",
    icon: <Rocket className="w-6 h-6 text-emerald-400" />,
  },
];

export default function HowItWorks() {
  return (
    // AGREGAMOS EL ID AQUÍ ABAJO 👇
    <section id="proceso" className="py-24 relative overflow-hidden">
      
      {/* Fondo sutil */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl bg-blue-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Cómo logramos el cambio?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Sin tecnicismos complicados. Un proceso transparente de 3 pasos diseñado para dueños de negocio, no para programadores.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Línea conectora (Solo en Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0" />

          {steps.map((step) => (
            <div key={step.id} className="relative group">
              
              {/* El Punto Brillante */}
              <div className="w-24 h-24 mx-auto bg-[#0f172a] border border-white/10 rounded-full flex items-center justify-center relative z-10 group-hover:border-blue-500/50 group-hover:scale-110 transition-all duration-300 shadow-xl">
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                {step.icon}
              </div>

              {/* El Contenido */}
              <div className="text-center mt-8">
                <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                  <span className="text-blue-400 font-bold">0{step.id}</span>
                  <span>FASE</span>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}

        </div>

        {/* Banner de Confianza Extra */}
        <div className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
              <CheckCircle2 />
            </div>
            <div>
              <h4 className="font-bold text-lg">Garantía de Usabilidad</h4>
              <p className="text-slate-400 text-sm">Si tu equipo no le entiende al sistema en 1 semana, lo rediseñamos gratis.</p>
            </div>
          </div>
          <a href="#contacto" className="whitespace-nowrap px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-slate-200 transition-colors">
            Empezar Ahora
          </a>
        </div>

      </div>
    </section>
  );
}