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
        injectRegister: 'auto',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          name: 'Smart Planner — برنامه‌ریزی هوشمند',
          short_name: 'Planner',
          description: 'مدیریت کارها، پروژه‌ها، مالی و رشد شخصی — آفلاین و چنددستگاهی',
          theme_color: '#3b82f6',
          background_color: '#ffffff',
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone'],
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          lang: 'fa',
          dir: 'rtl',
          categories: ['productivity', 'lifestyle', 'utilities'],
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
          shortcuts: [
            { name: 'کارها', url: '/tasks', description: 'مشاهده کارها' },
            { name: 'برنامه‌ریزی', url: '/planning', description: 'برنامه هفتگی' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: /\/api\/auth\/(signin|signup|refresh|forgot|reset).*/i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 5,
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            {
              // ✅ CDN فونت وزیرمتن (jsdelivr)
              urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'cdn-assets',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },
        // ✅ حیاتی: در dev غیرفعال کن — برای تست SW از preview استفاده کن
        devOptions: {
          enabled: false,
        },
      }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom'],
    },

    base: isMobile ? './' : '/',

    server: {
      port: 5173,
      open: true,
      host: true,
      strictPort: false,
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
      },
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
          },
        },
      },
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
      ],
    },

    define: {
      __IS_MOBILE__: JSON.stringify(isMobile),
    },
  }
})