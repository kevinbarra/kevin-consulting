'use client';

import { useState, useEffect } from 'react';
import { usePortalSim } from '../PortalClientLayout';
import AreaChart from '@/components/portal/AreaChart';
import Drawer from '@/components/portal/Drawer';
import { BentoSkeleton } from '@/components/portal/Skeleton';
import SpotlightCard from '@/components/layout/SpotlightCard';
import { 
  Users, 
  DollarSign, 
  FileCheck, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Search,
  Building,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Play
} from 'lucide-react';
import { Client } from '@/components/portal/mockData';
import { getSystemLogsAction } from '@/app/portal/actions/documentActions';

export default function AdminPage() {
  const { isSimLoading, clientData, realBillings } = usePortalSim();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para logs de automatización
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const loadSystemLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await getSystemLogsAction();
      setSystemLogs(logs);
    } catch (err) {
      console.error('[ADMIN] Error loading logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadSystemLogs();
  }, [isSimLoading]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filtrar clientes
  const filteredClients = clientData.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.rfc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Totales financieros agregados de la base de datos real en Neon
  const totalReal = realBillings
    .filter(b => b.status === 'pagado')
    .reduce((acc, curr) => acc + parseFloat(curr.total || curr.amount || 0), 0);

  const totalVencido = realBillings
    .filter(b => b.status === 'atrasado')
    .reduce((acc, curr) => acc + parseFloat(curr.total || curr.amount || 0), 0);

  const activeContractsCount = clientData.reduce((acc, curr) => acc + curr.contracts.length, 0);
  const totalClientsCount = clientData.length;

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  // Renderizar esqueleto si está cargando la simulación
  if (isSimLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-white/5 w-64 rounded animate-pulse" />
          <div className="h-4 bg-white/5 w-96 rounded animate-pulse" />
        </div>
        <BentoSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera del Portal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            Mesa de Control
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold">
              Consola Admin
            </span>
          </h1>
          <p className="text-slate-400 text-sm font-light">Supervisión fiscal, flujo de caja y semáforo de cobranza corporativo.</p>
        </div>

        {/* Barra de búsqueda integrada */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar cliente o RFC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-white/10 rounded-full text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
          />
        </div>
      </div>

      {/* --- GRID DE MÉTRICAS RÁPIDAS (Bento Grid Header) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#1e293b]/20 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Recaudación Real</span>
            <div className="text-xl font-black text-white">{formatCurrency(totalReal)}</div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <TrendingUp size={12} />
              En cuenta bancaria
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <DollarSign size={20} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#1e293b]/20 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Cartera Vencida</span>
            <div className="text-xl font-black text-rose-400">{formatCurrency(totalVencido)}</div>
            <span className="text-[10px] text-rose-500/80 font-medium">Requiere timbrado</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
            <AlertTriangle size={20} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#1e293b]/20 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Expedientes Digitales</span>
            <div className="text-xl font-black text-white">{activeContractsCount}</div>
            <span className="text-[10px] text-slate-400 font-light">Contratos firmados PDF</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <FileCheck size={20} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#1e293b]/20 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Clientes Registrados</span>
            <div className="text-xl font-black text-white">{totalClientsCount}</div>
            <span className="text-[10px] text-slate-400 font-light">Cuentas administradas</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <Users size={20} />
          </div>
        </div>
      </div>

      {/* --- LAYOUT BENTO GRID PRINCIPAL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bento Card 1: Gráfica de Área Degradada (Ingreso Real vs Facturado) + Historial de Automatización */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#1e293b]/30 backdrop-blur-md p-6 flex flex-col justify-between min-h-[360px] shadow-lg">
            <AreaChart />
          </div>

          {/* Historial de Automatización (Cron Jobs) */}
          <div className="rounded-3xl border border-white/10 bg-[#1e293b]/30 backdrop-blur-md p-6 space-y-4 shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Play size={18} className="text-blue-400 rotate-90" />
                  Bitácora de Automatización (Cron Jobs)
                </h3>
                <p className="text-slate-400 text-xs font-light">Registro histórico de emisiones e inventario de deudas en Neon DB.</p>
              </div>
              <button
                onClick={loadSystemLogs}
                disabled={isLoadingLogs}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                title="Actualizar Bitácora"
              >
                <RefreshCw size={14} className={isLoadingLogs ? 'animate-spin text-blue-500' : ''} />
              </button>
            </div>

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
              {isLoadingLogs && systemLogs.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="animate-spin text-blue-500" size={14} />
                  Consultando bitácora Neon DB...
                </div>
              ) : systemLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 italic border border-dashed border-white/5 rounded-2xl">
                  No se han registrado ejecuciones de cobranza automática aún en Neon DB.
                </div>
              ) : (
                systemLogs.map((log) => {
                  const isSuccess = log.event_type === 'CRON_BILLING_GENERATION';
                  const dateStr = new Date(log.created_at).toLocaleString('es-MX', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <div 
                      key={log.id} 
                      className={`p-3.5 border rounded-2xl bg-slate-950/40 text-xs transition-all ${
                        isSuccess 
                          ? 'border-emerald-500/10 hover:border-emerald-500/30' 
                          : 'border-rose-500/10 hover:border-rose-500/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-bold flex items-center gap-1.5">
                          {isSuccess ? (
                            <CheckCircle2 size={14} className="text-emerald-400" />
                          ) : (
                            <XCircle size={14} className="text-rose-400" />
                          )}
                          <span className={isSuccess ? 'text-emerald-400' : 'text-rose-400'}>
                            {isSuccess ? 'Ejecución Exitosa' : 'Fallo en Ejecución'}
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-light">{dateStr}</span>
                      </div>
                      
                      <p className="text-slate-300 font-medium leading-relaxed mb-2">{log.message}</p>
                      
                      {log.details && (
                        <div className="bg-slate-950/80 border border-white/5 p-2 rounded-xl text-[9px] text-slate-400 font-mono overflow-x-auto max-h-[80px]">
                          <span className="font-bold text-slate-500">Detalles técnicos:</span>
                          <pre className="mt-1 leading-normal">
                            {JSON.stringify({
                              concepto: log.details.concept,
                              procesados: log.details.processed_clients_count,
                              generados: log.details.generated_count,
                              omitidos: log.details.skipped_count,
                              errores: log.details.error_count
                            }, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Bento Card 2: Semáforo de Cobranza Interactivo */}
        <div className="rounded-3xl border border-white/10 bg-[#1e293b]/30 backdrop-blur-md p-6 flex flex-col gap-4 shadow-lg h-[430px] lg:h-auto overflow-hidden">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Semáforo de Cobro
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            </h3>
            <p className="text-slate-400 text-xs font-light">Estados de pago en tiempo real. Clic para ver ficha fiscal.</p>
          </div>

          {/* Listado de clientes interactivo con semáforo */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[320px] lg:max-h-[380px] custom-scrollbar">
            {filteredClients.map((client) => {
              // Definir colores y brillos según el estado de pago del semáforo
              const isVencido = client.status === 'Mensualidad Vencida';
              const isPendiente = client.status === 'Instalación Pendiente';
              const isPagado = client.status === 'Pagado';
              const isConcilia = client.status === 'En Conciliación';

              let statusColor = 'bg-sky-500';
              let hoverGlow = 'hover:border-sky-500/40 hover:shadow-[0_0_15px_rgba(14,165,233,0.15)]';
              
              if (isVencido) {
                statusColor = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]';
                hoverGlow = 'hover:border-rose-500/40 hover:shadow-[0_0_20px_rgba(244,63,94,0.25)]';
              } else if (isPendiente) {
                statusColor = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
                hoverGlow = 'hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]';
              } else if (isPagado) {
                statusColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]';
                hoverGlow = 'hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]';
              } else if (isConcilia) {
                statusColor = 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]';
                hoverGlow = 'hover:border-sky-500/40 hover:shadow-[0_0_20px_rgba(14,165,233,0.25)]';
              }

              return (
                <button
                  key={client.id}
                  onClick={() => handleClientClick(client)}
                  className={`w-full flex items-center justify-between p-3.5 border border-white/5 rounded-2xl bg-slate-900/30 hover:bg-slate-900/60 transition-all text-left group cursor-pointer ${hoverGlow} hover:-translate-y-0.5`}
                >
                  <div className="space-y-1 flex-1 pr-3 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusColor}`} />
                      <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                        {client.name}
                      </span>
                    </div>
                    <div className="flex gap-2 text-[10px] text-slate-400 font-light items-center">
                      <span className="font-mono tracking-wider">{client.rfc}</span>
                      <span>•</span>
                      <span>{client.contracts.length} Contrato(s)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-black text-white">{formatCurrency(client.subtotal * 1.16)}</div>
                      <div className="text-[9px] text-slate-500 font-medium">Total con IVA</div>
                    </div>
                    <ArrowRight size={14} className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}

            {filteredClients.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <p className="text-xs text-slate-500 font-light">No se encontraron clientes para tu búsqueda.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* --- NOTA DE PIE / INFORMACIÓN FISCAL --- */}
      <div className="p-4 border border-white/10 bg-slate-950/40 rounded-2xl flex items-center gap-3 text-xs text-slate-400 font-light">
        <Building size={16} className="text-blue-400 shrink-0" />
        <p>
          Las retenciones aplicadas a personas morales en el portal se basan en el Artículo 1-A de la Ley del IVA (retención de las 2/3 partes del impuesto trasladado) y en las leyes vigentes de retención de ISR (1.25% RESICO).
        </p>
      </div>

      {/* --- DRAWER LATERAL DE EXPEDIENTE FISCAL --- */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        client={selectedClient}
      />
    </div>
  );
}
