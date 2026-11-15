import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import serviceWorker from "./tools/service-worker.mjs";

export default defineConfig({
  plugins: [preact({ babel: {} }), serviceWorker()],
  server: { port: Number(process.env.PORT) || 4321 },
  build: { chunkSizeWarningLimit: 2500 },
});
