import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Honorons Dieu — Lieux de culte en Côte d\'Ivoire',
    short_name: 'HonoronsDieu',
    description:
      'Trouvez un lieu de culte près de vous : églises, mosquées, temples. Horaires, contacts et itinéraires. Ici, là-bas, partout.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0A0A0C',
    theme_color: '#152B47',
    lang: 'fr',
    categories: ['lifestyle', 'navigation', 'travel'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
