const CACHE = 'lumio-v104';
const ASSETS = ['./', './index.html', './styles.css', './games.css', './letters.css', './trace-fix.css', './mascot.css', './app.js', './data/languages.js', './data/audio-fa.js', './data/writing-paths.js', './modules/storage.js', './assets/mascot/lumio-welcome.webp', './assets/mascot/lumio-learning.webp', './assets/mascot/lumio-celebration.webp', './assets/mascot/lumio-try-again.png'];
self.addEventListener('install', event => event.waitUntil(
  caches.open(CACHE).then(cache => Promise.all(ASSETS.map(async asset => {
    const response = await fetch(new Request(asset, { cache: 'reload' }));
    if (response.ok) await cache.put(asset, response);
  }))).then(() => self.skipWaiting())
));
self.addEventListener('activate', event => event.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())
));
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const sameOrigin = url.origin === self.location.origin;
  const alwaysFresh = sameOrigin && (event.request.mode === 'navigate' || ['document', 'script', 'style', 'worker'].includes(event.request.destination));
  const networkRequest = alwaysFresh ? new Request(event.request, { cache: 'no-store' }) : event.request;
  event.respondWith(fetch(networkRequest).then(response => {
    if (sameOrigin && response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => caches.match(event.request)));
});
