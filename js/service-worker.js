/* Eastokyo Service Worker - static hosting/GitHub Pages safe */
const CACHE_NAME = "eastokyo-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./404.html",
  "./about.html",
  "./contact.html",
  "./disclaimer.html",
  "./privacy.html",
  "./terms.html",
  "./search.html",
  "./category.html",
  "./article.html",
  "./css/style.css",
  "./css/article.css",
  "./css/mobile.css",
  "./js/main.js",
  "./js/article.js",
  "./js/articles.js",
  "./js/search.js",
  "./js/ticker.js",
  "./manifest.json",
  "./data/feed.xml",
  "./eastokyo-logo.png",
  "./images/icons/icon-192.png",
  "./images/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS).catch(() => Promise.resolve()))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) =>
            key !== CACHE_NAME ? caches.delete(key) : undefined
          )
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type === "opaque"
          )
            return response;
          const clone = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match("./404.html"));
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
