/* VitaDose — Service Worker (offline cache + notificações) */
const CACHE = 'vitadose-v20';
const ASSETS = [
  '/',
  '/index.html',
  '/cadastro.html',
  '/historico.html',
  '/perfil.html',
  '/diario.html',
  '/qrcode.html',
  '/farmacia.html',
  '/whatsapp-status.html',
  '/css/vitadose.css',
  '/js/db.js',
  '/js/utils.js',
  '/js/interacoes.js',
  '/js/app.js',
  '/js/cadastro.js',
  '/js/diario.js',
  '/js/notificacoes.js',
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

/* ── Notificações: periodicSync (Android Chrome, PWA instalada) ── */
self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'check-doses') {
    e.waitUntil(verificarDoses());
  }
});

async function verificarDoses() {
  const agenda = await lerAgendaIDB();
  if (!agenda || !agenda.length) return;

  const agora   = new Date();
  const hhmm    = agora.getHours().toString().padStart(2,'0') + ':' + agora.getMinutes().toString().padStart(2,'0');
  const agoraMin = toMinSW(hhmm);
  const hoje    = agora.toISOString().slice(0,10);

  const dosesConfirmadas = await lerDosesHoje(hoje);
  const confirmadas = new Set(dosesConfirmadas.map(d => `${d.medicamentoId}-${d.horario}`));

  for (const item of agenda) {
    const doseMin = toMinSW(item.horario);
    const diff    = doseMin - agoraMin;
    // Janela: de -2 min até +10 min em relação ao horário da dose
    if (diff >= -2 && diff <= 10) {
      if (!confirmadas.has(`${item.medId}-${item.horario}`)) {
        await self.registration.showNotification('💊 Hora do remédio — VitaDose', {
          body : `${item.nome} ${item.dose} — ${item.horario}`,
          icon : '/icons/icon-192.svg',
          badge: '/icons/icon-192.svg',
          tag  : `vd-dose-${item.medId}-${item.horario}-${hoje}`,
          data : { url: '/' },
        });
      }
    }
  }
}

function toMinSW(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function lerAgendaIDB() {
  return new Promise((resolve) => {
    const req = indexedDB.open('vitadose');
    req.onsuccess = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('config')) { resolve(null); return; }
      const get = db.transaction('config', 'readonly').objectStore('config').get('agenda');
      get.onsuccess = () => resolve(get.result ? get.result.value : null);
      get.onerror   = () => resolve(null);
    };
    req.onerror = () => resolve(null);
  });
}

function lerDosesHoje(hoje) {
  return new Promise((resolve) => {
    const req = indexedDB.open('vitadose');
    req.onsuccess = (e) => {
      const db  = e.target.result;
      const all = db.transaction('doses', 'readonly').objectStore('doses').getAll();
      all.onsuccess = () => resolve((all.result || []).filter(d => d.data === hoje));
      all.onerror   = () => resolve([]);
    };
    req.onerror = () => resolve([]);
  });
}

/* ── Clique na notificação: abre o app ── */
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      const aberto = cs.find(c => c.url.includes(self.location.origin));
      if (aberto) return aberto.focus();
      return clients.openWindow('/');
    })
  );
});
