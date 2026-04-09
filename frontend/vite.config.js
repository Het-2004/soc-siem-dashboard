import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_SOCKET_URL || 'http://localhost:5000'

  return {
    plugins: [react()],

    // Dev server config
    server: {
      port: 5173,
      // Proxy API and Socket.IO calls to backend in development
      // This avoids CORS issues during local development
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: backendUrl,
          changeOrigin: true,
          ws: true,   // WebSocket proxy
          secure: false,
        },
      },
    },

    // Production build config
    build: {
      outDir: 'dist',
      sourcemap: false,   // Disable source maps in production (security)
      rollupOptions: {
        output: {
          // Split vendor chunks for faster load times
          manualChunks: {
            'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
            'chart-vendor':  ['recharts'],
            'map-vendor':    ['leaflet', 'react-leaflet'],
            'socket-vendor': ['socket.io-client'],
          },
        },
      },
    },
  }
})
