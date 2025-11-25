import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
    return (
        <main className="h-screen w-full bg-[#0f172a] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">

            {/* Fondo sutil */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

            <h1 className="text-9xl font-extrabold text-slate-800 select-none">404</h1>

            <div className="relative z-10 -mt-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ruta no encontrada</h2>
                <p className="text-slate-400 max-w-md mx-auto mb-10 text-lg">
                    Parece que te saliste del mapa. No te preocupes, en sistemas esto pasa. Regresemos al camino.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all shadow-lg shadow-blue-500/20"
                >
                    <Home size={20} />
                    Volver al Inicio
                </Link>
            </div>

        </main>
    );
}