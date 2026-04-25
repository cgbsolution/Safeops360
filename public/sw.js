// SafeOps360 service worker — shell cache + offline fallback.
// Network-first for HTML to avoid stale HTML / hydration mismatch after deploys.
const STATIC_CACHE = "safeops360-shell-v4";
const SHELL_URLS = ["/manifest.webmanifest", "/icon-192.svg", "/icon-512.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Only intercept same-origin requests.
  if (url.origin !== self.location.origin) return;

  const isHTML = req.mode === "navigate" || req.headers.get("accept")?.includes("text/html");
  const isStaticAsset = SHELL_URLS.includes(url.pathname);
  const isNextAsset = url.pathname.startsWith("/_next/");

  // HTML documents → network first, fall back to cache only if offline.
  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match("/m"))),
    );
    return;
  }

  // Static/public assets → cache first.
  if (isStaticAsset) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
            return res;
          }),
      ),
    );
    return;
  }

  // Next.js build assets → stale-while-revalidate.
  if (isNextAsset) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        });
        return cached || fetchPromise;
      }),
    );
  }
});
