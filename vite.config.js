import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      strategies: 'generateSW',
      manifest: false,                 // usamos el manifest de /public
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.ico',
        'icons/*.png'                  // <-- coincide con tu manifest
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(res\.cloudinary\.com|firebasestorage\.googleapis\.com)\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
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
      devOptions: { enabled: false },
    }),
  ],
  resolve: { alias: { 'pdfjs-dist': path.resolve('./node_modules/react-pdf/node_modules/pdfjs-dist')
, 
    react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      '@': fileURLToPath(new URL('./src', import.meta.url)) } },
      optimizeDeps: {
    include: ['pdfjs-dist/build/pdf.worker.min.mjs'],
  },
  server: { host: true, port: 5173, strictPort: true },
})
