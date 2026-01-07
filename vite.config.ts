import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ command }) => ({
  // Use repo subpath when building for GitHub Pages, keep root for dev
  base: command === 'build' ? '/golden-pangolin-jump/' : '/',
  server: {
    host: "::",
    port: 8080,
  },
  // Output to `docs` so GitHub Pages can serve the production build from the main branch
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
