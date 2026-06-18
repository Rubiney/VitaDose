/* VitaDose — Notificações locais + periodicSync */

let _timers = [];

/* Solicita permissão ao usuário */
async function solicitarPermissao() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied')  return false;
  const res = await Notification.requestPermission();
  return res === 'granted';
}

/* Agenda notificações via setTimeout (funciona com app aberto/em background) */
function agendarLocais(meds) {
  _timers.forEach(t => clearTimeout(t));
  _timers = [];

  const agora = Date.now();
  for (const med of meds) {
    if (med.ativo === false) continue;
    for (const h of (med.horarios || [])) {
      const [hh, mm] = h.split(':').map(Number);
      const alvo = new Date();
      alvo.setHours(hh, mm, 0, 0);
      const ms = alvo.getTime() - agora;
      if (ms > 0 && ms < 14 * 60 * 60 * 1000) {
        _timers.push(setTimeout(() => {
          if (Notification.permission !== 'granted') return;
          new Notification('💊 Hora do remédio — VitaDose', {
            body   : `${med.nome} ${med.dose}${med.unidade || ''} — ${h}`,
            icon   : '/icons/icon-192.svg',
            badge  : '/icons/icon-192.svg',
            tag    : `vd-${med.id}-${h}`,
            silent : false,
          });
        }, ms));
      }
    }
  }
}

/* Salva a agenda na IDB para o Service Worker usar no periodicSync */
async function salvarAgendaSW(meds) {
  const agenda = meds
    .filter(m => m.ativo !== false)
    .flatMap(m => (m.horarios || []).map(h => ({
      medId : m.id,
      nome  : m.nome,
      dose  : `${m.dose}${m.unidade || ''}`,
      horario: h,
    })));
  await dbSetConfig('agenda', agenda);
}

/* Registra periodicSync (Android Chrome com PWA instalada) */
async function registrarSync() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    if (!('periodicSync' in reg)) return;
    await reg.periodicSync.register('check-doses', {
      minInterval: 15 * 60 * 1000,
    });
  } catch(e) {}
}

/* Ponto de entrada: chamado após carregar medicamentos */
async function iniciarNotificacoes(meds) {
  if (!meds || !meds.length) return;
  const ok = await solicitarPermissao();
  await salvarAgendaSW(meds);
  await registrarSync();
  if (ok) {
    agendarLocais(meds);
    iniciarFirebasePush(meds);
  }
}
