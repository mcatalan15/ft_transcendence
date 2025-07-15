import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    copyPublicDir: true
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false,
    strictPort: true,
    allowedHosts: true,
    watch: {
      usePolling: true,
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      overlay: false,
    },
    // Add origin handling for tunneling
    origin: 'http://localhost:1443'
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
  }
});