import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/pwa/', // Production base URL for jatsszokosan.hu (NO /web/ prefix!)
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-v3.js`,
        chunkFileNames: `assets/[name]-[hash]-v3.js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  },
  server: {
    host: '0.0.0.0', // Enable network access
    port: 5173,
    proxy: {
      '/jsonapi': {
        target: 'https://jatsszokosan.hu',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
        cookiePathRewrite: '/',
        rewrite: (path) => path
      },
      '/api': {
        target: 'https://jatsszokosan.hu',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
        cookiePathRewrite: '/',
        rewrite: (path) => path
      },
      '/user': {
        target: 'https://jatsszokosan.hu',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
        cookiePathRewrite: '/',
        rewrite: (path) => path
      }
    }
  }
})
