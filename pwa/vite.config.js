import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/web/pwa2/', // Production base URL (includes /web/ subdirectory)
  server: {
    host: '0.0.0.0', // Enable network access
    port: 5173,
    proxy: {
      '/jsonapi': {
        target: 'https://dr11.webgraf.hu/web',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
        cookiePathRewrite: '/',
        rewrite: (path) => path
      },
      '/api': {
        target: 'https://dr11.webgraf.hu/web',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
        cookiePathRewrite: '/',
        rewrite: (path) => path
      },
      '/user': {
        target: 'https://dr11.webgraf.hu/web',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
        cookiePathRewrite: '/',
        rewrite: (path) => path
      }
    }
  }
})
