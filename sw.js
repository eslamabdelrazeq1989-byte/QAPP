<<<<<<< HEAD
// QUESINA CITY — sw.js (Updated: Network First Strategy)
const CACHE_NAME = 'quesina-v2'; // قمنا بتغيير الإصدار هنا لإجبار المتصفح على التحديث

=======
// ══════════════════════════════════════════════
// QUESINA CITY — sw.js (Service Worker)
// PWA Offline Support & Caching
// ══════════════════════════════════════════════

const CACHE_NAME = 'quesina-v1';
>>>>>>> 5d2b94dcb21d1ad9c0788dcd97fd816cca368392
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/config.js',
  '/js/app.js',
  '/js/sw-register.js',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg'
];

<<<<<<< HEAD
// التثبيت وحذف أي كاش قديم فوراً
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
=======
// ── INSTALL: تخزين الملفات الأساسية ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: حذف الكاش القديم ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
>>>>>>> 5d2b94dcb21d1ad9c0788dcd97fd816cca368392
    )
  );
  self.clients.claim();
});

<<<<<<< HEAD
// استراتيجية الشبكة أولاً: ابحث عن الجديد دائماً
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)) // إذا لم يتوفر إنترنت، خذ من الكاش
  );
});

// إشعارات الـ Push (كما هي)
=======
// ── FETCH: الكاش أولاً ثم الشبكة ──
self.addEventListener('fetch', event => {
  // تجاهل طلبات Firebase و API الخارجية
  if (event.request.url.includes('firebaseio.com') ||
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('anthropic.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // تخزين الاستجابة الجديدة
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // صفحة بديلة عند عدم الاتصال
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// ── PUSH NOTIFICATIONS ──
>>>>>>> 5d2b94dcb21d1ad9c0788dcd97fd816cca368392
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'قويسنا سيتي', {
    body: data.body || '',
    icon: '/icon-192.svg',
<<<<<<< HEAD
    dir: 'rtl'
  });
});
=======
    badge: '/icon-192.svg',
    dir: 'rtl',
    lang: 'ar',
    data: data
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
>>>>>>> 5d2b94dcb21d1ad9c0788dcd97fd816cca368392
