import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import serviceWorker from "./tools/service-worker.mjs";

export default defineConfig({
  output: "static",
  integrations: [preact(), serviceWorker()],
  server: { port: Number(process.env.PORT) || 4321 },
  build: { inlineStylesheets: "never" },
  vite: { build: { chunkSizeWarningLimit: 2500 } },
});
