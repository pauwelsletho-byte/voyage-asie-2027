// Garde l'app sur le téléphone pour qu'elle s'ouvre sans réseau
const VERSION = "mvqq8mhj";
const CACHE = "asie2027-" + VERSION;
const SHELL = ["./", "./index.html", "./app.js", "./styles.css", "./manifest.webmanifest", "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("asie2027-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return; // Firebase gère lui-même son cache
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const key = req.mode === "navigate" ? "./index.html" : req;
      const cached = await cache.match(key, { ignoreSearch: true });
      const network = fetch(req).then((res) => { if (res.ok) cache.put(key, res.clone()); return res; }).catch(() => null);
      return cached || (await network) || new Response("Hors ligne", { status: 503 });
    })
  );
});
