// ============================================================
//  PrivX Stealth Shield V13 — Service Worker
//  Offline caching + auto version refresh
// ============================================================

const CACHE_NAME = 'privx-shield-v13-' + Date.now();  // forces cache refresh on new deploy

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './ethers.umd.min.js'
];

// Optional: cache remote JS if CORS headers allow it
const CDN_ASSET = 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(ASSETS_TO_CACHE);
      try {
        // cache CDN script safely (ignore if blocked by CORS)
        const res = await fetch(CDN_ASSET, { mode: 'no-cors' });
        await cache.put(CDN_ASSET, res);
      } catch (_) {
        console.warn('⚠️ CDN asset not cached (CORS)');
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached ||
      fetch(event.request)
        .then((resp) => {
          // cache same-origin resources for next load
          if (event.request.url.startsWith(self.location.origin)) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return resp;
        })
        .catch(() => caches.match('./index.html'))
    )
  );
});

