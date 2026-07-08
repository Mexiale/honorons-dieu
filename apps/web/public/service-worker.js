// Service worker HonoronsDieu (production uniquement)
// Permet l'installation PWA et un mode hors ligne minimal.
const VERSION = 'hd-v2';
const PRECACHE = ['/offline.html', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(PRECACHE)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // On ne gère que notre propre origine (pas l'API ni les tuiles de carte)
  if (url.origin !== self.location.origin) return;

  // Navigation : réseau d'abord, page hors ligne en secours
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((r) => r ?? caches.match('/offline.html')),
      ),
    );
    return;
  }

  // Assets statiques versionnés : cache d'abord, réseau en secours
  // (sûr en production : les fichiers /_next/static/ portent un hash de contenu)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/')
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
  }
});
