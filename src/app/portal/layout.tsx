'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  LayoutDashboard, 
  UserCircle2, 
  Settings2, 
  ArrowLeftRight, 
  RefreshCw, 
  Home,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';
import { mockClients, Client } from '@/components/portal/mockData';

// Definir el tipo del contexto de simulación
interface PortalContextType {
  role: 'admin' | 'client';
  clientProfile: 'fiscal' | 'regular';
  setClientProfile: (profile: 'fiscal' | 'regular') => void;
  isSimLoading: boolean;
  triggerLoading: (duration?: number) => void;
  clientData: Client[];
  updateClientInfo: (id: string, data: Partial<Client>) => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export function usePortalSim() {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortalSim must be used within a PortalSimProvider');
  }
  return context;
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Rol determinado por la URL actual
  const role = pathname.includes('/portal/admin') ? 'admin' : 'client';

  // Estados de la simulación
  const [clientProfile, setClientProfileState] = useState<'fiscal' | 'regular'>('fiscal');
  const [isSimLoading, setIsSimLoading] = useState(false);
  const [clientData, setClientData] = useState<Client[]>(mockClients);

  // Mensaje flotante de notificación (toast)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Disparar animación de esqueleto al cambiar perfiles o manual
  const triggerLoading = (duration = 700) => {
    setIsSimLoading(true);
    setTimeout(() => {
      setIsSimLoading(false);
    }, duration);
  };

  // Envoltura para setear perfil con animación
  const setClientProfile = (profile: 'fiscal' | 'regular') => {
    if (profile === clientProfile) return;
    setIsSimLoading(true);
    setClientProfileState(profile);
    setToastMessage(`Perfil cambiado a: ${profile === 'fiscal' ? 'Fiscal (SAT)' : 'Regular (Recibo Interno)'}`);
    setTimeout(() => {
      setIsSimLoading(false);
    }, 700);
  };

  // Función para guardar cambios fiscales de forma persistente en memoria
  const updateClientInfo = (id: string, updatedFields: Partial<Client>) => {
    setClientData((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
    setToastMessage('Información fiscal actualizada exitosamente');
  };

  // Desvanecer toast automáticamente
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Cambiar rol / redireccionar
  const handleRoleChange = (targetRole: 'admin' | 'client') => {
    if (targetRole === role) return;
    setIsSimLoading(true);
    setMobileMenuOpen(false);
    router.push(`/portal/${targetRole}`);
    setToastMessage(`Redirigiendo a Portal de ${targetRole === 'admin' ? 'Administración' : 'Clientes'}`);
    setTimeout(() => {
      setIsSimLoading(false);
    }, 600);
  };

  return (
    <PortalContext.Provider
      value={{
        role,
        clientProfile,
        setClientProfile,
        isSimLoading,
        triggerLoading,
        clientData,
        updateClientInfo
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
              Servidor Seguro (SSL)
            </span>
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white">
                  {role === 'admin' ? 'Ing. Kevin Barra' : 'Simulated Client User'}
                </div>
                <div className="text-[10px] text-slate-400 font-light">
                  {role === 'admin' ? 'Administrador General' : clientProfile === 'fiscal' ? 'Cliente Fiscal (PM)' : 'Cliente Regular'}
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-sm text-blue-400">
                {role === 'admin' ? 'KB' : 'SC'}
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
                  <button
                    onClick={() => handleRoleChange('admin')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                    }`}
                  >
                    <LayoutDashboard size={18} />
                    Dashboard Admin
                  </button>
                  <button
                    onClick={() => handleRoleChange('client')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      role === 'client'
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                    }`}
                  >
                    <UserCircle2 size={18} />
                    Portal Cliente
                  </button>
                </nav>
              </div>

              <div className="space-y-1.5 border-t border-white/5 pt-4">
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block px-3">
                  Simulación Activa
                </span>
                <div className="px-3 py-2 bg-slate-950/40 border border-white/5 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rol:</span>
                    <span className="font-bold text-white capitalize">{role}</span>
                  </div>
                  {role === 'client' && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Perfil:</span>
                      <span className={`font-bold ${clientProfile === 'fiscal' ? 'text-emerald-400' : 'text-blue-400'}`}>
                        {clientProfile === 'fiscal' ? 'Fiscal' : 'Regular'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10">
              <a 
                href="/"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
              >
                <Home size={14} />
                Regresar a Landing Page
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
                      <button
                        onClick={() => handleRoleChange('admin')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                          role === 'admin'
                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                        }`}
                      >
                        <LayoutDashboard size={18} />
                        Dashboard Admin
                      </button>
                      <button
                        onClick={() => handleRoleChange('client')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                          role === 'client'
                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                        }`}
                      >
                        <UserCircle2 size={18} />
                        Portal Cliente
                      </button>
                    </nav>
                  </div>
                </div>

                <div className="space-y-4">
                  <a 
                    href="/"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 border border-white/5"
                  >
                    <Home size={14} />
                    Regresar a Landing Page
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

        {/* --- SIMULADOR CONTROLS OVERLAY (BOTÓN FLOTANTE Y PANEL) --- */}
        <div className="fixed bottom-6 right-6 z-40">
          <SimulatorPanel 
            role={role} 
            clientProfile={clientProfile} 
            setClientProfile={setClientProfile} 
            handleRoleChange={handleRoleChange}
            triggerLoading={triggerLoading}
          />
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

// Subcomponente Panel de Control del Simulador
function SimulatorPanel({
  role,
  clientProfile,
  setClientProfile,
  handleRoleChange,
  triggerLoading
}: {
  role: 'admin' | 'client';
  clientProfile: 'fiscal' | 'regular';
  setClientProfile: (profile: 'fiscal' | 'regular') => void;
  handleRoleChange: (r: 'admin' | 'client') => void;
  triggerLoading: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative font-sans select-none">
      {/* Botón flotante para abrir */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 border border-blue-400/40 text-white flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all cursor-pointer hover:rotate-45"
        title="Simulador de Sandbox"
      >
        <Settings2 size={20} className={isOpen ? 'text-white rotate-45' : 'text-blue-100'} />
      </button>

      {/* Contenedor del panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: -10 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            className="absolute bottom-14 right-0 w-80 bg-slate-950/90 border border-white/10 backdrop-blur-xl rounded-3xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex flex-col gap-4 text-left"
          >
            <div className="border-b border-white/10 pb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-blue-400">Sandbox de Desarrollo</h4>
              <p className="text-[10px] text-slate-400 font-light">Valida los flujos del portal de forma interactiva.</p>
            </div>

            {/* Alternar Rol */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Simular Rol de Usuario</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleRoleChange('admin')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    role === 'admin'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Administrador
                </button>
                <button
                  onClick={() => handleRoleChange('client')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    role === 'client'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Cliente
                </button>
              </div>
            </div>

            {/* Alternar Perfil de Impuestos (Solo visible en Vista Cliente o útil para ambos) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  Perfil de Cliente (SAT)
                </label>
                {role !== 'client' && (
                  <span className="text-[9px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.25 rounded">
                    Vista Cliente
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setClientProfile('fiscal')}
                  disabled={role !== 'client'}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    clientProfile === 'fiscal'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                  title="Muestra RFC, facturas XML/PDF y datos del SAT"
                >
                  Fiscal (SAT)
                </button>
                <button
                  onClick={() => setClientProfile('regular')}
                  disabled={role !== 'client'}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    clientProfile === 'regular'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                  title="Oculta SAT y genera Recibo Digital Interno"
                >
                  Regular
                </button>
              </div>
            </div>

            {/* Acciones del Sandbox */}
            <div className="border-t border-white/10 pt-3 flex gap-2">
              <button
                onClick={() => triggerLoading()}
                className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <RefreshCw size={13} className="animate-spin-slow" />
                Cargar Skeletons
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
