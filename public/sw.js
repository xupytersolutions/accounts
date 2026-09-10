// Simple PWA Service Worker for OneAccount
// Cache names
const CACHE_STATIC = "oneaccount-static-v1";
const CACHE_RUNTIME = "oneaccount-runtime-v1";

// Assets to precache (offline shell). Keep minimal — shell-only, no vault data.
const PRECACHE_URLS = [
  "/offline",
  "/favicons/android-chrome-192x192.png",
  "/favicons/android-chrome-512x512.png",
  "/favicons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_STATIC && k !== CACHE_RUNTIME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Bypass auth and api — always network only (no stale vault data)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  // Navigation requests — NetworkFirst, fallback to offline
  if (request.destination === "document" || request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigations for runtime
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_RUNTIME).then((c) => c.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match("/offline");
          if (offline) return offline;
          // Last resort
          return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
        })
    );
    return;
  }

  // Static assets — StaleWhileRevalidate (images, fonts, _next/static)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|css|js)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetched = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_STATIC).then((c) => c.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);
        return cached || fetched;
      })
    );
    return;
  }

  // Default — NetworkFirst with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_RUNTIME).then((c) => c.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
