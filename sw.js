// Исправленный Service Worker — больше никаких тормозов!
const CACHE_NAME = 'planner-v1';
const urlsToCache = [
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.log('Кэш не загружен:', err))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Отдаём из кэша
        }
        return fetch(event.request); // Если нет — идём в интернет
      })
  );
});
