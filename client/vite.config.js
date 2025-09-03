import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_REACT_APP_API_URL': JSON.stringify(
      process.env.NODE_ENV === 'production' 
        ? 'https://api.thegoodanalyst.net/api/v1'
        : (process.env.VITE_REACT_APP_API_URL || 'http://localhost:4020/api/v1')
    )
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    }
  }
})
