const CACHE = "privx-shield-v13-final";

const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/ethers.umd.min.js",
  "/icon-192.png",
  "/icon-512.png",
  "/PRIVX.png",
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  "https://unpkg.com/@walletconnect/web3-provider@1.8.0/dist/umd/index.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://unpkg.com/html5-qrcode@2.3.8/minified/html5-qrcode.min.js"


];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response.ok) caches.open(CACHE).then(c => c.put(e.request, response.clone()));
        return response;
      }).catch(() => caches.match("/index.html"));
    })
  );
});
