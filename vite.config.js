import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // ✅ فقط react و react-dom رو dedupe کن
    dedupe: ['react', 'react-dom']
  },
  server: {
    port: 5173,
    open: true,
    host: true,
    strictPort: false,
  },
  preview: {
    port: 4173,
    host: true,
  }
})