'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowRight, Eye, EyeOff, RefreshCw } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, rellene todos los campos.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Credenciales inválidas. Verifique su correo y contraseña.');
        setIsLoading(false);
      } else {
        // Redirigir al portal, el cual decidirá si va a admin o client
        router.push('/portal');
        router.refresh();
      }
    } catch (err: any) {
      setError('Ocurrió un error inesperado durante el inicio de sesión.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-6 relative font-sans overflow-hidden">
      {/* Elementos decorativos de fondo (Glows Cyberpunk) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo / Encabezado */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              K
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Kevin<span className="text-blue-400">Consulting</span>
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Acceso al Portal Seguro</h2>
            <p className="text-slate-400 text-xs font-light mt-1">
              Ingrese sus credenciales de administración o cliente corporativo.
            </p>
          </div>
        </div>

        {/* Tarjeta de Formulario Glassmorphism */}
        <div className="relative p-8 rounded-3xl bg-slate-950/40 border border-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Campo: Correo Electrónico */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all placeholder-slate-600"
                placeholder="ejemplo@empresa.com"
              />
            </div>

            {/* Campo: Contraseña */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-4 pr-11 py-3 bg-slate-950/60 border border-white/10 focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all placeholder-slate-600 tracking-wide"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 active:scale-95 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Banner de Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex gap-2 font-medium"
              >
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <p className="leading-relaxed">{error}</p>
              </motion.div>
            )}

            {/* Botón de Enviar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-slate-500 disabled:border-white/5 border border-blue-400/40 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] active:scale-98"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="animate-spin" size={14} />
                  Verificando credenciales...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Nota al pie */}
        <p className="text-center text-[10px] text-slate-500 mt-6 font-light">
          Este sistema es de acceso restringido. Todas las conexiones y transferencias están encriptadas vía SSL.
        </p>
      </motion.div>
    </div>
  );
}
