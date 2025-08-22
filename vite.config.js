import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    hmr: {
      overlay: false // Para desactivar el overlay de errores si lo prefieres
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});