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
  Play,
  UserPlus,
  X,
  AlertCircle
} from 'lucide-react';
import { Client } from '@/components/portal/mockData';
import { getSystemLogsAction } from '@/app/portal/actions/documentActions';

export default function AdminPage() {
  const { isSimLoading, clientData, realBillings, refreshData } = usePortalSim();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para el Registro de Clientes
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regLegalName, setRegLegalName] = useState('');
  const [regRfc, setRegRfc] = useState('');
  const [regCp, setRegCp] = useState('');
  const [regTaxRegime, setRegTaxRegime] = useState('601 - General de Ley Personas Morales');
  const [regCutoffDay, setRegCutoffDay] = useState(1);
  const [regSubtotal, setRegSubtotal] = useState(0);
  const [regFiscalTracked, setRegFiscalTracked] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(false);

    const cleanRfc = regRfc.replace(/[\s-]/g, '').toUpperCase();
    if (cleanRfc.length !== 12 && cleanRfc.length !== 13) {
      setRegError('El RFC de México debe tener exactamente 12 caracteres (Moral) o 13 (Física).');
      return;
    }

    if (!regEmail || !regPassword || !regBusinessName || !regLegalName || !regCp) {
      setRegError('Por favor, rellene todos los campos obligatorios.');
      return;
    }

    setIsRegistering(true);

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          business_name: regBusinessName.trim(),
          legal_name: regLegalName.trim().toUpperCase(),
          rfc: cleanRfc,
          postal_code: regCp,
          tax_regime: regTaxRegime,
          cutoff_day: Number(regCutoffDay),
          subtotal: Number(regSubtotal),
          fiscal_tracked: regFiscalTracked
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error al registrar al cliente');
      }

      setRegSuccess(true);
      setRegEmail('');
      setRegPassword('');
      setRegBusinessName('');
      setRegLegalName('');
      setRegRfc('');
      setRegCp('');
      setRegTaxRegime('601 - General de Ley Personas Morales');
      setRegCutoffDay(1);
      setRegSubtotal(0);
      setRegFiscalTracked(true);
      
      await refreshData();
      setTimeout(() => {
        setIsRegisterModalOpen(false);
        setRegSuccess(false);
      }, 1500);

    } catch (err: any) {
      setRegError(err.message || 'Error de conexión.');
    } finally {
      setIsRegistering(false);
    }
  };

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

  // MRR: suma de subtotales mensuales recurrentes de todos los clientes.
  // Se usa Number() explícitamente porque Neon devuelve NUMERIC(12,2) como string.
  const totalMRR = clientData.reduce((acc, curr) => acc + (Number(curr.subtotal) || 0), 0);

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

        {/* Acciones de Cabecera (Búsqueda + Registro) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 border border-blue-400/30 text-white rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 shrink-0"
          >
            <UserPlus size={14} />
            Registrar Cliente
          </button>

          <div className="relative w-full sm:w-64">
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

        {/* KPI 3 — MRR Total */}
        <div className="p-5 rounded-2xl border border-emerald-500/20 bg-[#1e293b]/20 backdrop-blur-md flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.05)]">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">MRR Total</span>
            <div className="text-xl font-black text-emerald-400">{formatCurrency(totalMRR)}</div>
            <span className="text-[10px] text-emerald-500/70 flex items-center gap-1 font-semibold">
              <TrendingUp size={12} />
              Ingreso mensual recurrente
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <TrendingUp size={20} />
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

      {/* Modal de Registro de Clientes */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsRegisterModalOpen(false)}
          />
          
          <div className="relative w-full max-w-2xl bg-[#090d16]/95 border border-white/10 rounded-3xl p-6 text-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserPlus size={18} className="text-blue-400" />
                  Registrar Nuevo Cliente Comercial
                </h3>
                <p className="text-slate-400 text-xs font-light">
                  Se creará un usuario de inicio de sesión y su ficha de perfil comercial en Neon DB.
                </p>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRegisterClient} className="space-y-4">
              
              {/* Sección 1: Credenciales */}
              <div className="border border-white/5 bg-white/[0.01] p-4 rounded-2xl space-y-3">
                <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">
                  Credenciales de Acceso
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      Correo Electrónico (Login) *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="correo@cliente.com"
                      className="w-full px-3 py-2 bg-slate-950/60 border border-white/10 focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      Contraseña Temporal *
                    </label>
                    <input
                      type="text"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 caracteres"
                      className="w-full px-3 py-2 bg-slate-950/60 border border-white/10 focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Datos Comerciales y Fiscales */}
              <div className="border border-white/5 bg-white/[0.01] p-4 rounded-2xl space-y-3">
                <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">
                  Datos de Perfil e Impuestos
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      Nombre Comercial *
                    </label>
                    <input
                      type="text"
                      required
                      value={regBusinessName}
                      onChange={(e) => setRegBusinessName(e.target.value)}
                      placeholder="Comercializadora Alfa"
                      className="w-full px-3 py-2 bg-slate-950/60 border border-white/10 focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      Razón Social (Legal) *
                    </label>
                    <input
                      type="text"
                      required
                      value={regLegalName}
                      onChange={(e) => setRegLegalName(e.target.value.toUpperCase())}
                      placeholder="ALFA DE MEXICO SA DE CV"
                      className="w-full px-3 py-2 bg-slate-950/60 border border-white/10 focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      RFC (12 o 13 chars) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={13}
                      value={regRfc}
                      onChange={(e) => setRegRfc(e.target.value.toUpperCase())}
                      placeholder="ALF990101AA1"
                      className="w-full px-3 py-2 bg-slate-950/60 border border-white/10 focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none transition-colors tracking-wider font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={regCp}
                      onChange={(e) => setRegCp(e.target.value.replace(/\D/g, ''))}
                      placeholder="06000"
                      className="w-full px-3 py-2 bg-slate-950/60 border border-white/10 focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none transition-colors font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      Régimen Fiscal (SAT)
                    </label>
                    <select
                      value={regTaxRegime}
                      onChange={(e) => setRegTaxRegime(e.target.value)}
                      className="w-full px-2 py-2 bg-slate-950 border border-white/10 focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none transition-colors"
                    >
                      <option value="601 - General de Ley Personas Morales">601 - General de Ley P. Morales</option>
                      <option value="605 - Sueldos y Salarios e Ingresos Asimilados a Salarios">605 - Sueldos y Salarios</option>
                      <option value="606 - Arrendamiento">606 - Arrendamiento</option>
                      <option value="612 - Personas Físicas con Actividades Empresariales y Profesionales">612 - Act. Empresariales</option>
                      <option value="626 - Régimen Simplificado de Confianza (RESICO)">626 - RESICO</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección 3: Configuración de Mensualidades y Cobros */}
              <div className="border border-white/5 bg-white/[0.01] p-4 rounded-2xl space-y-3">
                <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">
                  Configuración de Tarifa y Facturación
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      Subtotal Pactado ($ MXN) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={regSubtotal}
                      onChange={(e) => setRegSubtotal(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-white/10 focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none transition-colors font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      Día de Corte (1-31) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={31}
                      value={regCutoffDay}
                      onChange={(e) => setRegCutoffDay(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-white/10 focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none transition-colors font-mono"
                    />
                  </div>

                  <div className="flex flex-col justify-center space-y-2">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      Seguimiento Fiscal SAT
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={regFiscalTracked}
                        onChange={(e) => setRegFiscalTracked(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-2 text-xs font-semibold text-slate-300">
                        {regFiscalTracked ? 'Activo (CFDI)' : 'Desactivado (Interno)'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Mensajes de error/éxito */}
              {regError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-2xl flex gap-2 font-medium">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{regError}</p>
                </div>
              )}

              {regSuccess && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl text-center font-bold">
                  ¡Cliente registrado exitosamente! Sincronizando Neon DB...
                </div>
              )}

              {/* Botón de Enviar */}
              <div className="flex gap-2 border-t border-white/10 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-all cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRegistering || regSuccess}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 border border-blue-400/40 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
                >
                  {isRegistering ? (
                    <>
                      <RefreshCw className="animate-spin" size={14} />
                      Registrando en Neon...
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      Guardar y Crear Cuenta
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- DRAWER LATERAL DE EXPEDIENTE FISCAL --- */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        client={selectedClient}
      />
    </div>
  );
}
