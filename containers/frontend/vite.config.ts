import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  root: "src",
  build: {
    outDir: "../public",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
  },
});