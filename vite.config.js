import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function buildProxy(mode) {
  const env = loadEnv(mode, process.cwd(), '');
  const backendBaseUrl = (env.VITE_BACKEND_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

  return {
    '/api': {
      target: backendBaseUrl,
      changeOrigin: true,
      secure: false,
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: buildProxy(mode),
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    proxy: buildProxy(mode),
  },
}));
