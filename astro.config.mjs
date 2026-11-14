import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  server: { port: Number(process.env.PORT) || 4321 },
  build: { inlineStylesheets: "never" },
  vite: { build: { chunkSizeWarningLimit: 2500 } },
});
