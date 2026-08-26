// Enterprise OS PWA Service Worker
const CACHE_NAME = 'enterprise-os-v2';

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

// Cache static assets and offline navigation
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);

  // Never intercept API routes, server actions, auth, or telemetry
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/super-admin') ||
    url.pathname.includes('/_next/data/') ||
    request.headers.get('next-action')
  ) {
    return;
  }

  // Handle static assets (Cache-First / Stale-While-Revalidate)
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js');

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // For HTML navigations, try network first, fallback to cached page if offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) {
            return cachedPage;
          }
          const offlineFallback = await caches.match('/');
          if (offlineFallback) {
            return offlineFallback;
          }
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline - Protech Assist</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:sans-serif;background:#090d16;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:20px;"><div><h2 style="font-size:20px;font-weight:900;text-transform:uppercase;">Offline Mode Active</h2><p style="color:#94a3b8;font-size:13px;">No internet connection detected. Saved transactions remain safe in browser storage.</p><button onclick="window.location.reload()" style="background:#4f46e5;color:#fff;border:none;padding:10px 20px;border-radius:12px;font-weight:bold;cursor:pointer;margin-top:10px;">Retry Connection</button></div></body></html>',
            {
              status: 200,
              headers: { 'Content-Type': 'text/html' }
            }
          );
        })
    );
  }
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
