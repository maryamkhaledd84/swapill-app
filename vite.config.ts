import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({mode}) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: isProduction ? false : {
        port: 3000,
        host: 'localhost',
        clientPort: 3000,
      },
      watch: {
        usePolling: false,
      },
    },
    preview: {
      port: 4173,
      host: '0.0.0.0',
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
    build: {
      sourcemap: !isProduction,
      minify: isProduction ? 'terser' : false,
    },
  };
});
