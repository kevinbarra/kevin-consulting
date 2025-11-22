import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-300 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        
        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 mb-10 hover:text-blue-300 transition-colors">
          <ArrowLeft size={16} /> Regresar al Inicio
        </Link>

        <h1 className="text-4xl font-bold text-white mb-8">Aviso de Privacidad</h1>
        
        <div className="space-y-6 leading-relaxed text-sm md:text-base bg-white/5 p-8 rounded-2xl border border-white/10">
          <p><strong>Última actualización:</strong> Noviembre 2025</p>
          
          <p>
            En <strong>Kevin Consulting</strong> ("nosotros", "nuestro"), respetamos su privacidad y estamos comprometidos a protegerla mediante el cumplimiento de esta política.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Información que recolectamos</h2>
          <p>
            Actualmente, este sitio web es informativo y no recolecta datos personales de manera automática a través de bases de datos persistentes. La interacción principal es a través de enlaces directos a WhatsApp y correo electrónico voluntario.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Uso de la información</h2>
          <p>
            Cualquier información que usted nos proporcione voluntariamente a través de WhatsApp o correo electrónico será utilizada exclusivamente para:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Proveer los servicios de consultoría solicitados.</li>
            <li>Responder a sus dudas o comentarios.</li>
            <li>Mejorar nuestros servicios.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Analíticas</h2>
          <p>
            Utilizamos herramientas de análisis anónimas (Vercel Analytics) para entender el tráfico del sitio. Estos datos no identifican a personas individuales, solo nos muestran regiones y tipos de dispositivos para optimizar la experiencia técnica.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Contacto</h2>
          <p>
            Para cualquier duda sobre este aviso, por favor contáctenos directamente a través de los canales oficiales mostrados en el sitio.
          </p>
        </div>

      </div>
    </main>
  );
}