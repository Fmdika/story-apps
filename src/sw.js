import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { clientsClaim, skipWaiting } from 'workbox-core';

const CACHE_VERSION = 'v2';
const staticCacheName = `static-resources-${CACHE_VERSION}`;
const imageCacheName = `images-${CACHE_VERSION}`;
const apiCacheName = `api-cache-${CACHE_VERSION}`;
const htmlCacheName = `html-cache-${CACHE_VERSION}`;

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  skipWaiting();
  
  event.waitUntil(
    caches.keys().then(async (cacheNames) => {
      const deletePromises = cacheNames.map((cacheName) => {
        if (!cacheName.includes(CACHE_VERSION)) {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        }
      });
      return Promise.all(deletePromises);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  
  clientsClaim();
  
  event.waitUntil(
    clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_ACTIVATED',
          message: 'Service Worker telah aktif'
        });
      });
    })
  );
});

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: imageCacheName,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
        purgeOnQuotaError: true,
      }),
    ],
  })
);

registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
  new CacheFirst({
    cacheName: imageCacheName,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
        purgeOnQuotaError: true,
      }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst({
    cacheName: htmlCacheName,
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 24 * 60 * 60, // 1 hari
      }),
    ],
  })
);

registerRoute(
  ({ request }) => 
    request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: staticCacheName,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 7 * 24 * 60 * 60, 
      }),
    ],
  })
);

registerRoute(
  /\.(?:css|js)$/i,
  new StaleWhileRevalidate({
    cacheName: staticCacheName,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 7 * 24 * 60 * 60, 
      }),
    ],
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/') || url.hostname.includes('api'),
  new NetworkFirst({
    cacheName: apiCacheName,
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({ 
        maxEntries: 30,
        maxAgeSeconds: 5 * 60, 
      })
    ],
  })
);

self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
      console.log('Push data:', data);
    } catch (e) {
      console.log('Push data as text:', event.data.text());
      data = { 
        title: 'Story Apps', 
        body: event.data.text() || 'You have a new notification!' 
      };
    }
  } else {
    data = { 
      title: 'Story Apps', 
      body: 'You have a new notification!' 
    };
  }

  const title = data.title || 'Story Apps';
  const options = {
    body: data.body || 'You have a new notification!',
    icon: '/images/applogo.png',
    badge: '/images/applogo.png',
    tag: 'story-notification',
    renotify: true,
    requireInteraction: false,
    data: { 
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/images/applogo.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log('Notification shown successfully');
      })
      .catch((error) => {
        console.error('Error showing notification:', error);
      })
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  if (event.action === 'close') {
    return;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('Error handling notification click:', error);
      })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

self.addEventListener('message', (event) => {
  console.log('SW received message:', event.data);
  
  const data = event.data;
  if (!data) return;

  if (data.type === 'TEST_PUSH') {
    const title = data.title || 'Test Notification';
    const options = {
      body: data.body || 'This is a test notification!',
      icon: '/images/applogo.png',
      badge: '/images/applogo.png',
      tag: 'test-notification',
      data: { url: data.url || '/' }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
        .then(() => {
          console.log('Test notification shown');
        })
        .catch((error) => {
          console.error('Error showing test notification:', error);
        })
    );
  }
  
  if (data.type === 'SKIP_WAITING') {
    skipWaiting();
  }
});

self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event);
});

console.log('Service Worker loaded successfully');