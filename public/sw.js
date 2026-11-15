/* AstroMed service worker.
   Precache list and version are written into this file after each production build by
   tools/service-worker.mjs. */

const VERSION = "__ASTROMED_VERSION__";
const PRECACHE = __ASTROMED_PRECACHE__;
const CACHE = "astromed-" + VERSION;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("astromed-") && key !== CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(request, { ignoreSearch: request.mode === "navigate" });
      if (hit) return hit;
      try {
        return await fetch(request);
      } catch (error) {
        if (request.mode === "navigate") {
          return (await cache.match("/")) || (await cache.match("/index.html")) || Response.error();
        }
        throw error;
      }
    })
  );
});
