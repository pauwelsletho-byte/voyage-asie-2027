// Garde l'app sur le téléphone pour qu'elle s'ouvre sans réseau.
// Avec du réseau : toujours la dernière version (réseau d'abord) ; sans réseau : la copie gardée.
const VERSION = "__VERSION__";
const CACHE = "asie2027-" + VERSION;
const SHELL = ["./", "./index.html", "./app.js", "./styles.css", "./manifest.webmanifest", "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png", "./pdfjs/pdf.min.js", "./pdfjs/pdf.worker.min.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => fetch(new Request(u, { cache: "reload" })).then((r) => r.ok && c.put(u === "./" ? "./index.html" : u, r))))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("asie2027-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin || req.url.endsWith(".ics")) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = req.mode === "navigate" ? "./index.html" : req;
    const timeout = new Promise((res) => setTimeout(() => res(null), 4000));
    const network = fetch(req, { cache: "no-cache" }).then((res) => { if (res.ok) cache.put(key, res.clone()); return res; }).catch(() => null);
    const res = await Promise.race([network, timeout]);
    return res || (await cache.match(key, { ignoreSearch: true })) || (await network) || new Response("Hors ligne", { status: 503 });
  })());
});
