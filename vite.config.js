import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [tailwindcss(), react()],
    // Worker của MapLibre là ES module
    worker: { format: 'es' },
    // Gọi /api/... từ frontend => Vite chuyển tiếp sang backend (không cần lo CORS khi dev)
    server: {
      proxy: {
        '/api': { target: env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3000', changeOrigin: true },
      },
    },
  }
})
