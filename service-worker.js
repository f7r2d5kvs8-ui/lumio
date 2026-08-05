const CACHE = 'lumio-v12';
const ASSETS = ['./', './index.html', './styles.css', './games.css', './letters.css', './app.js', './data/languages.js', './data/writing-paths.js', './modules/storage.js'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request))));
