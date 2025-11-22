import { ImageResponse } from 'next/og';

// Configuración de la imagen (Estándar para Facebook/WhatsApp/LinkedIn)
export const runtime = 'edge';
export const alt = 'Kevin Consulting - Transformación Digital';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f172a', // Fondo Slate-950
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Fondo Decorativo (Gradientes) */}
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', background: '#3b82f6', filter: 'blur(150px)', opacity: 0.2, borderRadius: '100%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: '#10b981', filter: 'blur(150px)', opacity: 0.2, borderRadius: '100%' }} />

        {/* Contenedor Principal */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          
          {/* Badge */}
          <div style={{ display: 'flex', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '20px', padding: '8px 20px', marginBottom: '40px' }}>
             <span style={{ color: '#60a5fa', fontSize: 24, fontWeight: 700, letterSpacing: '2px' }}>KEVIN CONSULTING</span>
          </div>

          {/* Título Grande */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <span style={{ color: 'white', fontSize: 80, fontWeight: 900, lineHeight: 1.1, marginBottom: 10 }}>
              Ingeniería de Software
            </span>
            <span style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #34d399)', backgroundClip: 'text', color: 'transparent', fontSize: 80, fontWeight: 900, lineHeight: 1.1 }}>
              para Negocios Reales
            </span>
          </div>

          {/* Subtítulo */}
          <p style={{ color: '#94a3b8', fontSize: 32, marginTop: 40, maxWidth: '800px', textAlign: 'center' }}>
            Optimizamos inventarios, procesos y ventas. Sin complicaciones.
          </p>

        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}