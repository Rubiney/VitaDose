/* VitaDose — Service Worker (offline cache + notificações) */
const CACHE = 'vitadose-v72';

const ASSETS = [
  '/',
  '/index.html',
  '/cadastro.html',
  '/historico.html',
  '/perfil.html',
  '/sandbox.html',
  '/diario.html',
  '/qrcode.html',
  '/farmacia.html',
  '/whatsapp-status.html',
  '/css/vitadose.css',
  '/js/db.js',
  '/js/utils.js',
  '/js/interacoes.js',
  '/js/marcas.js',
  '/js/reacoes.js',
  '/js/ajusterenal.js',
  '/js/beers.js',
  '/js/duplicidade.js',
  '/js/anticolin.js',
  '/js/laboratorio.js',
  '/js/adesao.js',
  '/js/contraindicacoes.js',
  '/js/lab_farma.js',
  '/js/alimento.js',
  '/js/stopp_start.js',
  '/js/risco.js',
  '/js/pedidose.js',
  '/pedidose.html',
  '/js/tfg.js',
  '/tfg.html',
  '/timeline.html',
  '/metas.html',
  '/conciliacao.html',
  '/backup.html',
  '/dashboard.html',
  '/farmacinetica.html',
  '/busca.html',
  '/rastreio.html',
  '/carta-paciente.html',
  '/sinais.html',
  '/estoque.html',
  '/risco-cv.html',
  '/adesao-cal.html',
  '/sintomas.html',
  '/agenda.html',
  '/reacoes-adv.html',
  '/anotacoes.html',
  '/sos.html',
  '/polifarmacia.html',
  '/pacientes.html',
  '/risco-queda.html',
  '/fitoterapia.html',
  '/vacinas.html',
  '/nutricao.html',
  '/mrpa.html',
  '/diluicao.html',
  '/rastreio-prev.html',
  '/laboratorio.html',
  '/relatorio.html',
  '/orientacao.html',
  '/relatorio-sft.html',
  '/calc-clinico.html',
  '/plano-cuidados.html',
  '/qt-farma.html',
  '/sindromes-geriatricas.html',
  '/interacao-alimento.html',
  '/dor.html',
  '/farmacia-popular.html',
  '/risco-sangramento.html',
  '/saude-mental.html',
  '/orientacao-paciente.html',
  '/conversor-opioides.html',
  '/tdm.html',
  '/escala-fragilidade.html',
  '/corticosteroides.html',
  '/nutricao-clinica.html',
  '/anticoagulacao.html',
  '/calculadora-insulina.html',
  '/guia-antibioticos.html',
  '/dm-algoritmo.html',
  '/gestacao-lactacao.html',
  '/hipertensao.html',
  '/sondas-enteral.html',
  '/insuficiencia-cardiaca.html',
  '/dislipidemia.html',
  '/ajuste-hepatico.html',
  '/asma-dpoc.html',
  '/tireoideopatia.html',
  '/drc-manejo.html',
  '/epilepsia-algoritmo.html',
  '/anemia-algoritmo.html',
  '/osteoporose-algoritmo.html',
  '/depressao-ansiedade.html',
  '/gota-hiperuricemia.html',
  '/infeccoes-ambulatoriais.html',
  '/artrite-reumatoide.html',
  '/dor-cronica.html',
  '/dii-algoritmo.html',
  '/js/app.js',
  '/js/cadastro.js',
  '/js/diario.js',
  '/js/notificacoes.js',
  '/js/firebase-push.js',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

/* ── Install: precache resiliente (allSettled — 1 falha não trava tudo) ── */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.allSettled(ASSETS.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: limpa caches antigos ── */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      const velhos   = keys.filter(k => k !== CACHE);
      const isUpdate = velhos.length > 0;
      return Promise.all(velhos.map(k => caches.delete(k)))
        .then(() => self.clients.claim())
        .then(() => {
          if (!isUpdate) return;
          // Avisa todas as abas abertas que o app foi atualizado
          return self.clients.matchAll({ type: 'window' }).then(cs =>
            cs.forEach(c => c.postMessage({ type: 'SW_UPDATED' }))
          );
        });
    })
  );
});

/* ── Fetch: cache-first same-origin; rede para externo/API ── */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Passa direto: origens externas (Firebase CDN, Vercel analytics)
  if (url.origin !== self.location.origin) return;

  // Passa direto: rotas de API (sempre precisam de rede)
  if (url.pathname.startsWith('/api/')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        // Fallback offline: navegação → index.html; demais → sem resposta
        if (e.request.mode === 'navigate') return caches.match('/index.html');
      });
    })
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
