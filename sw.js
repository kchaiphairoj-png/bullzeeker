/**
 * Bullzeeker Service Worker (Basic offline + install support)
 *
 * Strategy:
 * - Cache static shell (HTML/CSS/JS) for offline access
 * - Network-first for market data (never cache stale prices)
 * - Skip caching for API calls
 */

const CACHE_VERSION = 'bullzeeker-v1';
const SHELL_CACHE = 'shell-' + CACHE_VERSION;

const SHELL_FILES = [
  '/',
  '/index.html',
  '/cio.html',
  '/screener.html',
  '/breakout.html',
  '/quality.html',
  '/longterm.html',
  '/macro.html',
  '/tools.html',
  '/learn.html',
  '/course.html',
  '/share.html',
  '/universe.js',
  '/strategies.js',
  '/manifest.json',
];

// Install: pre-cache shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => {
      // Cache one by one to avoid failure on any single 404
      return Promise.all(
        SHELL_FILES.map(url => cache.add(url).catch(err => console.warn('Cache miss:', url)))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== SHELL_CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Don't cache POST or non-GET
  if(event.request.method !== 'GET') return;

  // Never cache API/market data (always fresh)
  if(
    url.hostname.includes('yahoo.com') ||
    url.hostname.includes('workers.dev') ||
    url.hostname.includes('googletagmanager') ||
    url.hostname.includes('google-analytics') ||
    url.hostname.includes('allorigins.win') ||
    url.hostname.includes('corsproxy.io') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('anthropic.com')
  ){
    return; // Let network handle
  }

  // Cache-first for shell files, network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if(cached){
        // Async revalidate in background
        fetch(event.request).then(fresh => {
          if(fresh && fresh.ok){
            caches.open(SHELL_CACHE).then(c => c.put(event.request, fresh));
          }
        }).catch(() => {});
        return cached;
      }
      // Not in cache: fetch + cache
      return fetch(event.request).then(response => {
        if(response && response.ok && response.type === 'basic'){
          const clone = response.clone();
          caches.open(SHELL_CACHE).then(c => c.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback: return index
        return caches.match('/index.html');
      });
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
