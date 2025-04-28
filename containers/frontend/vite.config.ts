import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  root: "src",
  build: {
    outDir: "../public",
    emptyOutDir: true,
    rollupOptions: {
      input: "src/index.html", // Entry point for the build
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});