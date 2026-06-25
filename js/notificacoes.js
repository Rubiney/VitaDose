/* VitaDose — Notificações locais + periodicSync */

let _timers = [];
let _audioCtx = null;
let _alertaQueue = [];
let _alertaAtivo = false;

/* ── AudioContext: inicializa na primeira interação do usuário (requisito iOS/Android) ── */
function _initAudio() {
  if (_audioCtx) return;
  try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
}
document.addEventListener('click',      _initAudio, { once: true });
document.addEventListener('touchstart', _initAudio, { once: true });

/* ── Toca 3 bipes via Web Audio API ── */
function tocarAlertaSonoro() {
  if (!_audioCtx) return;
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  const bip = (freq, t0, dur) => {
    const osc  = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.connect(gain);
    gain.connect(_audioCtx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.35, t0 + 0.02);
    gain.gain.setValueAtTime(0.35, t0 + dur - 0.05);
    gain.gain.linearRampToValueAtTime(0, t0 + dur);
    osc.start(t0);
    osc.stop(t0 + dur + 0.01);
  };
  const t = _audioCtx.currentTime;
  bip(880,  t,        0.18);
  bip(880,  t + 0.25, 0.18);
  bip(1100, t + 0.50, 0.28);
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
        <button class="btn btn-gold" onclick="confirmarDoAlert(${med.id},'${horario}','${nomeSafe}')">✓ Tomei</button>
      </div>
    </div>`;

  document.body.appendChild(el);
}

window.fecharAlertaDose = function() {
  const el = document.getElementById('vd-dose-alert');
  if (el) {
    el.classList.add('vd-alert-saindo');
    setTimeout(() => { el.remove(); _alertaAtivo = false; _processarProximoAlerta(); }, 250);
  }
};

window.confirmarDoAlert = function(medId, horario, medNome) {
  const el = document.getElementById('vd-dose-alert');
  if (el) el.remove();
  _alertaAtivo = false;
  _processarProximoAlerta();
  if (typeof abrirConfirmar === 'function') abrirConfirmar(medId, horario, medNome);
};

/* ── Solicita permissão ao usuário ── */
async function solicitarPermissao() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied')  return false;
  const res = await Notification.requestPermission();
  return res === 'granted';
}

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
          // App em foreground: som + banner visual
          if (!document.hidden) {
            tocarAlertaSonoro();
            exibirAlertaVisual(med, h);
          }
          // Notificação do sistema (funciona em background se permissão concedida)
          if (Notification.permission === 'granted') {
            new Notification('💊 Hora do remédio — VitaDose', {
              body  : `${med.nome} ${med.dose}${med.unidade || ''} — ${h}`,
              icon  : '/icons/icon-192.svg',
              badge : '/icons/icon-192.svg',
              tag   : `vd-${med.id}-${h}`,
              silent: false,
            });
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
