/**
 * Bullzeeker Service Worker (Basic offline + install support)
 *
 * Strategy:
 * - Cache static shell (HTML/CSS/JS) for offline access
 * - Network-first for market data (never cache stale prices)
 * - Skip caching for API calls
 */

const CACHE_VERSION = 'bullzeeker-v2';
const SHELL_CACHE = 'shell-' + CACHE_VERSION;

// Clean URLs only — Vercel cleanUrls 308-redirects *.html, and a redirected
// response served to a navigation makes Chrome fail with ERR_FAILED.
const SHELL_FILES = [
  '/',
  '/cio',
  '/screener',
  '/breakout',
  '/quality',
  '/longterm',
  '/macro',
  '/tools',
  '/learn',
  '/course',
  '/share',
  '/universe.js',
  '/strategies.js',
  '/manifest.json',
];

// /longterm.html -> /longterm, /index.html -> /
function cleanPath(pathname){
  const p = pathname.replace(/\.html$/, '');
  return (p === '/index' || p === '') ? '/' : p;
}

// Strip the "redirected" flag so a cached copy is always safe to serve
async function sanitize(response){
  if(!response.redirected) return response;
  const body = await response.blob();
  return new Response(body, {status: response.status, statusText: response.statusText, headers: response.headers});
}

async function cachePut(key, response){
  if(!response || !response.ok || response.type !== 'basic') return;
  const clean = await sanitize(response);
  const cache = await caches.open(SHELL_CACHE);
  await cache.put(key, clean);
}

// Install: pre-cache shell
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all(
      SHELL_FILES.map(url => fetch(url).then(r => cachePut(url, r)).catch(() => console.warn('Cache miss:', url)))
    ).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches (drops the v1 cache full of redirected responses)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== SHELL_CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Don't cache POST or non-GET
  if(req.method !== 'GET') return;

  // Only handle same-origin; API/market data/analytics go straight to network
  if(url.origin !== self.location.origin) return;

  // Page navigations: network-first (browser follows redirects itself),
  // cached copy only as offline fallback
  if(req.mode === 'navigate'){
    const key = cleanPath(url.pathname);
    event.respondWith(
      fetch(req).then(response => {
        if(response.ok && !response.redirected){
          cachePut(key, response.clone()).catch(() => {});
        }
        return response;
      }).catch(async () => {
        return (await caches.match(key)) || (await caches.match('/')) || Response.error();
      })
    );
    return;
  }

  // Static assets: cache-first, revalidate in background
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(response => {
        cachePut(req, response.clone()).catch(() => {});
        return sanitize(response);
      });
      if(cached){
        network.catch(() => {});
        return cached;
      }
      return network;
    })
  );
});

// Push notifications (Phase 4.5 - for future backend integration)
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const title = data.title || '🐂 Bullzeeker Alert';
  const options = {
    body: data.body || 'มีเหตุการณ์สำคัญในตลาด US',
    icon: data.icon || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 192 192\'><rect width=\'192\' height=\'192\' rx=\'42\' fill=\'%23050810\'/><text y=\'.9em\' x=\'50%25\' font-size=\'150\' text-anchor=\'middle\' dominant-baseline=\'central\'>🐂</text></svg>',
    badge: data.badge,
    tag: data.tag || 'bullzeeker',
    data: data.url ? {url: data.url} : {},
    actions: data.actions || [],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/cio.html';
  event.waitUntil(
    self.clients.matchAll({type: 'window'}).then(clients => {
      // Focus existing tab or open new
      for(const client of clients){
        if(client.url.includes(url) && 'focus' in client){
          return client.focus();
        }
      }
      if(self.clients.openWindow){
        return self.clients.openWindow(url);
      }
    })
  );
});
