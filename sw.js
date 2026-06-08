/* VitaDose — Service Worker (offline cache) */
const CACHE = 'vitadose-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/cadastro.html',
  '/historico.html',
  '/perfil.html',
  '/css/vitadose.css',
  '/js/db.js',
  '/js/utils.js',
  '/js/interacoes.js',
  '/js/app.js',
  '/js/cadastro.js',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }))
  );
});
