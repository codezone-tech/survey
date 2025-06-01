const STATIC_CACHE_NAME = 'site-static-v2';
const DYNAMIC_CACHE_NAME = 'site-dynamic-v1';
const urlsToCache = [
  "/", 
  "/index.html",
  "/offline.html",
  "/static/css/main.css",
  "/static/js/main.js",
  "/static/js/bundle.js",
  "/static/js/vendors~main.js",
  "/static/media/logo.png"
];

// Cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(() => limitCacheSize(name, size)); 
      }
    });
  });
};

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      console.log('Caching shell assets...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
        .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', event => {
  if (event.request.mode === 'cors') {
    return; // Let the request proceed normally
  }
  event.respondWith(
    caches.match(event.request).then(cacheRes => {
      return cacheRes || fetch(event.request).then(fetchRes => {
        return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
          cache.put(event.request.url, fetchRes.clone());
          limitCacheSize(DYNAMIC_CACHE_NAME, 15);
          return fetchRes;
        });
      });
    }).catch(() => {
      // If both cache and network fail, serve offline.html only for HTML requests
      if (event.request.destination === 'document') {
        return caches.match('/offline.html');
      }
    })
  );
});
