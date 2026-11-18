/* Offline-first shell cache. Native Capacitor builds skip Service Worker registration. */
const version = new URL(self.location.href).searchParams.get('v') || 'dev';
const cacheName = `kasir-alfamidi-${version}`;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    const manifestUrl = new URL('./precache-manifest.json', self.registration.scope);

    try {
      const response = await fetch(manifestUrl, { cache: 'no-store' });
      if (response.ok) {
        const assets = await response.json();
        await Promise.all(assets.map(async (asset) => {
          const url = new URL(asset, self.registration.scope);
          try {
            const assetResponse = await fetch(url, { cache: 'no-cache' });
            if (assetResponse.ok) await cache.put(url, assetResponse.clone());
          } catch (error) {
            console.warn('Precache asset skipped:', url.href, error);
          }
        }));
      } else {
        await cache.add(new URL('./', self.registration.scope));
      }
    } catch (error) {
      console.warn('Offline precache manifest is not available yet:', error);
      try { await cache.add(new URL('./', self.registration.scope)); } catch { /* first install can retry online */ }
    }

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('kasir-alfamidi-') && key !== cacheName).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(cacheName);
        await cache.put(new URL('./index.html', self.registration.scope), networkResponse.clone());
        return networkResponse;
      } catch {
        const cache = await caches.open(cacheName);
        return (await cache.match(request)) || (await cache.match(new URL('./index.html', self.registration.scope))) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      return Response.error();
    }
  })());
});
