// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/', // importante para rutas en producción
  plugins: [
    react(),
    VitePWA({
      // Usamos manifest estático en /public
      manifest: false, 
      // Registra y actualiza el SW automáticamente
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Asegurate de tener estos archivos en /public
      includeAssets: [
        'favicon.ico',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-512x512-maskable.png'
      ],
      // Esto resuelve tu error: le decimos qué precachear
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        runtimeCaching: [
          // Imágenes (Cloudinary / Firebase Storage)
          {
            urlPattern: /^https:\/\/(res\.cloudinary\.com|firebasestorage\.googleapis\.com)\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          // API GET (si usás /api/... o el proxy de Vercel)
          {
            urlPattern: ({ request, url }) =>
              request.method === 'GET' && url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
      // Mejor desactivar el SW en dev para evitar cacheos molestos
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { host: true, port: 5173, strictPort: true },
})
