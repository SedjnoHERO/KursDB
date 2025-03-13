/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        navigateFallback: 'index.html'
      },
      includeAssets: [
        'assets/images/**/*',
        'assets/icons/**/*'
      ],
      manifest: {
        name: 'AirService - Авиакомпания',
        short_name: 'AirService',
        description: 'Система управления авиакомпанией',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/assets/icons/192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/assets/icons/512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 год
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 год
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@assets': '/src/assets', 
      '@components': '/src/components',
      '@modules': '/src/modules',
      '@pages': '/src/pages',
      '@theme': '/src/theme',
      '@api': '/src/api', 
      '@hooks': '/src/hooks',
      '@config': '/src/config'
    }
  }
})
