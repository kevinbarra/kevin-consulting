import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kevin Consulting',
    short_name: 'KevinApp',
    description: 'Transformación Digital para Negocios',
    start_url: '/',
    display: 'standalone', // Esto quita la barra del navegador al abrirse
    background_color: '#0f172a',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/icon',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}