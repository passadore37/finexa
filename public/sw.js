const CACHE = 'finexa-v3';
const STATIC = ['/', '/dashboard', '/lancar', '/metas'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('/api/')) return;

  // Nunca cachear fontes externas — deixar o browser gerenciar
  if (
    e.request.url.includes('fonts.googleapis.com') ||
    e.request.url.includes('fonts.gstatic.com')
  ) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Só cachear respostas válidas e do mesmo origin
        if (res.ok && e.request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title || 'Finexa', {
        body:    data.body || '',
        icon:    '/icon-192.png',
        badge:   '/icon-light-32x32.png',
        data:    { url: data.url || '/dashboard' },
        vibrate: [200, 100, 200],
        actions: [
          { action: 'abrir',  title: 'Abrir' },
          { action: 'fechar', title: 'Agora não' },
        ],
      }),
      self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => client.postMessage({
          type:  'PUSH_RECEIVED',
          title: data.title,
          body:  data.body,
          data:  new Date().toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
          }),
        }));
      }),
    ])
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'fechar') return;
  const url = e.notification.data?.url || '/dashboard';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});