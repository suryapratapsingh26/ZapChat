import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {  // Proxy all requests starting with `/api`
        target: 'http://localhost:5001',  // Your backend URL
        changeOrigin: true,
        secure: false,  // Optional (for HTTPS issues in development)
      },
    },
  },
});