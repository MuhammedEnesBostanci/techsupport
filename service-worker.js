const CACHE_NAME = 'techsupport-hub-v1';
const urlsToCache = [
  './',
  './index.html',
  './services.html',
  './detail.html',
  './about.html',
  './contact.html',
  './offline.html',
  './css/style.css',
  './js/app.js',
  './js/api.js',
  './js/install.js',
  './manifest.json'
];

// Install event - cache dosyaları
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache açıldı');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - cache-first stratejisi
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache'de varsa döndür
        if (response) {
          return response;
        }

        // Yoksa network'ten getir
        return fetch(event.request)
          .then((response) => {
            // Geçersiz response kontrolü
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Response'u clone et (stream sadece bir kez okunabilir)
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Network başarısız olursa offline sayfasını göster
            return caches.match('/offline.html');
          });
      })
  );
});

// Activate event - eski cache'leri temizle
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});