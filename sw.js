// Legacy Core — Service Worker
// Network First للملفات الرئيسية عشان التحديثات تظهر فوراً

const CACHE = 'lft-v46';
const SHELL = [
  './',
  './index.html',
  './style.css',
  './dark.css',
  './manifest.json',
  './js/config.js',
  './js/auth.js',
  './js/ui_helpers.js',
  './js/ui_comps.js',
  './js/dashboard.js',
  './js/projects.js',
  './js/advances.js',
  './js/reports.js',
  './js/notifs.js',
  './js/search.js',
  './js/admin.js',
  './js/backup.js',
  './js/whatsapp.js',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Alexandria:wght@300;400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap'
];

const APP_FILES = ['index.html', 'style.css', '/js/'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase — لا كاش
  if (url.hostname.includes('supabase.co')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(
          JSON.stringify({ error: 'offline' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // Google Fonts — Network first
  if (url.hostname.includes('fonts.')) {
    e.respondWith(
      fetch(e.request)
        .then(r => { const c = r.clone(); caches.open(CACHE).then(cache => cache.put(e.request, c)); return r; })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // ملفات التطبيق الرئيسية — Network First عشان التحديثات تظهر فوراً
  const isAppFile = APP_FILES.some(f => url.pathname.endsWith(f) || url.pathname.includes(f)) || url.pathname === '/' || url.pathname.endsWith('/');
  if (isAppFile) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          if (r.ok) {
            const clone = r.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return r;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // باقي الطلبات — Cache First
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        if (r.ok && url.origin === self.location.origin) {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return r;
      }).catch(() => {
        if (e.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
