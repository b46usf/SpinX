import { defineConfig } from 'vite';

export default defineConfig({
  // Vercel adapter
  base: './',
  
  // Build settings
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Exclude API routes from build - serve them separately
    rollupOptions: {
      input: {
        main: './index.html',
        dashboardAdminSystem: './dashboard-admin-system.html',
        dashboardAdminSchool: './dashboard-admin-school.html',
        dashboardSiswa: './dashboard-siswa.html',
        dashboardGuru: './dashboard-guru.html',
        dashboardMitra: './dashboard-mitra.html'
      }
    }
  },
  
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
  
  // Tell Vite to not process these directories
  publicDir: 'public',
});

