/**
 * Service Worker for Bullzeeker Pro
 * - Cache shell files (HTML/CSS/JS) for offline use
 * - Network-first for JSON data (always fresh)
 */
const CACHE_VERSION = "bz-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const SHELL_FILES = [
  "./",
  "./index.html",
  "./dashboard.html",
  "./history.html",
  "./manifest.json",
  "./assets/auth.js",
  "./assets/app.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys
        .filter((k) => !k.startsWith(CACHE_VERSION))
        .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // Network-first for JSON data (always try fresh)
  if (url.pathname.includes("/data/")) {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          if (resp.ok) {
            const respClone = resp.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, respClone));
          }
          return resp;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for shell files (HTML/JS/CSS)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((resp) => {
        if (resp.ok) {
          const respClone = resp.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(request, respClone));
        }
        return resp;
      });
    })
  );
});
