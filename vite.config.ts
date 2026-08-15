import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/apple-touch-icon.png',
        'icons/margin-icon-dark.svg',
        'icons/margin-icon-light.svg',
      ],
      manifest: {
        name: 'Margin',
        short_name: 'Margin',
        description: 'Personal expense tracking',
        start_url: '/',
        display: 'standalone',
        background_color: '#1C1E1B',
        theme_color: '#1C1E1B',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/margin-icon-dark.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        // Every deploy gets a fresh, content-hashed precache manifest; once a
        // new SW does activate, immediately drop any caches left over from
        // older manifests instead of leaving them around indefinitely, and
        // take control of already-open pages right away rather than waiting
        // for the next navigation.
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
    }),
  ],
})
