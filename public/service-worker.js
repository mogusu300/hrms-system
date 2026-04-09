/// <reference lib="webworker" />

/**
 * MWSC ERP Service Worker
 * Provides offline caching and background sync for field staff
 */

const CACHE_NAME = 'mwsc-erp-v1';
const OFFLINE_URL = '/offline';

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/login',
  '/dashboard',
  '/offline',
  '/manifest.webmanifest',
  '/favicon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// API routes that should use network-first strategy (always try fresh data)
const NETWORK_FIRST_ROUTES = [
  '/api/session',
  '/api/auth/',
  '/api/employee-details',
  '/api/leave-applications',
  '/api/transport-requests',
  '/api/work-orders',
  '/api/stores-tracking',
  '/api/purchase-tracking',
  '/api/staff-advances-tracking',
  '/api/salary-advance',
  '/api/cash-advance',
  '/api/stores-requisition',
  '/api/stores-return',
  '/api/purchase-requisition',
  '/api/items',
];

// Install event - pre-cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching essential assets');
      // Use individual adds to avoid failing all if one fails
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Failed to cache ${url}:`, err);
          })
        )
      );
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (let them pass through)
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API requests - Network First strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets (JS, CSS, images, fonts) - Cache First strategy
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|woff2?|ttf|eot)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation (HTML pages) - Network First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Everything else - Network First
  event.respondWith(networkFirst(request));
});

/**
 * Network First strategy - try network, fall back to cache
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Return a generic offline response for API calls
    return new Response(
      JSON.stringify({ error: 'You are offline. This data will sync when connection is restored.' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Cache First strategy - try cache, fall back to network
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('', { status: 408, statusText: 'Offline' });
  }
}

/**
 * Network First with offline page fallback for navigation
 */
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Try to serve the offline page
    const offlinePage = await caches.match(OFFLINE_URL);
    if (offlinePage) {
      return offlinePage;
    }
    return new Response('You are offline', {
      status: 503,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle cache clearing
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[SW] Cache cleared');
    });
  }
});

// Background sync for offline form submissions (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-requests') {
    console.log('[SW] Background sync triggered');
    // Future: Process queued offline requests from IndexedDB
  }
});
