import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(),
     VitePWA({
      manifest: false,            // usamos tu manifest de /public
      registerType: 'autoUpdate', // se actualiza solo en producción
      devOptions: { enabled: true }
})
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { host: true, port: 5173, strictPort: true },
})