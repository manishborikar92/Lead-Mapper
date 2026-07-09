import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GrowEasy Lead-Mapper',
    short_name: 'Lead-Mapper',
    description: 'AI-Powered CRM CSV Importer',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0f19',
    theme_color: '#06b6d4',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
