import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'https://dailybloom-6y1q.onrender.com'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      allowedHosts: ['dailybloom-6y1q.onrender.com', '.run.app', 'localhost'],
    },
    preview: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: ['dailybloom-6y1q.onrender.com', '.run.app', 'localhost'],
    },
  };
});
