const CACHE_NAME = "patienttriage-v2";
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/css/board.css",
  "./assets/data/cohort.json",
  "./assets/data/protocol.v1.json",
  "./assets/fonts/ibm-plex-mono.woff2",
  "./assets/fonts/ibm-plex-sans-condensed-semibold.woff2",
  "./assets/fonts/ibm-plex-sans.woff2",
  "./assets/fonts/ibm-plex-serif.woff2",
  "./assets/icons/maskable.svg",
  "./assets/js/audit.js",
  "./assets/js/clock.js",
  "./assets/js/engine/bands.js",
  "./assets/js/engine/hazard.js",
  "./assets/js/engine/index.js",
  "./assets/js/engine/physiology.js",
  "./assets/js/engine/presentation.js",
  "./assets/js/engine/rules.js",
  "./assets/js/engine/uncertainty.js",
  "./assets/js/fairness.js",
  "./assets/js/main.js",
  "./assets/js/render/audit-drawer.js",
  "./assets/js/render/board.js",
  "./assets/js/render/charts.js",
  "./assets/js/render/console.js",
  "./assets/js/render/fairness.js",
  "./assets/js/render/header.js",
  "./assets/js/render/inspector.js",
  "./assets/js/render/modes.js",
  "./assets/js/render/override.js",
  "./assets/js/render/sheets.js",
  "./assets/js/sim/board.js",
  "./assets/js/sim/cohort.js",
  "./assets/js/sim/surge.js",
  "./assets/js/state.js",
  "./assets/js/util/dom.js",
  "./assets/js/util/fmt.js",
  "./assets/js/util/storage.js"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache =>
    cache.addAll(PRECACHE)
  ).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(names => Promise.all(
    names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
  )).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then(cached =>
    cached ?? fetch(event.request)
  ));
});
