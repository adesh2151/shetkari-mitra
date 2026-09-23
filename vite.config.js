import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Relative base so the built PWA works both on GitHub Pages (sub-path)
// and inside the Capacitor Android WebView (file:// origin).
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      // The TF.js model files can be large — allow them to be precached.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json,bin,woff2}'],
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024
      },
      manifest: {
        name: 'Shetkari Mitra',
        short_name: 'Shetkari',
        description: 'Crop disease detection for farmers',
        theme_color: '#2e7d32',
        background_color: '#f5f7f2',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
})
