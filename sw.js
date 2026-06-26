/* Service worker minimal — rend l'app installable et donne un repli hors-ligne.
   Stratégie "réseau d'abord" : en ligne on sert toujours la version fraîche
   (donc pas d'icône/contenu périmé), et hors-ligne on sert la dernière copie. */
const CACHE = 'soins-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // on ne gère que les GET de notre propre dossier ; on laisse passer Supabase et le reste
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req))
  );
});
