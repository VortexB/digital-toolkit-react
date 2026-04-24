import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/digital-toolkit-react/',
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['digitaltoolkit.services.trentpowell.site']
  }
})
