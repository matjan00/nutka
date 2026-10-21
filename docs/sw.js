// Offline support: app files are served "stale-while-revalidate" (the saved copy opens instantly, also with
// no signal on a walk, and a fresh copy is fetched in the background). Fonts are cached once.
// Supabase calls are never cached. version.json is never cached (update check).
const VERSION = 'nutka-v2';
const CORE = ['./', 'index.html', 'style.css', 'manifest.webmanifest', 'icon.svg', 'icon-192.png',
  'js/app.js', 'js/data.js', 'js/store.js', 'js/sync-cursor.js', 'js/config.js', 'js/util.js', 'js/logic.js', 'js/ui.js', 'js/comp.js',
  'js/exercises.js', 'js/update.js', 'js/version.js', 'js/supabase.js',
  'js/install.js', 'js/s-today.js', 'js/s-library.js', 'js/s-session.js', 'js/s-progress.js', 'js/s-tasks.js', 'js/s-more.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: 'reload' }))).catch(() => {})).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== 'nutka-fonts').map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.endsWith('/version.json')) return;

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open('nutka-fonts').then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') c.put(req, res.clone());
      return res;
    }));
    return;
  }

  if (url.origin === location.origin) {
    e.respondWith(caches.open(VERSION).then(async (c) => {
      const hit = await c.match(req, { ignoreSearch: true });
      const net = fetch(req, { cache: 'no-cache' }).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
