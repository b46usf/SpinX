import { defineConfig } from 'vite';

export default defineConfig({
  // Vercel adapter
  base: './',
  
  // Build settings
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  
  // Environment variables - prefix with VITE_ to expose to client
  envPrefix: 'VITE_',
  
  // Optimize dependencies
  optimizeDeps: {
    exclude: [],
  },
  
  // Server configuration for local development
  server: {
    port: 3000,
    open: true,
  },
  
  // Preview configuration
  preview: {
    port: 3000,
  },
});

