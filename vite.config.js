import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Aseguramos que los ejemplos funcionen en su subcarpeta dedicada
  base: process.env.NODE_ENV === 'production' ? '/react-pivottable-plus/examples/gallery/' : '/',
  root: 'examples',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../dist-examples',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  }
});
