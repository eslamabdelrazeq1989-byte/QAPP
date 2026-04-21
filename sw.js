// QUESINA CITY — sw.js v7 (Network First)
const CACHE_NAME = 'quesina-v7';

const STATIC_ASSETS = [
  '/css/style.css',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS).catch(()=>{}))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = event.request.url;

  // Firebase - لا تتدخل
  if (url.includes('googleapis.com') || url.includes('firebase') || url.includes('gstatic.com')) return;

  // HTML - شبكة دايماً بدون كاش
  if (event.request.mode === 'navigate' || url.endsWith('.html') || url.endsWith('/')) {
    event.respondWith(fetch(event.request).catch(() => caches.match('/index.html')));
    return;
  }

  // باقي الملفات - شبكة أولاً
  event.respondWith(
    fetch(event.request).then(response => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});

self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'قويسنا سيتي', {
    body: data.body || '', icon: '/icon-192.svg', badge: '/icon-192.svg', dir: 'rtl'
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
