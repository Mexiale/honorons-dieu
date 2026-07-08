'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // En développement, le cache du service worker servirait des assets
    // périmés (CSS/JS recompilés en continu) : on le désactive et on purge
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()));
      if ('caches' in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
      return;
    }

    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // Service worker indisponible (vieux navigateur) : l'app reste utilisable
    });
  }, []);
  return null;
}
