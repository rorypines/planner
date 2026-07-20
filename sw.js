const CACHE_VERSION = "v3";
const CACHE_NAME = "planner-" + CACHE_VERSION;
const urlsToCache = [
    "./",
    "./index.html",
    "./manifest.json"
];

self.addEventListener("install", event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

self.addEventListener("fetch", event => {
    // Пропускаем запросы не-GET
    if (event.request.method !== "GET") {
        return;
    }
    
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Если есть в кэше - возвращаем из кэша
            if (cachedResponse) {
                // Обновляем кэш в фоне
                fetch(event.request).then(response => {
                    if (response && response.status === 200) {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, response);
                        });
                    }
                }).catch(() => {});
                return cachedResponse;
            }
            
            // Если нет в кэше - загружаем из сети
            return fetch(event.request).then(response => {
                // Сохраняем в кэш только успешные ответы
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            }).catch(() => {
                // Если сеть недоступна - показываем главную страницу
                return caches.match("./index.html");
            });
        })
    );
});
