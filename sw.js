// Legacy Fine Touch — Service Worker v2
// يحفظ الشل بتاع التطبيق ويعرض صفحة offline لو الإنترنت قطع

const CACHE = 'lft-v6';
const SHELL = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Alexandria:wght@300;400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap'
];

// ── Install: كاش الشل ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: امسح الكاش القديم ──
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: استراتيجية ذكية حسب نوع الطلب ──
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase API calls — مش بنكاشها، بس لو offline نرجع error واضح
  if (url.hostname.includes('supabase.co')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(
          JSON.stringify({ error: 'offline', message: 'لا يوجد اتصال بالإنترنت' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // Google Fonts — Network first, fallback to cache
  if (url.hostname.includes('fonts.')) {
    e.respondWith(
      fetch(e.request)
        .then(r => { const c = r.clone(); caches.open(CACHE).then(cache => cache.put(e.request, c)); return r; })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // App Shell (HTML/JS/CSS) — Cache first, then network
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        // كاش أي حاجة جديدة من نفس الأصل
        if (r.ok && url.origin === self.location.origin) {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return r;
      }).catch(() => {
        // لو الطلب على صفحة HTML وOffline — ارجع الـ index
        if (e.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
