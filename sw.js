// sw.js - Service Worker لتطبيق التأمل SerenMind

const CACHE_NAME = 'serenmind-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // أضف أي ملفات إضافية هنا مثل الأيقونات أو الخطوط إن وجدت
  // مثال: './icon-192.png'
];

// تثبيت الـ Service Worker وتخزين الملفات الأساسية مؤقتاً
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح الكاش');
        return cache.addAll(urlsToCache);
      })
  );
});

// استراتيجية "Cache First ثم Network" للملفات الثابتة
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا وجد الملف في الكاش، أعده فوراً
        if (response) {
          return response;
        }
        // وإلا، قم بجلبه من الشبكة
        return fetch(event.request).then(
          networkResponse => {
            // اختياري: قم بتخزين الملفات الجديدة في الكاش
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          }
        );
      })
      .catch(() => {
        // في حالة عدم وجود اتصال ولا ملف في الكاش (يمكن عرض صفحة مخصصة offline)
        return new Response('أنت غير متصل بالإنترنت، لكن يمكنك استخدام التطبيق إذا كنت قد فتحته سابقاً.', {
          status: 503,
          statusText: 'Offline',
          headers: new Headers({ 'Content-Type': 'text/html' })
        });
      })
  );
});

// تحديث الـ Service Worker وحذف الكاش القديم
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
