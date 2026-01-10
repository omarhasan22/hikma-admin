import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // Base path for GitHub Pages (use repository name or set via VITE_BASE_PATH env variable)
  // For root domain GitHub Pages: base: '/'
  // For project pages: base: '/repository-name/'
  // Repository name: hikma-admin (https://omarhasan22.github.io/hikma-admin/)
  base: process.env.VITE_BASE_PATH || '/hikma-admin/',
  plugins: [
    react(),
  ],
  // Load .env file from project root (not from client/ directory)
  envDir: path.resolve(import.meta.dirname),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    // Changed from dist/public to dist for GitHub Pages compatibility
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
