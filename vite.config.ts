// defineConfig vem de "vitest/config" (e não de "vite") porque é ele que
// conhece a chave `test`. O vitest 4 deixou de augmentar os tipos do vite via
// `/// <reference types="vitest" />`.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
// Marcador de build exibido no rodapé: permite confirmar visualmente qual commit
// está publicado. A Vercel injeta VERCEL_GIT_COMMIT_SHA durante o build.
const buildSha = (process.env.VERCEL_GIT_COMMIT_SHA || "dev").slice(0, 7);

export default defineConfig({
  define: {
    __BUILD_SHA__: JSON.stringify(buildSha),
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    // Unit tests live under src/; Playwright specs under playwright/ run separately.
    // O segundo padrão cobre apenas *.test.ts do suporte do Playwright (ex.: o
    // guard de banco), sem alcançar os *.spec.ts de e2e.
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "playwright/support/**/*.test.ts",
    ],
  },
});
