import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig(({ mode }) => {
  const isMobile = process.env.BUILD_TARGET === 'mobile'

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'Smart Planner',
          short_name: 'Planner',
          description: 'برنامه‌ریزی هوشمند - مدیریت کارها، پروژه‌ها و مالی',
          theme_color: '#3b82f6', // ✅ رنگ آبی پیش‌فرض
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
          runtimeCaching: [
            {
              // ✅ استراتژی NetworkFirst برای API ها
              // اگر آفلاین بودی، آخرین دیتا از کش خونده میشه
              urlPattern: /\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 // 1 روز
                },
                networkTimeoutSeconds: 10 // اگر اینترنت کند بود، ۱۰ ثانیه صبر میکنه
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: { statuses: [0, 200] }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: { statuses: [0, 200] }
              }
            }
          ]
        },
        devOptions: {
          enabled: true,
          type: 'module'
        }
      })
    ],
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom']
    },
    
    base: isMobile ? './' : '/',
    
    server: {
      port: 5173,
      open: true,
      host: true,
      strictPort: false,
    },
    
    preview: {
      port: 4173,
      host: true,
    },
    
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'esbuild',
      target: 'es2020',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
            'charts-vendor': ['recharts'],
            'i18n-vendor': ['i18next', 'react-i18next'],
            'ui-vendor': ['react-icons', 'react-toastify'],
            'utils-vendor': ['date-fns', 'uuid', 'jalaali-js'],
          }
        }
      }
    },
    
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@reduxjs/toolkit',
        'react-redux',
        'react-i18next',
        'i18next',
      ],
      exclude: [
        '@capacitor/core',
        '@capacitor/android',
        '@capacitor/local-notifications',
        '@capacitor/preferences',
        '@capacitor/status-bar',
      ]
    },
    
    define: {
      __IS_MOBILE__: JSON.stringify(isMobile),
    }
  }
})