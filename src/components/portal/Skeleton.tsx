import React from 'react';

// Elemento base para animaciones de carga
export function SkeletonPulse({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-md border border-white/5 ${className}`} />
  );
}

// Skeleton para el Dashboard Bento (Vista de Administrador)
export function BentoSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[180px]">
      {/* Tarjeta de Gráfico (Grande, ocupa 2x2 en md) */}
      <div className="md:col-span-2 md:row-span-2 border border-white/10 bg-[#1e293b]/30 backdrop-blur-md rounded-3xl p-6 flex flex-col justify-between">
        <div className="space-y-3">
          <SkeletonPulse className="h-6 w-1/3" />
          <SkeletonPulse className="h-4 w-1/5" />
        </div>
        <div className="flex items-end gap-3 h-2/3">
          <SkeletonPulse className="h-1/3 w-full" />
          <SkeletonPulse className="h-2/3 w-full" />
          <SkeletonPulse className="h-1/2 w-full" />
          <SkeletonPulse className="h-3/4 w-full" />
          <SkeletonPulse className="h-1/2 w-full" />
          <SkeletonPulse className="h-full w-full" />
        </div>
      </div>

      {/* Tarjeta de Semáforo de Cobranza (Ocupa 1x2 en md) */}
      <div className="md:row-span-2 border border-white/10 bg-[#1e293b]/30 backdrop-blur-md rounded-3xl p-6 flex flex-col gap-4">
        <div className="space-y-2">
          <SkeletonPulse className="h-6 w-1/2" />
          <SkeletonPulse className="h-4 w-3/4" />
        </div>
        <div className="space-y-3 flex-1 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center p-3 border border-white/5 rounded-xl bg-white/[0.01]">
              <div className="space-y-2 flex-1 mr-4">
                <SkeletonPulse className="h-4 w-2/3" />
                <SkeletonPulse className="h-3 w-1/2" />
              </div>
              <SkeletonPulse className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Tarjeta Métrica Extra 1 */}
      <div className="border border-white/10 bg-[#1e293b]/30 backdrop-blur-md rounded-3xl p-6 flex flex-col justify-between">
        <SkeletonPulse className="h-4 w-1/3" />
        <SkeletonPulse className="h-10 w-1/2 mt-2" />
        <SkeletonPulse className="h-3 w-2/3 mt-2" />
      </div>

      {/* Tarjeta Métrica Extra 2 */}
      <div className="border border-white/10 bg-[#1e293b]/30 backdrop-blur-md rounded-3xl p-6 flex flex-col justify-between">
        <SkeletonPulse className="h-4 w-1/3" />
        <SkeletonPulse className="h-10 w-1/2 mt-2" />
        <SkeletonPulse className="h-3 w-2/3 mt-2" />
      </div>
    </div>
  );
}

// Skeleton para el Portal del Cliente
export function ClientSkeleton() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Cabecera / Saludo */}
      <div className="space-y-3 border-b border-white/10 pb-6">
        <SkeletonPulse className="h-8 w-1/4" />
        <SkeletonPulse className="h-4 w-1/2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Lado Izquierdo: Contratos y Mi Cuenta (Ocupa 2 cols) */}
        <div className="md:col-span-2 space-y-8">
          {/* Tarjeta Contratos */}
          <div className="border border-white/10 bg-[#1e293b]/30 backdrop-blur-md rounded-3xl p-6 space-y-4">
            <SkeletonPulse className="h-6 w-1/3" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between items-center p-4 border border-white/5 rounded-2xl bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <SkeletonPulse className="h-10 w-10 rounded-xl" />
                    <div className="space-y-1">
                      <SkeletonPulse className="h-4 w-40" />
                      <SkeletonPulse className="h-3 w-20" />
                    </div>
                  </div>
                  <SkeletonPulse className="h-8 w-8 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta Mi Cuenta / Historial */}
          <div className="border border-white/10 bg-[#1e293b]/30 backdrop-blur-md rounded-3xl p-6 space-y-4">
            <SkeletonPulse className="h-6 w-1/4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                  <div className="space-y-1">
                    <SkeletonPulse className="h-4 w-32" />
                    <SkeletonPulse className="h-3 w-20" />
                  </div>
                  <div className="flex items-center gap-4">
                    <SkeletonPulse className="h-5 w-16" />
                    <SkeletonPulse className="h-8 w-24 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lado Derecho: Formulario Fiscal */}
        <div className="border border-white/10 bg-[#1e293b]/30 backdrop-blur-md rounded-3xl p-6 h-fit space-y-6">
          <div className="space-y-2">
            <SkeletonPulse className="h-6 w-1/2" />
            <SkeletonPulse className="h-3 w-3/4" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <SkeletonPulse className="h-4 w-1/4" />
                <SkeletonPulse className="h-10 w-full rounded-xl" />
              </div>
            ))}
            <SkeletonPulse className="h-11 w-full rounded-full mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
