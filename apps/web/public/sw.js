// Kill-switch : cette ancienne adresse de service worker a servi des assets
// périmés en développement. Le navigateur revérifie toujours ce fichier sur le
// réseau, donc cette version se déploie partout où l'ancien SW est enregistré,
// détruit son cache, se désinstalle et recharge les pages ouvertes.
// Le vrai service worker de production vit désormais dans /service-worker.js.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })(),
  );
});
