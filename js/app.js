/* VitaDose — Home / Painel do Dia */

let paciente    = null;
let medicamentos = [];
let dosesHoje   = [];
let confirmPending = null; // { medId, horario, medNome }

/* ── Init ── */
async function init() {
  // LGPD
  if (!consentOk()) {
    document.getElementById('lgpd').classList.remove('hidden');
  }

  // Data de hoje
  document.getElementById('date-bar').textContent = fmtDataLonga(hoje());

  const pid = getActivePacienteId();
  if (!pid) {
    window.location.href = 'cadastro.html';
    return;
  }

  paciente = await dbGet('pacientes', pid);
  if (!paciente) {
    localStorage.removeItem('vd_active');
    window.location.href = 'cadastro.html';
    return;
  }

  // Avatar
  const avatarEl = document.getElementById('avatar');
  if (paciente.foto) {
    avatarEl.style.backgroundImage    = `url(${paciente.foto})`;
    avatarEl.style.backgroundSize     = 'cover';
    avatarEl.style.backgroundPosition = 'center';
    avatarEl.textContent = '';
  } else {
    avatarEl.textContent = iniciaisNome(paciente.nome);
  }

  // Medicamentos ativos (exclui tratamentos vencidos)
  const todos = await dbGetByIndex('medicamentos', 'pacienteId', pid);
  const hj = hoje();
  medicamentos = todos.filter(m => m.ativo !== false && (!m.dataFim || m.dataFim >= hj));

  // Doses de hoje
  const allDoses = await dbGetAll('doses');
  dosesHoje = allDoses.filter(d => d.data === hoje());

  await render();
  iniciarNotificacoes(medicamentos);
}

/* ── Render tudo ── */
async function render() {
  renderSummary();
  renderProgress();
  renderNextDose();
  renderMedList();
  renderAlertas();
}

/* ── Summary ── */
function renderSummary() {
  let tomadas = 0, pendentes = 0, perdidas = 0, total = 0;

  for (const med of medicamentos) {
    for (const h of (med.horarios || [])) {
      total++;
      const st = getDoseStatus(med.id, h);
      if (st === 'tomado')  tomadas++;
      else if (st === 'perdido') perdidas++;
      else pendentes++;
    }
  }

  document.getElementById('sum-tomadas').textContent  = tomadas;
  document.getElementById('sum-pendentes').textContent = pendentes;
  document.getElementById('sum-perdidas').textContent  = perdidas;
  document.getElementById('sum-total').textContent     = total;

  document.getElementById('sum-pendentes').className = 'sum-num' + (pendentes > 0 ? ' amber' : ' green');
  document.getElementById('sum-perdidas').className  = 'sum-num' + (perdidas  > 0 ? ' red'   : '');
}

/* ── Progress ── */
function renderProgress() {
  let total = 0, tomadas = 0;
  for (const med of medicamentos) {
    for (const h of (med.horarios || [])) {
      total++;
      if (getDoseStatus(med.id, h) === 'tomado') tomadas++;
    }
  }
  const pct = total ? Math.round((tomadas / total) * 100) : 0;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-lbl').textContent  = `${tomadas} de ${total} doses tomadas hoje`;
}

/* ── Próxima dose ── */
function renderNextDose() {
  const wrap = document.getElementById('next-dose-wrap');
  const proxima = getProximaDose();

  if (!proxima) {
    wrap.innerHTML = '';
    return;
  }

  wrap.innerHTML = `
    <div class="next-dose">
      <div class="info">
        <p class="nd-eyebrow">Próxima dose em</p>
        <p class="nd-name">${proxima.medNome} <span class="mono">${proxima.dose}</span></p>
        <p class="nd-time mono">${proxima.horario}</p>
      </div>
      <button class="btn btn-gold btn-sm" onclick="abrirConfirmar(${proxima.medId}, '${proxima.horario}', '${proxima.medNome.replace(/'/g, "\\'")}')">
        Confirmar
      </button>
    </div>`;
}

function getProximaDose() {
  const agora = minutosTotal(agoraHHMM());
  let candidatos = [];

  for (const med of medicamentos) {
    for (const h of (med.horarios || [])) {
      const st = getDoseStatus(med.id, h);
      if (st === 'pendente') {
        candidatos.push({ medId: med.id, medNome: med.nome, dose: med.dose + (med.unidade || ''), horario: h, min: minutosTotal(h) });
      }
    }
  }

  if (!candidatos.length) return null;

  // Ordena: primeiro os ainda não passados, depois os que já passaram
  const futuros   = candidatos.filter(c => c.min >= agora).sort((a,b) => a.min - b.min);
  const passados  = candidatos.filter(c => c.min <  agora).sort((a,b) => b.min - a.min);
  return futuros[0] || passados[0];
}

/* ── Med cards ── */
function renderMedList() {
  const el = document.getElementById('med-list');

  if (!medicamentos.length) {
    el.innerHTML = `
      <div class="empty">
        <div class="icon">💊</div>
        <p>Nenhum medicamento cadastrado.</p>
        <a href="cadastro.html" class="btn btn-primary btn-sm" style="display:inline-block;margin-top:4px">Adicionar medicamento</a>
      </div>`;
    return;
  }

  el.innerHTML = medicamentos.map(med => buildMedCard(med)).join('');
}

function buildMedCard(med) {
  const horarios = med.horarios || [];
  const stripeColor = getStripeColor(med);
  const stockColor  = getStockColor(med);
  const stockPct    = getStockPct(med);
  const dias        = diasRestantes(med);
  const alertaEstoque = med.qtdAtual <= med.limiarAlerta;

  const horariosHtml = horarios.map(h => {
    const st = getDoseStatus(med.id, h);
    const cls = st === 'tomado' ? 'h-pill tomado' : 'h-pill';
    const check = st === 'tomado' ? ' ✓' : '';
    return `<span class="${cls}">${h}${check}</span>`;
  }).join('');

  // Badge status geral do med (se alguma pendente → pendente; se todas tomadas → tomado)
  const statuses = horarios.map(h => getDoseStatus(med.id, h));
  let badgeHtml = '';
  if (statuses.every(s => s === 'tomado')) {
    badgeHtml = `<span class="badge badge-green"><span class="bdot green"></span>Tomado</span>`;
  } else if (statuses.some(s => s === 'pendente')) {
    badgeHtml = `<span class="badge badge-amber"><span class="bdot amber"></span>Pendente</span>`;
  } else {
    badgeHtml = `<span class="badge badge-gray"><span class="bdot gray"></span>Agendado</span>`;
  }

  const alertaHtml = alertaEstoque ? `
    <div class="alert-inline ${med.qtdAtual <= 0 ? 'red' : 'amber'}">
      ⚠ ${med.qtdAtual <= 0
        ? 'Estoque zerado — renove a prescrição urgentemente'
        : `${med.qtdAtual} ${med.unidade || 'un'} restantes — providencie nova caixa (${dias}d)`}
      <button onclick="event.stopPropagation()">×</button>
    </div>` : '';

  // Botão confirmar dose (mostra apenas se alguma pendente)
  const temPendente = statuses.some(s => s === 'pendente');
  const proxH = horarios.find(h => getDoseStatus(med.id, h) === 'pendente');
  const btnConfirmar = temPendente
    ? `<button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="abrirConfirmar(${med.id},'${proxH}','${med.nome.replace(/'/g, "\\'")}')">Confirmar ${proxH}</button>`
    : '';

  return `
    <div class="med-card" id="med-${med.id}">
      <div class="med-inner">
        <div class="med-stripe ${stripeColor}"></div>
        <div class="med-body">
          <div class="med-top">
            <div>
              <p class="med-name">${med.nome} <span class="mono" style="font-size:.8rem;color:var(--text-2)">${med.dose}${med.unidade || ''}</span></p>
              <p class="med-ind">${med.indicacao || ''}</p>
            </div>
            <div class="stock-mini">
              <p class="stock-num">${med.qtdAtual ?? '—'} / ${med.qtdCaixa ?? '—'}</p>
              <p class="stock-lbl">Estoque</p>
              <div class="stock-bar"><div class="stock-fill ${stockColor}" style="width:${stockPct}%"></div></div>
              <p class="stock-pct">${stockPct}%</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            ${badgeHtml}
            ${(() => {
              const d = diasParaFim(med.dataFim);
              if (d === null) return '';
              if (d === 0) return `<span class="badge badge-red">Último dia</span>`;
              if (d <= 3)  return `<span class="badge badge-red">Termina em ${d}d</span>`;
              return `<span class="badge badge-amber">Termina em ${d}d</span>`;
            })()}
            <div class="horarios">${horariosHtml}</div>
          </div>
          ${btnConfirmar}
        </div>
      </div>
      ${alertaHtml}
    </div>`;
}

function diasParaFim(dataFim) {
  if (!dataFim) return null;
  const hoje_ms = new Date(hoje() + 'T12:00:00').getTime();
  const fim_ms  = new Date(dataFim + 'T12:00:00').getTime();
  return Math.round((fim_ms - hoje_ms) / 86400000);
}

function getStripeColor(med) {
  const horarios = med.horarios || [];
  const statuses = horarios.map(h => getDoseStatus(med.id, h));
  if (statuses.every(s => s === 'tomado'))  return 'green';
  if (statuses.some(s  => s === 'pendente')) return 'amber';
  if (statuses.some(s  => s === 'perdido'))  return 'red';
  return 'gray';
}

/* ── Alertas clínicos ── */
function renderAlertas() {
  const alertas = gerarAlertas(medicamentos);
  const wrap    = document.getElementById('alertas-wrap');

  if (!alertas.length) { wrap.innerHTML = ''; return; }

  const icon = { interacao: '🔴', alimentacao: '⚠️' };

  wrap.innerHTML = `
    <p class="sec-header">Alertas Clínicos</p>
    <div class="alertas-sec">
      ${alertas.map(a => `
        <div class="al-card ${a.tipo}">
          <span class="al-icon">${icon[a.tipo]}</span>
          <div>
            <p class="al-title">${a.titulo}</p>
            <p class="al-desc">${a.desc}</p>
          </div>
        </div>`).join('')}
    </div>`;
}

/* ── Status de uma dose ── */
function getDoseStatus(medId, horario) {
  const reg = dosesHoje.find(d => d.medicamentoId === medId && d.horario === horario);
  if (reg) return reg.status;

  const horaMin  = minutosTotal(horario);
  const agoraMin = minutosTotal(agoraHHMM());

  if (horaMin < agoraMin - 90) return 'perdido';
  return 'pendente';
}

/* ── Confirmar dose ── */
function abrirConfirmar(medId, horario, medNome) {
  confirmPending = { medId, horario, medNome };
  document.getElementById('modal-med-name').textContent = `${medNome} — ${horario}`;
  document.getElementById('confirm-modal').classList.remove('hidden');
}

function fecharConfirmar() {
  confirmPending = null;
  document.getElementById('confirm-modal').classList.add('hidden');
}

async function confirmarDoseTomada() {
  if (!confirmPending) return;
  const { medId, horario } = confirmPending;

  // Registrar dose
  await dbAdd('doses', { medicamentoId: medId, data: hoje(), horario, status: 'tomado', timestamp: Date.now() });

  // Decrementar estoque
  const med = medicamentos.find(m => m.id === medId);
  if (med && med.qtdAtual > 0) {
    med.qtdAtual = Math.max(0, med.qtdAtual - 1);
    await dbPut('medicamentos', med);
  }

  // Recarregar doses e re-render
  const allDoses = await dbGetAll('doses');
  dosesHoje = allDoses.filter(d => d.data === hoje());

  fecharConfirmar();
  await render();
  showToast('✓ Dose registrada');
}

async function marcarPerdida(medId, horario) {
  await dbAdd('doses', { medicamentoId: medId, data: hoje(), horario, status: 'perdido', timestamp: Date.now() });
  const allDoses = await dbGetAll('doses');
  dosesHoje = allDoses.filter(d => d.data === hoje());
  await render();
  showToast('Dose marcada como perdida');
}

/* ── LGPD ── */
function aceitarLGPD() {
  setConsent();
  document.getElementById('lgpd').classList.add('hidden');
}

/* ── Start ── */
document.addEventListener('DOMContentLoaded', init);
