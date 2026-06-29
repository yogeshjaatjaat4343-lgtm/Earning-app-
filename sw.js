// sw.js — Service Worker (Offline + Caching)

const CACHE_NAME = 'elite-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Install — Cache files
self.addEventListener('install', event => {
    console.log('✅ Service Worker installed');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Caching files...');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate — Clean old caches
self.addEventListener('activate', event => {
    console.log('✅ Service Worker activated');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch — Serve from cache if offline
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone response for cache
                const responseClone = response.clone();
                if (event.request.method === 'GET') {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request)
                    .then(cached => cached || new Response('Offline', { status: 503 }));
            })
    );
});

// Push Notification Handler
self.addEventListener('push', event => {
    const data = event.data?.json() || {};
    const title = data.notification?.title || '🎮 ELITE EARNING';
    const options = {
        body: data.notification?.body || '📢 कुछ नया है!',
        icon: 'https://i.ibb.co/BH93HZzP/file-00000000b05c720688b1dbdc9dd1d551.png',
        badge: 'https://i.ibb.co/BH93HZzP/file-00000000b05c720688b1dbdc9dd1d551.png',
        vibrate: [200, 100, 200],
        data: data.data || {}
    };
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification Click Handler
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data?.url || '/')
    );
});
