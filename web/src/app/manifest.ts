import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Enterprise OS - Protech',
    short_name: 'Enterprise OS',
    description: 'Premium Enterprise OS for Retail Intelligence and Inventory Management.',
    start_url: '/dashboard',
    scope: '/',
    id: '/dashboard',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui', 'window-controls-overlay'],
    orientation: 'any',
    background_color: '#0f172a',
    theme_color: '#4f46e5',
    categories: ['business', 'productivity', 'utilities'],
    icons: [
      {
        src: '/images/logo-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/logo-192-white.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/logo-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/logo-512-white.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/images/logo-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
