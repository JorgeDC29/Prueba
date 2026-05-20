const CACHE_NAME = 'tienda-tech-cache-v5';
const APP_SHELL = [
  '/',
  '/index.html',
  '/css/estilos.css',
  '/js/app.js',
  '/js/firebase.js',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== location.origin) return;

  const isNavigation = event.request.mode === 'navigate';
  const isAsset = requestUrl.pathname.startsWith('/css/') ||
    requestUrl.pathname.startsWith('/js/') ||
    requestUrl.pathname === '/manifest.webmanifest' ||
    requestUrl.pathname === '/sw.js';

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (isNavigation) return caches.match('/index.html');
        if (isAsset) return Response.error();
        return Response.error();
      })
  );
});
