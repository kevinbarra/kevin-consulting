import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-300 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        
        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 mb-10 hover:text-blue-300 transition-colors">
          <ArrowLeft size={16} /> Regresar al Inicio
        </Link>

        <h1 className="text-4xl font-bold text-white mb-8">Términos de Servicio</h1>
        
        <div className="space-y-6 leading-relaxed text-sm md:text-base bg-white/5 p-8 rounded-2xl border border-white/10">
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Aceptación</h2>
          <p>
            Al contratar los servicios de <strong>Kevin Consulting</strong>, usted acepta estos términos. Nos reservamos el derecho de trabajar únicamente con clientes que se alineen a nuestros estándares de ética y colaboración.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Propiedad Intelectual</h2>
          <p>
            Todo el código desarrollado a la medida para el cliente pasará a ser propiedad del cliente una vez liquidado el pago total del proyecto. Kevin Consulting se reserva el derecho de utilizar piezas de código genérico (librerías) en otros proyectos.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Pagos y Garantías</h2>
          <p>
            Los proyectos requieren un anticipo del 50% para iniciar. Ofrecemos una garantía de corrección de errores (bugs) durante los primeros 30 días posteriores a la entrega final.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Limitación de Responsabilidad</h2>
          <p>
            Kevin Consulting no se hace responsable por pérdidas de información derivadas del mal uso de los sistemas por parte del personal del cliente o por ataques cibernéticos de fuerza mayor.
          </p>
        </div>

      </div>
    </main>
  );
}