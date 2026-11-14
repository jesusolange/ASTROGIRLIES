// Astro integration: writes the built file list and a content-based version into dist/sw.js.
// The service worker template lives in public/sw.js and is copied to dist by the build.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

function listFiles(directory, out) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) listFiles(full, out);
    else if (entry.isFile()) out.push(full);
  }
}

export default function serviceWorker() {
  return {
    name: "astromed-service-worker",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const files = [];
        listFiles(root, files);

        const urls = files
          .map((file) => "/" + relative(root, file).split("\\").join("/"))
          .filter((url) => url !== "/sw.js")
          .sort();
        if (urls.includes("/index.html")) urls.unshift("/");

        const hash = createHash("sha256");
        urls.forEach((url) => {
          hash.update(url);
          if (url !== "/") hash.update(readFileSync(join(root, url.slice(1))));
        });
        const version = hash.digest("hex").slice(0, 12);

        const template = readFileSync(join(root, "sw.js"), "utf8");
        const output = template
          .replace('"__ASTROMED_VERSION__"', JSON.stringify(version))
          .replace("__ASTROMED_PRECACHE__", JSON.stringify(urls));
        writeFileSync(join(root, "sw.js"), output);
        logger.info(`service worker: ${urls.length} files precached, cache astromed-${version}`);
      },
    },
  };
}
