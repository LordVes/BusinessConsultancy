// Service worker: caches only the app's own static files so it opens fast.
// Data from Supabase is NEVER cached (privacy) — those requests bypass it.
const CACHE = 'baby-tracker-v3';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './js/core.js',
  './js/forms.js',
  './js/today.js',
  './js/nap.js',
  './js/schedule.js',
  './js/analysis.js',
  './js/growth.js',
  './js/who-data.js',
  './js/settings.js',
  './vendor/supabase-2.99.3.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return; // Supabase etc.: straight to network

  // Network first (so updates arrive), fall back to cache when offline.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
  );
});
