// Custom Service Worker for Web Push background notifications
self.addEventListener('push', function(event) {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'System Alert';
    const options = {
      body: data.body || 'New operational update received.',
      icon: '/images/logo2.png',
      badge: '/images/logo2.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/dashboard/system/notifications'
      }
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Error displaying push notification:", err);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      const targetUrl = event.notification.data ? event.notification.data.url : '/dashboard/system/notifications';
      
      // Look for open tabs with targetUrl and focus
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
