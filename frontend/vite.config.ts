import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy backend API during development to avoid CORS and keep same-origin
      '/character': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
});
