import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.svg', 'robots.txt', 'offline.html'],
      manifest: {
        name: 'VerseVoyage',
        short_name: 'VerseVoyage',
        description: 'Track your daily scripture study and connect with friends',
        theme_color: '#1b5e20',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'icons/pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*$/i,
            handler: 'CacheFirst',
            options: { 
              cacheName: 'google-fonts', 
              expiration: { maxEntries: 10, maxAgeSeconds: 31536000 } 
            }
          },
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/v1\/projects\/.*$/i,
            handler: 'NetworkFirst',
            options: { 
              cacheName: 'firestore-api', 
              networkTimeoutSeconds: 10, 
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 } 
            }
          },
          {
            urlPattern: /^https:\/\/www\.googleapis\.com\/.*$/i,
            handler: 'NetworkFirst',
            options: { 
              cacheName: 'google-apis', 
              networkTimeoutSeconds: 10, 
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 } 
            }
          },
          {
            urlPattern: /^https:\/\/securetoken\.googleapis\.com\/.*$/i,
            handler: 'NetworkFirst',
            options: { 
              cacheName: 'auth-api', 
              networkTimeoutSeconds: 10, 
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 } 
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/, 
            handler: 'CacheFirst',
            options: { 
              cacheName: 'images', 
              expiration: { maxEntries: 60, maxAgeSeconds: 2592000 } 
            }
          },
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: { 
              cacheName: 'static-resources',
              expiration: { maxEntries: 30, maxAgeSeconds: 86400 }
            }
          }
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        // Custom handler for offline fallback
        additionalManifestEntries: [
          { url: '/offline.html', revision: '1' }
        ],
        // Skip waiting to ensure the new service worker activates immediately
        skipWaiting: true,
        // Claim clients to ensure the PWA works offline right away
        clientsClaim: true
      }
    })
  ]
})
