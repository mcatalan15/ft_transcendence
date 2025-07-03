import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  root: "src",
  publicDir: "../static",
  build: {
    outDir: "../public",
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    // Keep HMR enabled for development
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      overlay: false,
    }
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
  }
});