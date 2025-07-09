/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

declare let self: ServiceWorkerGlobalScope;

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache API responses with network-first strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      }),
      new BackgroundSyncPlugin('api-queue', {
        maxRetentionTime: 24 * 60, // Retry for 24 hours
      }),
    ],
  })
);

// Cache images with cache-first strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Offline fallback for critical data
const OFFLINE_CACHE = 'offline-data-v1';
const CRITICAL_URLS = [
  '/api/menu/current',
  '/api/cocktails/list',
  '/api/wine/list',
  '/api/86-list/current',
  '/api/specials/today',
];

// Pre-cache critical data
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => {
      return Promise.all(
        CRITICAL_URLS.map((url) =>
          fetch(url).then((response) => cache.put(url, response))
        )
      );
    })
  );
});

// Real-time sync for 86 list updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_86_LIST') {
    event.waitUntil(
      fetch('/api/86-list/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event.data.payload),
      }).then(() => {
        // Notify all clients of successful sync
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: '86_LIST_SYNCED',
              timestamp: new Date().toISOString(),
            });
          });
        });
      })
    );
  }
});

// Handle push notifications for urgent updates
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  if (data.type === '86_UPDATE') {
    event.waitUntil(
      self.registration.showNotification('86 List Update', {
        body: `${data.item} has been 86'd by ${data.user}`,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: '86-update',
        requireInteraction: false,
        data: {
          url: '/#86-list',
        },
      })
    );
  }
});

// Click notification to open app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data.url)
  );
});