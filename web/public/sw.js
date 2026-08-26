// Enterprise OS PWA Service Worker
const CACHE_NAME = 'enterprise-os-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first strategy with fetch handler (satisfies PWA install criteria)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);
  // Do not intercept API requests or internal server actions
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/super-admin') || url.pathname.includes('/_next/data/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Automatically cache static assets, icons, fonts, and scripts for offline usage
        if (
          response.status === 200 &&
          (url.pathname.startsWith('/images/') ||
           url.pathname.startsWith('/_next/static/') ||
           url.pathname.endsWith('.png') ||
           url.pathname.endsWith('.jpg') ||
           url.pathname.endsWith('.svg') ||
           url.pathname.endsWith('.woff2') ||
           url.pathname.endsWith('.css') ||
           url.pathname.endsWith('.js'))
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) {
          return cached;
        }
        return new Response('Network request failed', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Web Push Background Notifications
self.addEventListener('push', function(event) {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Enterprise OS Alert';
    const options = {
      body: data.body || 'New operational update received.',
      icon: '/images/logo2.png',
      badge: '/images/logo2.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/dashboard'
      }
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Error displaying push notification:', err);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      const targetUrl = event.notification.data ? event.notification.data.url : '/dashboard';
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
