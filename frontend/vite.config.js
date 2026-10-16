import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const isMobile = process.env.BUILD_TARGET === 'mobile'

  return {
    plugins: [react()],
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom']
    },
    
    // ✅ مهم برای Capacitor — مسیر نسبی
    // روی وب می‌تونه '/' باشه، روی موبایل باید './' باشه
    base: isMobile ? './' : '/',
    
    server: {
      port: 5173,strictPort: true,
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
      // ✅ کاهش حجم باندل
      minify: 'esbuild',
      target: 'es2020',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      
      // ✅ جدا کردن vendor bundles برای کش بهتر
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
    
    // ✅ بهینه‌سازی dependencies
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
    
    // ✅ تعریف متغیرهای محیطی
    define: {
      __IS_MOBILE__: JSON.stringify(isMobile),
    }
  }
})