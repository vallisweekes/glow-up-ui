// Service Worker for Glow Up UI PWA
const CACHE_NAME = 'glow-up-ui-v1';

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/dashboard',
        '/weekly',
        '/customize'
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  const isAPI = url.pathname.startsWith('/api/');
  const isMutating = req.method !== 'GET';
  const isNextAsset = url.pathname.startsWith('/_next/');
  const isDevHost = ['localhost', '127.0.0.1'].includes(self.location.hostname);

  // In development, or for Next.js runtime assets, don't intercept — let the browser handle it
  if (isDevHost || isNextAsset) {
    return;
  }

  // Always go to network for API calls and non-GET requests; fall back gracefully if offline
  if (isAPI || isMutating) {
    event.respondWith(
      fetch(req).catch(() => new Response('Offline', { status: 503 }))
    );
    return;
  }

  // Network-first for GET navigations/assets with cache fallback
  event.respondWith(
    fetch(req)
      .then((res) => {
        // Optionally cache successful GET responses
        const shouldCache = res.ok && req.method === 'GET';
        if (shouldCache) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((response) => response || caches.match('/')))
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Glow Up Reminder';
  const options = {
    body: data.body || 'Time to check in on your routine!',
    tag: data.tag || 'glow-up-reminder',
    requireInteraction: false,
    data: {
      url: data.url || '/dashboard'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
