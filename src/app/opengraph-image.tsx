import { ImageResponse } from 'next/og';

// Configuración de la imagen
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
          background: '#0f172a', // Fondo oscuro premium
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
        {/* Sutil degradado de fondo para dar profundidad */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 50% 0%, #1e3a8a 0%, #0f172a 70%)', opacity: 0.4, zIndex: 0 }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          
          {/* Logo Tipográfico Pequeño */}
          <div style={{ color: '#60a5fa', fontSize: 20, fontWeight: 700, letterSpacing: '2px', marginBottom: '30px' }}>
            KEVIN CONSULTING
          </div>

          {/* Título Grande y Claro */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <span style={{ color: '#ffffff', fontSize: 70, fontWeight: 900, lineHeight: 1.1 }}>
              Ingeniería de Software
            </span>
            <span style={{ color: '#93c5fd', fontSize: 70, fontWeight: 900, lineHeight: 1.1 }}>
              para Negocios Reales.
            </span>
          </div>

          {/* Subtítulo Informativo */}
          <p style={{ color: '#cbd5e1', fontSize: 28, marginTop: 30, maxWidth: '700px', textAlign: 'center', fontWeight: 400 }}>
            Optimizamos inventarios, procesos y ventas con tecnología a la medida.
          </p>

        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}