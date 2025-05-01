import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
root: "src",
build: {
	outDir: "../public",
	emptyOutDir: true,
},
server: {
	host: '0.0.0.0',
	port: 5173,
	open: true,
	strictPort: true,
	watch: {
	  usePolling: true, // this helps with Docker sometimes
	},
	hmr: process.env.NODE_ENV === 'development' ? {  // Enable HMR only in dev
		protocol: 'ws',
		host: 'localhost',
		port: 5173
	} : false,  // Disable HMR in production
},
});