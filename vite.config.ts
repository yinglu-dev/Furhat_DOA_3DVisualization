import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite: dev server + bundler. The React plugin enables JSX/TSX and fast refresh.
export default defineConfig({
  plugins: [react()],
  server: { port: 8080 },
  // Three.js alone is ~600 kB, so the default 500 kB warning is expected here.
  build: { chunkSizeWarningLimit: 1000 },
});
