'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  LayoutDashboard, 
  UserCircle2, 
  LogOut,
  Menu,
  X,
  CheckCircle,
  Home,
  RefreshCw
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Client } from '@/components/portal/mockData';

// Definir el tipo del contexto de producción real
interface PortalContextType {
  role: 'admin' | 'client';
  clientProfile: 'fiscal' | 'regular';
  setClientProfile: (profile: 'fiscal' | 'regular') => void; // Compatibilidad de interfaz
  isSimLoading: boolean;
  triggerLoading: (duration?: number) => void;
  clientData: Client[];
  updateClientInfo: (id: string, data: Partial<Client>) => Promise<boolean>;
  realBillings: any[];
  refreshData: () => Promise<void>;
  sessionUser: {
    id: string;
    email?: string | null;
    role: 'admin' | 'client';
    clientId?: string;
  };
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export function usePortalSim() {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortalSim must be used within a PortalProvider');
  }
  return context;
}

interface PortalClientLayoutProps {
  children: React.ReactNode;
  session: {
    user: {
      id: string;
      email?: string | null;
      role: 'admin' | 'client';
      clientId?: string;
    };
  };
}

export default function PortalClientLayout({ children, session }: PortalClientLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = session.user.role;
  const sessionUser = session.user;

  // Estados reales
  const [clientData, setClientData] = useState<Client[]>([]);
  const [realBillings, setRealBillings] = useState<any[]>([]);
  const [isSimLoading, setIsSimLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Perfil fiscal activo (para compatibilidad de vista de cliente)
  const [clientProfile, setClientProfileState] = useState<'fiscal' | 'regular'>('fiscal');

  // Trigger loading animation
  const triggerLoading = (duration = 700) => {
    setIsSimLoading(true);
    setTimeout(() => {
      setIsSimLoading(false);
    }, duration);
  };

  // setClientProfile placeholder for interface compatibility
  const setClientProfile = (profile: 'fiscal' | 'regular') => {
    // En producción, el switch fiscal depende del registro del cliente (c.fiscal_tracked),
    // pero guardamos el estado local para el renderizado condicional de la UI
    setClientProfileState(profile);
    setToastMessage(`Filtro visual cambiado a: ${profile === 'fiscal' ? 'Fiscal (SAT)' : 'Regular'}`);
  };

  // Cargar datos reales desde la base de datos a través de las APIs
  const refreshData = async () => {
    setIsSimLoading(true);
    try {
      // 1. Fetch billings (se auto-filtra por RLS en backend si es cliente)
      const billingsRes = await fetch('/api/billings');
      const billings = await billingsRes.json();
      setRealBillings(Array.isArray(billings) ? billings : []);

      // 2. Fetch clients (se auto-filtra por RLS en backend si es cliente)
      const clientsRes = await fetch('/api/clients');
      const dbClients = await clientsRes.json();

      if (Array.isArray(dbClients)) {
        // Mapear los clientes de la DB relacional a la interfaz de la UI
        const mappedClients: Client[] = dbClients.map((c: any) => {
          const isPersonaMoral = c.rfc ? c.rfc.replace(/[\s-]/g, '').length === 12 : false;
          
          // Filtrar facturas asociadas a este cliente
          const clientBillings = (Array.isArray(billings) ? billings : []).filter(b => b.client_id === c.id);
          
          // Calcular estatus dinámicamente según semáforo de facturas
          let status: Client['status'] = 'Pagado';
          const hasAtrasado = clientBillings.some(b => b.status === 'atrasado');
          const hasPendiente = clientBillings.some(b => b.status === 'pendiente');
          
          if (hasAtrasado) {
            status = 'Mensualidad Vencida';
          } else if (hasPendiente) {
            // Si es pendiente y el subtotal es 0 o no hay facturas pagadas previas
            status = clientBillings.length === 1 ? 'Instalación Pendiente' : 'En Conciliación';
          }

          // Encontrar última fecha de pago
          const paidBillings = clientBillings.filter(b => b.status === 'pagado');
          const lastPaymentDate = paidBillings.length > 0 
            ? new Date(paidBillings[0].paid_at || paidBillings[0].due_date).toISOString().split('T')[0]
            : 'Sin pagos';

          return {
            id: c.id,
            user_id: c.user_id,
            name: c.business_name,
            rfc: c.rfc || 'XAXX010101000',
            razonSocial: c.legal_name,
            cp: c.postal_code || '00000',
            regimenFiscal: c.tax_regime || '601 - General de Ley Personas Morales',
            isFiscal: c.fiscal_tracked,
            isPersonaMoral,
            status,
            subtotal: parseFloat(c.subtotal || 0),
            lastPaymentDate,
            contracts: Array.from({ length: c.documents_count || 0 }).map((_, idx) => ({
              name: `Documento Registrado ${idx + 1}`,
              size: 'PDF',
              date: ''
            }))
          };
        });

        setClientData(mappedClients);

        // Si es cliente, establecer el perfil fiscal inicial según su config real
        if (role === 'client' && mappedClients.length > 0) {
          setClientProfileState(mappedClients[0].isFiscal ? 'fiscal' : 'regular');
        }
      }
    } catch (err) {
      console.error('[PORTAL LAYOUT] Error cargando datos reales:', err);
      setToastMessage('Error al conectar con la base de datos Neon.');
    } finally {
      setIsSimLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [role]);

  // Actualizar información fiscal del cliente de manera persistente en la DB real
  const updateClientInfo = async (id: string, updatedFields: Partial<Client>): Promise<boolean> => {
    try {
      setIsSimLoading(true);
      
      const payload = {
        business_name: updatedFields.name,
        legal_name: updatedFields.razonSocial,
        rfc: updatedFields.rfc,
        postal_code: updatedFields.cp,
        tax_regime: updatedFields.regimenFiscal,
        cfdi_use: updatedFields.isPersonaMoral ? 'G03' : 'D01' // CFDI genérico según tipo
      };

      const res = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Fallo al actualizar el perfil');
      }

      setToastMessage('Información fiscal guardada en Neon DB con éxito');
      await refreshData();
      return true;
    } catch (error: any) {
      console.error('[PORTAL LAYOUT] Error actualizando cliente:', error);
      setToastMessage(`Error: ${error.message || 'No se pudo guardar la información'}`);
      setIsSimLoading(false);
      return false;
    }
  };

  // Desvanecer toast automáticamente
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleLogout = async () => {
    setIsSimLoading(true);
    setToastMessage('Cerrando sesión segura...');
    await signOut({ callbackUrl: '/login' });
  };

  // Nombre y siglas a mostrar en la interfaz
  const userName = role === 'admin' 
    ? 'Ing. Kevin Barra' 
    : (clientData[0]?.razonSocial || sessionUser.email || '');
  
  const userRoleText = role === 'admin' 
    ? 'Administrador General' 
    : (clientProfile === 'fiscal' ? 'Cliente Fiscal (PM)' : 'Cliente Regular');

  const userInitials = role === 'admin'
    ? 'KB'
    : (clientData[0]?.name ? clientData[0].name.substring(0, 2).toUpperCase() : 'C');

  return (
    <PortalContext.Provider
      value={{
        role,
        clientProfile,
        setClientProfile,
        isSimLoading,
        triggerLoading,
        clientData,
        updateClientInfo,
        realBillings,
        refreshData,
        sessionUser
      }}
    >
      <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans overflow-x-hidden antialiased">
        
        {/* --- HEADER SUPERIOR --- */}
        <header className="fixed top-0 left-0 w-full h-16 bg-[#020617]/50 backdrop-blur-md border-b border-white/10 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 active:scale-95"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm shadow-[0_0_12px_rgba(59,130,246,0.4)] group-hover:scale-105 transition-transform">
                K
              </div>
              <span className="font-bold tracking-tight text-sm">
                Kevin<span className="text-blue-400">Consulting</span>
              </span>
            </a>
            <span className="hidden sm:inline text-xs text-slate-500 border-l border-white/10 pl-3">
              Portal {role === 'admin' ? 'Administrador' : 'Privado de Cliente'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline-flex text-xs bg-slate-900 border border-white/5 text-slate-400 px-3 py-1.5 rounded-full items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Conexión Neon Encriptada
            </span>
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white max-w-[150px] truncate" title={userName}>
                  {userName}
                </div>
                <div className="text-[10px] text-slate-400 font-light">
                  {userRoleText}
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-sm text-blue-400">
                {userInitials}
              </div>
            </div>
          </div>
        </header>

        {/* --- CONTENEDOR PRINCIPAL CON SIDEBAR --- */}
        <div className="flex-1 flex pt-16 relative">
          
          {/* --- SIDEBAR LATERAL (DESKTOP) --- */}
          <aside className="hidden md:flex w-64 border-r border-white/10 bg-[#020617]/30 flex-col justify-between fixed h-[calc(100vh-64px)] z-20 left-0">
            <div className="p-4 space-y-6">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block px-3">
                  Navegación
                </span>
                <nav className="space-y-1">
                  {role === 'admin' && (
                    <button
                      onClick={() => router.push('/portal/admin')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        pathname.startsWith('/portal/admin')
                          ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                      }`}
                    >
                      <LayoutDashboard size={18} />
                      Mesa de Control
                    </button>
                  )}
                  {role === 'client' && (
                    <button
                      onClick={() => router.push('/portal/client')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        pathname.startsWith('/portal/client')
                          ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                      }`}
                    >
                      <UserCircle2 size={18} />
                      Mi Expediente Fiscal
                    </button>
                  )}
                </nav>
              </div>

              <div className="space-y-1.5 border-t border-white/5 pt-4">
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block px-3">
                  Seguridad
                </span>
                <div className="px-3 py-2 bg-slate-950/40 border border-white/5 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rol Real:</span>
                    <span className="font-bold text-emerald-400 capitalize">{role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RLS:</span>
                    <span className="font-bold text-blue-400">Activo</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 transition-all cursor-pointer"
              >
                <LogOut size={14} />
                Cerrar Sesión
              </button>
              <a 
                href="/"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
              >
                <Home size={14} />
                Regresar a Inicio
              </a>
            </div>
          </aside>

          {/* --- MENÚ DESPLEGABLE MÓVIL --- */}
          {mobileMenuOpen && (
            <>
              <div 
                className="md:hidden fixed inset-0 z-20 bg-black/60 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />
              <aside className="md:hidden w-64 border-r border-white/10 bg-[#090d16] flex flex-col justify-between fixed h-[calc(100vh-64px)] z-30 left-0 p-4 animate-in slide-in-from-left-5">
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block px-3">
                      Navegación
                    </span>
                    <nav className="space-y-1">
                      {role === 'admin' && (
                        <button
                          onClick={() => { router.push('/portal/admin'); setMobileMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                            pathname.startsWith('/portal/admin')
                              ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                          }`}
                        >
                          <LayoutDashboard size={18} />
                          Mesa de Control
                        </button>
                      )}
                      {role === 'client' && (
                        <button
                          onClick={() => { router.push('/portal/client'); setMobileMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                            pathname.startsWith('/portal/client')
                              ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                          }`}
                        >
                          <UserCircle2 size={18} />
                          Mi Expediente Fiscal
                        </button>
                      )}
                    </nav>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 border border-white/5 transition-all cursor-pointer"
                  >
                    <LogOut size={14} />
                    Cerrar Sesión
                  </button>
                  <a 
                    href="/"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 border border-white/5"
                  >
                    <Home size={14} />
                    Regresar a Inicio
                  </a>
                </div>
              </aside>
            </>
          )}

          {/* --- CONTENIDO PRINCIPAL --- */}
          <main className="flex-1 min-h-[calc(100vh-64px)] md:pl-64 transition-all duration-300">
            <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24">
              {children}
            </div>
          </main>
        </div>

        {/* --- NOTIFICACIÓN FLOTANTE (TOAST) --- */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-6 left-6 z-50 py-3 px-4 bg-slate-950 border border-emerald-500/30 text-white rounded-2xl flex items-center gap-2.5 shadow-2xl backdrop-blur-md"
            >
              <CheckCircle size={16} className="text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PortalContext.Provider>
  );
}
