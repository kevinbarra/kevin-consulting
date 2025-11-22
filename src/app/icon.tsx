import { ImageResponse } from 'next/og';

// Configuración de la imagen (Tamaño estándar de favicon)
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Generación del icono
export default function Icon() {
  return new ImageResponse(
    (
      // Elemento JSX que se convierte en imagen
      <div
        style={{
          fontSize: 20,
          background: '#2563eb', // Azul corporativo
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '8px', // Bordes redondeados
          fontWeight: 800,
        }}
      >
        K
      </div>
    ),
    {
      ...size,
    }
  );
}