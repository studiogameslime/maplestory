import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({
  plugins: [
    react(),
    tailwind(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['licenses/*.txt'],
      manifest: {
        name: 'MapleCompanion · Classic World',
        short_name: 'MapleCompanion',
        description:
          'A field guide and trading desk for MapleStory Classic World.',
        theme_color: '#141419',
        background_color: '#141419',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [192, 512].map((size) => ({
          src: '/icon-' + size + '.png',
          sizes: size + 'x' + size,
          type: 'image/png',
          purpose: 'any maskable',
        })),
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
        globPatterns: ['**/*.{html,js,css,png,webp,svg,woff2,json}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
})
