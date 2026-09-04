// Service worker Registro OCF: app disponibile anche offline
const CACHE = 'quizzocf-v21';
const SHELL = ['.', 'index.html', 'config.js', 'data.js', 'manifest.webmanifest',
               'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/logo-64.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if(e.request.method !== 'GET') return;
  if(url.hostname.endsWith('supabase.co')) return;              // API: sempre rete
  // rete prima per l'app (così gli aggiornamenti arrivano), cache come riserva offline
  if(url.origin === location.origin){
    e.respondWith(
      // no-cache: chiede sempre conferma al server, così un aggiornamento arriva subito
      // (senza, la cache HTTP di GitHub Pages può servire per minuti la versione vecchia)
      fetch(e.request, {cache: 'no-cache'}).then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
        return r;
      }).catch(() => caches.match(e.request, {ignoreSearch: true}))
    );
  } else {
    // font e librerie: cache prima (non cambiano)
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      const copia = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copia));
      return r;
    })));
  }
});
