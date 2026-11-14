import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";

export default defineConfig({
  output: "static",
  integrations: [preact()],
  server: { port: Number(process.env.PORT) || 4321 },
  build: { inlineStylesheets: "never" },
  vite: { build: { chunkSizeWarningLimit: 2500 } },
});
