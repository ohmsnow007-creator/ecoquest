/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// Where the app is served from: '/ecoquest/' on GitHub Pages (default), '/' on Netlify (set in netlify.toml).
// A Windows shell can rewrite "/" into a drive path (e.g. C:/Program Files/Git/); that always means the root.
const env = process.env.BASE_PATH
const raw = env === undefined ? '/ecoquest/' : /^[A-Za-z]:[\\/]/.test(env) ? '/' : env
const BASE = `/${raw.replace(/^\/+|\/+$/g, '')}/`.replace(/\/+/g, '/')

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // New versions activate and reload on their own: every action is already saved to
      // localStorage, so a reload loses nothing, and old installs can't get stuck on a stale build.
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        id: BASE,
        name: 'EcoQuest — ภารกิจพิชิตโลกสีเขียว',
        short_name: 'EcoQuest',
        description: 'เปลี่ยนนิสัยเล็ก ๆ ให้กลายเป็นการเปลี่ยนแปลงที่ยิ่งใหญ่',
        lang: 'th',
        dir: 'ltr',
        theme_color: '#123C2E',
        background_color: '#123C2E',
        display: 'standalone',
        orientation: 'portrait',
        start_url: `${BASE}#/home`,
        scope: BASE,
        categories: ['education', 'games', 'lifestyle'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell + static assets only. Player data lives in localStorage and is never put in a cache.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'ecoquest-font-css-v1', expiration: { maxEntries: 5, maxAgeSeconds: 365 * 24 * 60 * 60 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ecoquest-font-files-v1',
              expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  base: BASE,
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
