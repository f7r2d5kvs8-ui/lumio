const CACHE = 'lumio-v91';
const ASSETS = ['./', './index.html', './styles.css', './games.css', './letters.css', './trace-fix.css', './mascot.css', './app.js', './data/languages.js', './data/audio-fa.js', './data/writing-paths.js', './modules/storage.js', './assets/mascot/lumio-welcome.webp', './assets/mascot/lumio-learning.webp', './assets/mascot/lumio-celebration.webp'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
  if (event.request.method === 'GET' && new URL(event.request.url).origin === self.location.origin && response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
  return response;
}))));
