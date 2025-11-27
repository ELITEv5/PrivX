// ======================================================
//  PrivX Stealth Shield — Service Worker (V13 Final)
//  Offline-ready, cache-busted, and PWA optimized
// ======================================================

const CACHE_NAME = "privx-shield-v13.1";

// Precache all critical assets (local + external)
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./ethers.umd.min.js",
  "./abi.json",
  "./MiningVaultabi.json",
  "./icon-192.png",
  "./icon-512.png",
  "./maskable_icon.png",
  "./PRIVX.png",
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  "https://unpkg.com/@walletconnect/web3-provider@1.8.0/dist/umd/index.min.js"
];

// ===== INSTALL =====
self.addEventListener("install", (event) => {
  console.log("📦 Installing PrivX Shield SW v13...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// ===== ACTIVATE =====
self.addEventListener("activate", (event) => {
  console.log("⚡ Activating PrivX Shield SW v13...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("🧹 Removing old cache:", key);
            return caches.delete(key);
          })
      )
    )
  );
  return self.clients.claim();
});

// ===== FETCH =====
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Bypass non-GET (like wallet RPCs, tx submissions)
  if (request.method !== "GET") return;

  // Serve from cache, fallback to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Background update: fetch and cache fresh copy silently
        fetch(request)
          .then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response.clone());
              });
            }
          })
          .catch(() => {});
        return cached;
      }

      // If not in cache, fetch normally and store
      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) return response;
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        })
        .catch(() =>
          caches.match("./index.html") // fallback to app shell
        );
    })
  );
});


