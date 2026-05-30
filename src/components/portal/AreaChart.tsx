'use client';

import { useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePortalSim } from '@/app/portal/PortalClientLayout';
import { TrendingUp, Award, DollarSign, LineChart } from 'lucide-react';

interface ChartDataPoint {
  month: string;
  real: number;
  sat: number;
  key: string;
}

export default function AreaChart() {
  const { realBillings } = usePortalSim();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverData, setHoverData] = useState<{
    index: number;
    x: number;
    y: number;
    item: ChartDataPoint;
  } | null>(null);

  // Dimensiones internas del canvas de SVG
  const width = 600;
  const height = 300;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // Generar dinámicamente los últimos 6 meses de datos agrupados por facturas reales
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const shortMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const list: ChartDataPoint[] = [];
    const today = new Date();

    // Crear slots para los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mIndex = d.getMonth();
      const monthKey = `${d.getFullYear()}-${String(mIndex + 1).padStart(2, '0')}`;
      list.push({
        month: shortMonths[mIndex],
        real: 0,
        sat: 0,
        key: monthKey
      });
    }

    // Helper robusto para parsear claves de mes sin desvíos de zona horaria
    const parseMonthKey = (dateStr: string | null | undefined): string | null => {
      if (!dateStr) return null;
      const clean = dateStr.substring(0, 10); // "YYYY-MM-DD"
      const parts = clean.split('-');
      if (parts.length >= 2) {
        return `${parts[0]}-${parts[1]}`; // "YYYY-MM"
      }
      return null;
    };

    // Agrupar e inyectar montos reales de Neon DB
    realBillings.forEach((b: any) => {
      const amount = parseFloat(b.total || b.amount || '0');

      // 1. Agrupación SAT (Facturación por fecha de vencimiento con fiscal_tracked = true)
      if (b.fiscal_tracked) {
        const satKey = parseMonthKey(b.due_date);
        const targetSlot = list.find(s => s.key === satKey);
        if (targetSlot) {
          targetSlot.sat += amount;
        }
      }

      // 2. Agrupación Real (Recaudado por fecha de pago)
      if (b.status === 'pagado') {
        const realKey = parseMonthKey(b.paid_at || b.due_date);
        const targetSlot = list.find(s => s.key === realKey);
        if (targetSlot) {
          targetSlot.real += amount;
        }
      }
    });

    return list;
  }, [realBillings]);

  // Verificar si no hay datos financieros en absoluto
  const isChartEmpty = useMemo(() => {
    return chartData.every(d => d.real === 0 && d.sat === 0);
  }, [chartData]);

  // Rango máximo adaptativo para el eje Y
  const maxValue = useMemo(() => {
    const maxVal = Math.max(...chartData.map(d => Math.max(d.real, d.sat)));
    if (maxVal === 0) return 100000; // Valor por defecto si no hay datos
    // Redondear al múltiplo superior de 50,000 para que las guías se vean profesionales
    return Math.ceil(maxVal / 50000) * 50000;
  }, [chartData]);

  // Mapear un punto a coordenadas SVG
  const getCoordinates = (index: number, value: number) => {
    const x = paddingLeft + (index * (plotWidth / (chartData.length - 1)));
    const y = paddingTop + plotHeight - ((value / maxValue) * plotHeight);
    return { x, y };
  };

  // Generar las coordenadas de los puntos
  const realPoints = chartData.map((d, i) => getCoordinates(i, d.real));
  const satPoints = chartData.map((d, i) => getCoordinates(i, d.sat));

  // Crear strings de caminos (paths) para SVG
  const createLinePath = (points: { x: number; y: number }[]) => {
    return points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  };

  const createAreaPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    const linePath = createLinePath(points);
    const bottomY = paddingTop + plotHeight;
    return `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
  };

  const realLinePath = createLinePath(realPoints);
  const realAreaPath = createAreaPath(realPoints);

  const satLinePath = createLinePath(satPoints);
  const satAreaPath = createAreaPath(satPoints);

  // Manejar el movimiento del mouse para la interactividad
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current || isChartEmpty) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Convertir de coordenadas del DOM a coordenadas internas del SVG (0-600)
    const scaleX = width / rect.width;
    const svgX = mouseX * scaleX;

    // Encontrar el punto de datos más cercano en el eje X
    let closestIndex = 0;
    let minDiff = Infinity;

    for (let i = 0; i < chartData.length; i++) {
      const { x } = getCoordinates(i, 0);
      const diff = Math.abs(svgX - x);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    const { x, y } = getCoordinates(closestIndex, chartData[closestIndex].real);
    
    // Obtener la posición del tooltip en píxeles del DOM
    const ratioX = rect.width / width;
    const ratioY = rect.height / height;
    
    setHoverData({
      index: closestIndex,
      x: x * ratioX,
      y: y * ratioY - 15,
      item: chartData[closestIndex],
    });
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  // Formato para pesos mexicanos
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Diferencia porcentual del último mes
  const lastMonth = chartData[chartData.length - 1];
  const flowDiff = lastMonth.sat > 0 ? ((lastMonth.real - lastMonth.sat) / lastMonth.sat) * 100 : 0;

  return (
    <div className="flex flex-col h-full justify-between relative" ref={containerRef}>
      {/* Cabecera del Gráfico */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Flujo de Caja
            {!isChartEmpty && lastMonth.sat > 0 && (
              <span className={`text-xs border px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold animate-pulse ${
                flowDiff >= 0
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                <TrendingUp size={12} />
                {flowDiff >= 0 ? '+' : ''}{flowDiff.toFixed(1)}% Real vs SAT
              </span>
            )}
          </h3>
          <p className="text-slate-400 text-xs font-light">Comparativa mensual de ingresos depositados vs facturados en Neon DB.</p>
        </div>

        {/* Leyenda interactiva */}
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            <span className="text-slate-300 font-medium">Ingreso Real</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-slate-300 font-medium">Timbrado SAT</span>
          </div>
        </div>
      </div>

      {/* Contenedor del Gráfico SVG */}
      <div className="relative flex-1 min-h-[200px] w-full flex items-center justify-center">
        
        {/* Marca de agua o empty state premium */}
        {isChartEmpty && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/20 backdrop-blur-[2px] rounded-2xl border border-white/5 p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <LineChart size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Sin movimientos contables</h4>
              <p className="text-[11px] text-slate-400 font-light max-w-sm">
                La gráfica está lista. Se activará de forma dinámica en cuanto registres pagos o crees facturas fiscales para tus clientes.
              </p>
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          className={`overflow-visible select-none cursor-crosshair transition-opacity duration-300 ${isChartEmpty ? 'opacity-25 pointer-events-none' : 'opacity-100'}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Definiciones de Gradiantes y Filtros de Brillo */}
          <defs>
            <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="satGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glowReal" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glowSat" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Líneas de Guía Horizontal (Grid) */}
          {[0, maxValue * 0.33, maxValue * 0.66, maxValue].map((val, i) => {
            const y = paddingTop + plotHeight - ((val / maxValue) * plotHeight);
            return (
              <g key={i} className="opacity-20">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#ffffff"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                {/* Etiquetas Y */}
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="end"
                  className="font-light font-mono"
                >
                  {val === 0 ? '$0' : `${(val / 1000).toFixed(0)}k`}
                </text>
              </g>
            );
          })}

          {/* Eje X y Etiquetas */}
          {chartData.map((d, i) => {
            const { x } = getCoordinates(i, 0);
            return (
              <text
                key={i}
                x={x}
                y={height - 15}
                fill="#94a3b8"
                fontSize="11"
                textAnchor="middle"
                className="font-light"
              >
                {d.month}
              </text>
            );
          })}

          {/* Áreas degradadas de fondo (Dibujadas primero) */}
          {!isChartEmpty && (
            <>
              <motion.path
                d={satAreaPath}
                fill="url(#satGrad)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <motion.path
                d={realAreaPath}
                fill="url(#realGrad)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />

              {/* Línea Timbrado SAT */}
              <motion.path
                d={satLinePath}
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                filter="url(#glowSat)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />

              {/* Línea Ingreso Real */}
              <motion.path
                d={realLinePath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3.5"
                filter="url(#glowReal)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
              />

              {/* Puntos y Glow de Puntos en Vértices */}
              {realPoints.map((p, i) => (
                <circle
                  key={`real-point-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={hoverData?.index === i ? 6 : 3.5}
                  className="fill-blue-500 stroke-slate-900 stroke-2 transition-all duration-200"
                  style={{
                    filter: hoverData?.index === i ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.8))' : 'none',
                  }}
                />
              ))}

              {satPoints.map((p, i) => (
                <circle
                  key={`sat-point-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={hoverData?.index === i ? 6 : 3.5}
                  className="fill-emerald-500 stroke-slate-900 stroke-2 transition-all duration-200"
                  style={{
                    filter: hoverData?.index === i ? 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.8))' : 'none',
                  }}
                />
              ))}
            </>
          )}

          {/* Línea Vertical Interactiva (Guía) */}
          {hoverData && !isChartEmpty && (
            <line
              x1={getCoordinates(hoverData.index, 0).x}
              y1={paddingTop}
              x2={getCoordinates(hoverData.index, 0).x}
              y2={paddingTop + plotHeight}
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeDasharray="2,2"
              className="opacity-40"
            />
          )}
        </svg>

        {/* Tooltip flotante HTML */}
        {hoverData && !isChartEmpty && (
          <div
            className="absolute z-20 pointer-events-none p-4 rounded-2xl bg-slate-950/90 border border-white/15 backdrop-blur-md shadow-2xl flex flex-col gap-2 min-w-[210px] text-xs font-sans transition-all duration-100 ease-out"
            style={{
              left: `${hoverData.x}px`,
              top: `${hoverData.y - 80}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-semibold text-slate-300 border-b border-white/10 pb-1 flex justify-between">
              <span>Mes de {hoverData.item.month}</span>
              <span className="text-blue-400">Detalles</span>
            </div>
            
            <div className="flex justify-between items-center mt-1">
              <span className="text-slate-400 font-light flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Ingreso Real:
              </span>
              <span className="font-bold text-white text-right">
                {formatCurrency(hoverData.item.real)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-light flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Timbrado SAT:
              </span>
              <span className="font-bold text-emerald-400 text-right">
                {formatCurrency(hoverData.item.sat)}
              </span>
            </div>

            <div className="border-t border-white/5 pt-1.5 mt-1 flex justify-between items-center text-[10px]">
              <span className="text-slate-500">Diferencia:</span>
              <span className={`font-semibold ${hoverData.item.real >= hoverData.item.sat ? 'text-emerald-400' : 'text-rose-400'}`}>
                {hoverData.item.real >= hoverData.item.sat ? '+' : ''}
                {formatCurrency(hoverData.item.real - hoverData.item.sat)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Métricas del Eje Inferior */}
      <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
            <DollarSign size={16} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-light">Acumulado Real</div>
            <div className="text-sm font-black text-white">
              {formatCurrency(chartData.reduce((acc, curr) => acc + curr.real, 0))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <Award size={16} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-light">Acumulado SAT</div>
            <div className="text-sm font-black text-emerald-400">
              {formatCurrency(chartData.reduce((acc, curr) => acc + curr.sat, 0))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
