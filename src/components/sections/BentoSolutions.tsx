'use client';

import Reveal from '../layout/Reveal';
import SpotlightCard from '../layout/SpotlightCard';
import { CheckCircle2, TrendingUp, Layers, Cpu, Server } from 'lucide-react';
import { InventoryMockup, QueueMockup, PerformanceMockup, CloudMockup, CodeConsoleMockup } from '../canvas/InteractiveMockup';

export default function BentoSolutions() {
  return (
    <section id="soluciones" className="relative z-20 py-24 px-6 md:px-10 max-w-7xl mx-auto">
      {/* Background radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[600px] bg-[radial-gradient(circle,rgba(59,130,246,0.03)_0%,rgba(0,0,0,0)_70%)] -z-10" />

      <div className="text-center mb-20 flex flex-col items-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
            Ingeniería de Software de Alto Nivel
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-none">
            Sistemas que resuelven <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">fugas financieras</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-slate-400 max-w-xl text-center text-sm md:text-base">
            Dejamos atrás las plantillas simples. Desarrollamos infraestructura de nivel empresarial diseñada para automatizar procesos y escalar tu margen de ganancia.
          </p>
        </Reveal>
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 1. ERP & INVENTARIO */}
        <div className="md:col-span-2">
          <Reveal width="100%">
            <SpotlightCard className="h-full p-8 group flex flex-col justify-between" spotlightColor="rgba(59, 130, 246, 0.2)">
              <div className="absolute top-0 right-0 p-32 bg-blue-500/5 blur-[80px] rounded-full -z-10" />
              
              <div className="flex flex-col md:flex-row gap-8 items-center justify-between h-full">
                <div className="flex-1 space-y-4">
                  <div className="inline-block px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-[10px] font-bold tracking-wider uppercase">
                    Pérdidas por Stock
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Sistemas ERP & Gestión de Stock</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                    Evita compras a ciegas y merma de inventario. Desarrollamos algoritmos de reabastecimiento inteligente que calculan puntos críticos de stock y envían alertas autónomas de compra.
                  </p>
                  <ul className="space-y-2 text-xs font-medium text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      Control de inventarios multi-sucursal en tiempo real.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      Predicción automatizada de stock crítico.
                    </li>
                  </ul>
                </div>

                <div className="shrink-0 w-full md:w-fit flex justify-center">
                  <InventoryMockup />
                </div>
              </div>
            </SpotlightCard>
          </Reveal>
        </div>

        {/* 2. AUTOMATIZACIÓN DE TURNOS / QUEUE INTELLIGENCE */}
        <div>
          <Reveal width="100%" delay={0.1}>
            <SpotlightCard className="h-full p-8 group flex flex-col justify-between" spotlightColor="rgba(249, 115, 22, 0.2)">
              <div className="absolute bottom-0 left-0 p-20 bg-orange-500/5 blur-[60px] rounded-full -z-10" />
              
              <div className="space-y-4 mb-6">
                <div className="inline-block px-3 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-[10px] font-bold tracking-wider uppercase">
                  Cuello de Botella Operativo
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Optimización del Flujo de Clientes</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Reduce tiempos de espera ineficientes. Sistemas de gestión de filas con tableros interactivos de llamadas y analíticas de desempeño por operador.
                </p>
              </div>

              <div className="w-full flex justify-center mb-4">
                <QueueMockup />
              </div>
            </SpotlightCard>
          </Reveal>
        </div>

        {/* 3. HIGH PERFORMANCE SAAS */}
        <div>
          <Reveal width="100%">
            <SpotlightCard className="h-full p-8 group flex flex-col justify-between" spotlightColor="rgba(16, 185, 129, 0.2)">
              <div className="absolute top-0 right-0 p-20 bg-emerald-500/5 blur-[60px] rounded-full -z-10" />
              
              <div className="space-y-4 mb-6">
                <div className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold tracking-wider uppercase">
                  Conversión & Autoridad
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">SaaS & Plataformas a la Medida</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Sistemas web ultra-rápidos que proyectan solidez corporativa y cargan al instante. Optimizados con Core Web Vitals excelentes para maximizar conversiones y ventas.
                </p>
              </div>

              <div className="w-full flex justify-center mb-4">
                <PerformanceMockup />
              </div>
            </SpotlightCard>
          </Reveal>
        </div>

        {/* 4. CLOUD INFRASTRUCTURE & DEVOPS */}
        <div className="md:col-span-2">
          <Reveal width="100%" delay={0.1}>
            <SpotlightCard className="h-full p-8 group flex flex-col justify-between" spotlightColor="rgba(168, 85, 247, 0.2)">
              <div className="absolute bottom-0 left-0 p-32 bg-purple-500/5 blur-[80px] rounded-full -z-10" />
              
              <div className="flex flex-col md:flex-row-reverse gap-8 items-center justify-between h-full">
                <div className="flex-1 space-y-4">
                  <div className="inline-block px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-[10px] font-bold tracking-wider uppercase">
                    Dependencia Técnica
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Infraestructura Cloud Autónoma</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                    Tu sistema debe trabajar 24/7 sin caídas. Diseñamos despliegues automatizados (CI/CD) con contenedores redundantes serverless que escalan elásticamente según la demanda real del tráfico.
                  </p>
                  <ul className="space-y-2 text-xs font-medium text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      Cero downtime durante despliegues y actualizaciones.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      Automatización de respaldos y monitoreo inteligente de salud.
                    </li>
                  </ul>
                </div>

                <div className="shrink-0 w-full md:w-fit flex justify-center">
                  <CodeConsoleMockup />
                </div>
              </div>
            </SpotlightCard>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
