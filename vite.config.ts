
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'frontend',
  plugins: [react()],
  build: {
    outDir: '../backend/dist',
    emptyOutDir: true,
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      // Мы убираем секцию external, чтобы Vite собрал react и react-dom из node_modules.
      // Это стандартный подход для production-сборки, которую будет раздавать Express.
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
    reportCompressedSize: false,
    sourcemap: false,
  },
});
