/* VitaDose — Notificações locais + periodicSync */
/* Áudio: tocarAlertaSonoro() vive em utils.js */

let _timers        = [];
let _alertaQueue   = [];
let _alertaAtivo   = false;
let _snoozePending = {};
let _alertaSomLoop = null; // repete o som a cada 30s enquanto o banner estiver na tela

function _pararSomLoop() {
  if (_alertaSomLoop) { clearInterval(_alertaSomLoop); _alertaSomLoop = null; }
}

/* ── Banner visual in-app (fila para múltiplas doses simultâneas) ── */
function exibirAlertaVisual(med, horario) {
  _alertaQueue.push({ med, horario });
  if (!_alertaAtivo) _processarProximoAlerta();
}

function _processarProximoAlerta() {
  if (!_alertaQueue.length) { _alertaAtivo = false; return; }
  _alertaAtivo = true;
  const { med, horario } = _alertaQueue.shift();

  const antigo = document.getElementById('vd-dose-alert');
  if (antigo) antigo.remove();

  _snoozePending[`${med.id}-${horario}`] = med;

  const nomeSafe = med.nome.replace(/'/g, "\\'");
  const detalhe  = `${med.dose}${med.unidade || ''} — ${horario}`;
  const restante = _alertaQueue.length;
  const maisHtml = restante > 0
    ? `<p class="vd-alert-mais">+${restante} dose${restante > 1 ? 's' : ''} aguardando</p>`
    : '';

  const el = document.createElement('div');
  el.id = 'vd-dose-alert';
  el.innerHTML = `
    <div class="vd-alert-backdrop" onclick="fecharAlertaDose()"></div>
    <div class="vd-alert-sheet">
      <div class="vd-alert-pulse">💊</div>
      <p class="vd-alert-label">Hora do Remédio</p>
      <p class="vd-alert-med">${med.nome}</p>
      <p class="vd-alert-info">${detalhe}</p>
      ${maisHtml}
      <div class="vd-alert-actions">
        <button class="btn btn-outline" onclick="fecharAlertaDose()">Depois</button>
        <button class="btn btn-outline" onclick="snoozeAlerta(${med.id},'${horario}')">⏰ 15 min</button>
      </div>
      <button class="btn btn-gold" style="width:100%;margin-top:8px"
        onclick="confirmarDoAlert(${med.id},'${horario}','${nomeSafe}')">✓ Tomei agora</button>
    </div>`;

  document.body.appendChild(el);

  // Inicia loop de som: toca imediatamente e repete a cada 30s até interação
  _pararSomLoop();
  tocarAlertaSonoro();
  _alertaSomLoop = setInterval(tocarAlertaSonoro, 30000);
}

window.fecharAlertaDose = function() {
  _pararSomLoop();
  const el = document.getElementById('vd-dose-alert');
  if (el) {
    el.classList.add('vd-alert-saindo');
    setTimeout(() => { el.remove(); _alertaAtivo = false; _processarProximoAlerta(); }, 250);
  }
};

window.confirmarDoAlert = function(medId, horario, medNome) {
  _pararSomLoop();
  const el = document.getElementById('vd-dose-alert');
  if (el) el.remove();
  _alertaAtivo = false;
  _processarProximoAlerta();
  if (typeof abrirConfirmar === 'function') abrirConfirmar(medId, horario, medNome);
};

window.snoozeAlerta = function(medId, horario) {
  const med = _snoozePending[`${medId}-${horario}`];
  fecharAlertaDose();
  if (!med) return;
  setTimeout(() => {
    if (!document.hidden) {
      exibirAlertaVisual(med, horario); // som iniciado dentro de _processarProximoAlerta
    }
    if (Notification.permission === 'granted') {
      new Notification('⏰ Lembrete — VitaDose', {
        body  : `${med.nome} ${med.dose}${med.unidade || ''} — ${horario}`,
        icon  : '/icons/icon-192.svg',
        badge : '/icons/icon-192.svg',
        tag   : `vd-snooze-${medId}-${horario}`,
        silent: false,
      });
    }
  }, 15 * 60 * 1000);
  showToast('⏰ Lembrete em 15 minutos');
};

/* ── Solicita permissão ao usuário ── */
async function solicitarPermissao() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied')  return false;
  const res = await Notification.requestPermission();
  return res === 'granted';
}

/* ── Reexibe banner ao voltar ao app (usuário estava em outro app/aba) ── */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && _alertaQueue.length > 0 && !_alertaAtivo) {
    _processarProximoAlerta();
  }
});

/* ── Agenda via setTimeout (som + visual sempre; notificação sistema se tiver permissão) ── */
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
          // Notificação do sistema — dispara sempre, mesmo em background
          if (Notification.permission === 'granted') {
            new Notification('💊 Hora do remédio — VitaDose', {
              body  : `${med.nome} ${med.dose}${med.unidade || ''} — ${h}`,
              icon  : '/icons/icon-192.svg',
              badge : '/icons/icon-192.svg',
              tag   : `vd-${med.id}-${h}`,
              silent: false,
            });
          }
          // Banner + som in-app — apenas se o app estiver visível
          if (!document.hidden) {
            exibirAlertaVisual(med, h);
          }
        }, ms));
      }
    }
  }
}

/* ── Salva agenda na IDB para o Service Worker (periodicSync) ── */
async function salvarAgendaSW(meds) {
  const agenda = meds
    .filter(m => m.ativo !== false)
    .flatMap(m => (m.horarios || []).map(h => ({
      medId  : m.id,
      nome   : m.nome,
      dose   : `${m.dose}${m.unidade || ''}`,
      horario: h,
    })));
  await dbSetConfig('agenda', agenda);
}

/* ── Registra periodicSync (Android Chrome, PWA instalada) ── */
async function registrarSync() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    if (!('periodicSync' in reg)) return;
    await reg.periodicSync.register('check-doses', { minInterval: 15 * 60 * 1000 });
  } catch(e) {}
}

/* ── Ponto de entrada ── */
async function iniciarNotificacoes(meds) {
  if (!meds || !meds.length) return;
  await solicitarPermissao();
  await salvarAgendaSW(meds);
  await registrarSync();
  agendarLocais(meds);
  if (Notification.permission === 'granted') iniciarFirebasePush(meds);
}
