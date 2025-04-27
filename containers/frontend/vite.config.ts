import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  root: "src", // Set the root directory to src
  build: {
    outDir: "../public", // Output directory for the bundled files
    emptyOutDir: true, // Clear the output directory before building
    rollupOptions: {
      input: "src/index.html", // Entry point for the build
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});