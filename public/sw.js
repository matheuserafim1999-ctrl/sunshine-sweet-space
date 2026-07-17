// Minimal PWA service worker.
// Cache-first for same-origin static assets, network-first for everything else.
const VERSION = 'v1';
const STATIC_CACHE = `static-${VERSION}`;
const STATIC_EXT = /\.(?:js|css|woff2?|ttf|otf|eot|png|jpg|jpeg|gif|svg|webp|avif|ico)$/i;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll([
      '/manifest.webmanifest',
      '/icon-192.png',
      '/icon-512.png',
    ]).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Cache-first for static assets
  if (STATIC_EXT.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch {
        return hit || Response.error();
      }
    })());
    return;
  }

  // Network-first for HTML / API
  event.respondWith((async () => {
    try {
      return await fetch(req);
    } catch {
      const cache = await caches.open(STATIC_CACHE);
      const hit = await cache.match(req);
      return hit || Response.error();
    }
  })());
});
