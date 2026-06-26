/* VitaDose — Home / Painel do Dia */

let paciente    = null;
let medicamentos = [];
let dosesHoje   = [];
let _todasDoses = [];
let _adesaoMap  = {};
let confirmPending = null;
let _fotosMap   = {};

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

  // Doses — todas para cálculo de adesão, filtradas para hoje
  const allDoses = await dbGetAll('doses');
  _todasDoses = allDoses;
  dosesHoje = allDoses.filter(d => d.data === hoje());

  renderBannerAlergia(paciente);
  renderSandboxBanner();
  await render();
  iniciarNotificacoes(medicamentos);
}

/* ── Banner Sandbox ── */
function renderSandboxBanner() {
  const wrap = document.getElementById('sandbox-banner');
  if (!wrap || !localStorage.getItem('vd_sandbox')) return;
  wrap.style.display = 'block';
  wrap.innerHTML = `
    <div style="background:#d97706;color:#fff;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;font-weight:700;font-size:.85rem">
      <span>🧪 MODO SIMULAÇÃO — dados fictícios</span>
      <button onclick="sairSandbox()" style="background:rgba(0,0,0,.25);border:none;color:#fff;padding:5px 12px;border-radius:6px;font-size:.78rem;cursor:pointer;font-weight:700">Sair</button>
    </div>`;
}

function sairSandbox() {
  const prevPid = localStorage.getItem('vd_prev_active');
  localStorage.removeItem('vd_sandbox');
  localStorage.removeItem('vd_prev_active');
  if (prevPid) setActivePacienteId(prevPid);
  else localStorage.removeItem('vd_active');
  window.location.href = 'index.html';
}

/* ── Render tudo ── */
async function render() {
  renderSummary();
  renderProgress();
  renderNextDose();
  // Pré-computa adesão para todos os medicamentos antes de renderizar os cards
  _adesaoMap = {};
  if (typeof calcularAdesao === 'function') {
    for (const med of medicamentos) {
      const ad = calcularAdesao(med, _todasDoses);
      if (ad) _adesaoMap[med.id] = ad;
    }
  }
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

  _fotosMap = {};
  el.innerHTML = medicamentos.map(med => buildMedCard(med)).join('');
}

function buildMedCard(med) {
  const horarios = med.horarios || [];
  const stripeColor = getStripeColor(med);
  const stockColor  = getStockColor(med);
  const stockPct    = getStockPct(med);
  const dias        = diasRestantes(med);
  const alertaEstoque = med.qtdAtual <= med.limiarAlerta;

  if (med.fotoCaixa)   _fotosMap[`c-${med.id}`] = med.fotoCaixa;
  if (med.fotoReceita) _fotosMap[`r-${med.id}`] = med.fotoReceita;

  const thumbHtml = med.fotoCaixa
    ? `<img class="med-thumb" src="${med.fotoCaixa}" alt="" onclick="event.stopPropagation();abrirLightbox(_fotosMap['c-${med.id}'])">`
    : '';

  const receitaHtml = med.fotoReceita
    ? `<button class="med-receita-btn" onclick="event.stopPropagation();abrirLightbox(_fotosMap['r-${med.id}'])">📄 Receita</button>`
    : '';

  const marcasHtml  = `<button class="med-receita-btn" onclick="event.stopPropagation();mostrarMarcas('${med.nome.replace(/'/g, "\\'")}')">📦 Marcas</button>`;
  const reacoesHtml = `<button class="med-receita-btn" onclick="event.stopPropagation();abrirReacoes(${med.id},'${med.nome.replace(/'/g, "\\'")}')">⚠️ Reações</button>`;

  // Badge Critérios de Beers (aparece só se paciente é idoso)
  let beersHtml = '';
  if (typeof buscarBeers === 'function' && typeof pacienteIdoso === 'function' && pacienteIdoso(paciente)) {
    const b = buscarBeers(med.nome);
    if (b) {
      const coresB = {
        alto:     { bg:'#fee2e2', txt:'#991b1b', icone:'🔴' },
        moderado: { bg:'#ffedd5', txt:'#9a3412', icone:'🟠' },
        cautela:  { bg:'#fef9c3', txt:'#854d0e', icone:'🟡' },
      };
      const cb = coresB[b.risco] || coresB.cautela;
      const nomeEsc = med.nome.replace(/'/g, "\\'");
      beersHtml = `<button class="med-receita-btn"
        style="background:${cb.bg};color:${cb.txt};border-color:${cb.txt}40"
        onclick="event.stopPropagation();abrirBeers('${nomeEsc}')">
        ${cb.icone} Beers</button>`;
    }
  }

  // Badge ajuste renal (aparece só se paciente tem TFG salvo e há alerta para este med)
  let renalHtml = '';
  if (paciente && paciente.tfg && typeof buscarAjusteRenal === 'function') {
    const aj = buscarAjusteRenal(med.nome, paciente.tfg);
    if (aj) {
      const cores = {
        contraindicado: { bg:'#fee2e2', txt:'#991b1b', icone:'🔴' },
        reduzir:        { bg:'#ffedd5', txt:'#9a3412', icone:'🟠' },
        cautela:        { bg:'#fef9c3', txt:'#854d0e', icone:'🟡' },
      };
      const c = cores[aj.nivel] || cores.cautela;
      const nomeEsc = med.nome.replace(/'/g, "\\'");
      const textoEsc = aj.texto.replace(/'/g, "\\'");
      renalHtml = `<button class="med-receita-btn"
        style="background:${c.bg};color:${c.txt};border-color:${c.txt}40"
        onclick="event.stopPropagation();abrirAjusteRenal('${nomeEsc}','${textoEsc}','${aj.nivel}')">
        ${c.icone} Renal</button>`;
    }
  }

  // Badge Carga Anticolinérgica (aparece para qualquer medicamento com score ≥ 1)
  let acbHtml = '';
  if (typeof buscarAnticolinergico === 'function') {
    const acbScore = buscarAnticolinergico(med.nome);
    if (acbScore > 0) {
      const acbCores = { 3:{ bg:'#fee2e2', txt:'#991b1b' }, 2:{ bg:'#ffedd5', txt:'#9a3412' }, 1:{ bg:'#f1f5f9', txt:'#475569' } };
      const c = acbCores[acbScore] || acbCores[1];
      const nomeEsc = med.nome.replace(/'/g, "\\'");
      acbHtml = `<button class="med-receita-btn"
        style="background:${c.bg};color:${c.txt};border-color:${c.txt}40"
        onclick="event.stopPropagation();abrirAnticolin('${nomeEsc}',${acbScore})">
        🧠 ACB:${acbScore}</button>`;
    }
  }

  // Badge Adesão Terapêutica
  let adesaoHtml = '';
  const _ad = _adesaoMap[med.id];
  if (_ad) {
    const _adCor = { alta:'#16a34a', media:'#d97706', baixa:'#dc2626' };
    const _adBg  = { alta:'#dcfce7', media:'#fef9c3', baixa:'#fee2e2' };
    const cor = _adCor[_ad.nivel], bg = _adBg[_ad.nivel];
    adesaoHtml = `<button class="med-receita-btn"
      style="background:${bg};color:${cor};border-color:${cor}40"
      onclick="event.stopPropagation();abrirAdesao(${med.id})">
      📊 ${_ad.pct}%</button>`;
  }

  // Badge Contraindicação por Patologia
  let ciHtml = '';
  if (typeof buscarContraindicacoes === 'function' && paciente?.condicoes?.length) {
    const _cis = buscarContraindicacoes(med.nome, paciente.condicoes);
    if (_cis.length) {
      const _ciGrave = _cis.some(c => c.risco === 'grave');
      const _ciBg  = _ciGrave ? '#fee2e2' : '#fff7ed';
      const _ciTxt = _ciGrave ? '#991b1b' : '#9a3412';
      const nomeEsc = med.nome.replace(/'/g, "\\'");
      ciHtml = `<button class="med-receita-btn"
        style="background:${_ciBg};color:${_ciTxt};border-color:${_ciTxt}40;font-weight:800"
        onclick="event.stopPropagation();abrirCI('${nomeEsc}')">
        ⛔ CI</button>`;
    }
  }

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
        : `${med.qtdAtual} ${getUnidadeEstoque(med)} restantes — providencie nova caixa (${dias}d)`}
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
            <div style="display:flex;align-items:flex-start;gap:9px;flex:1;min-width:0">
              ${thumbHtml}
              <div style="min-width:0">
                <p class="med-name">${med.nome}${med.nebulizacao ? ' <span style="display:inline-flex;align-items:center;background:rgba(14,116,144,.12);border:1px solid rgba(14,116,144,.3);border-radius:5px;padding:1px 7px;font-size:.65rem;font-weight:700;color:#0e7490;margin-left:5px;vertical-align:middle">Nebulização</span>' : med.manipulado ? ' <span style="display:inline-flex;align-items:center;background:rgba(201,168,76,.15);border:1px solid rgba(201,168,76,.35);border-radius:5px;padding:1px 7px;font-size:.65rem;font-weight:700;color:#7a5e10;margin-left:5px;vertical-align:middle">Manipulado</span>' : ` <span class="mono" style="font-size:.8rem;color:var(--text-2)">${med.dose}${med.unidade || ''}</span>`}</p>
                ${(med.nebulizacao || med.manipulado) && med.componentes?.length ? `<p class="med-ind" style="font-size:.72rem">${med.componentes.map(c=>`${c.nome} ${c.dose}${c.unidade}`).join(' · ')}</p>` : `<p class="med-ind">${med.indicacao || ''}</p>`}
              </div>
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
            ${receitaHtml}
            ${marcasHtml}
            ${reacoesHtml}
            ${beersHtml}
            ${renalHtml}
            ${acbHtml}
            ${adesaoHtml}
            ${ciHtml}
            ${(() => {
              const d = diasParaFim(med.dataFim);
              if (d === null) return '';
              if (d === 0) return `<span class="badge badge-red">Último dia</span>`;
              if (d <= 3)  return `<span class="badge badge-red">Termina em ${d}d</span>`;
              return `<span class="badge badge-amber">Termina em ${d}d</span>`;
            })()}
            ${med.olho ? `<span style="background:rgba(15,52,96,.1);border:1px solid rgba(15,52,96,.2);border-radius:5px;padding:2px 8px;font-size:.65rem;font-weight:700;color:var(--navy);letter-spacing:.5px">${med.olho === 'od' ? 'OD' : med.olho === 'oe' ? 'OE' : 'AO'}</span>` : ''}
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

function getUnidadeEstoque(med) {
  if (med.nebulizacao) return 'sessões';
  if (med.manipulado)  return 'cápsulas';
  const map = {
    comprimido: 'comprimidos', capsula: 'cápsulas',
    xarope: 'doses', solucao: 'doses', suspensao: 'doses', gotas: 'doses',
    colirio: 'gotas', inalacao: 'sessões', injetavel: 'ampolas',
    adesivo: 'adesivos', creme: 'unidades', outro: 'unidades',
  };
  return map[med.forma] || 'unidades';
}

/* ── Polimedicação + Risco de Queda ── */
function calcularPolifarmacia(meds) {
  const n = meds.length;
  if (n < 5) return null;

  const classeRisco = [
    { nome:'Benzodiazepínicos/Hipnóticos', termos:['diazepam','clonazepam','alprazolam','bromazepam','lorazepam','midazolam','nitrazepam','zolpidem','zopiclona','zaleplon'] },
    { nome:'Opioides',                     termos:['morfina','tramadol','codeina','oxicodona','fentanila','hidrocodona','buprenorfina','metadona','tapentadol'] },
    { nome:'Antipsicóticos',               termos:['haloperidol','quetiapina','risperidona','olanzapina','clozapina','aripiprazol','clorpromazina','ziprasidona'] },
    { nome:'Antidepressivos',              termos:['amitriptilina','nortriptilina','fluoxetina','sertralina','paroxetina','escitalopram','citalopram','venlafaxina','duloxetina','bupropiona','imipramina'] },
    { nome:'Anti-hipertensivos',           termos:['enalapril','captopril','lisinopril','ramipril','losartana','valsartana','atenolol','metoprolol','carvedilol','bisoprolol','amlodipina','nifedipina','furosemida','hidroclorotiazida','indapamida'] },
    { nome:'Anticonvulsivantes',           termos:['carbamazepina','fenitoina','fenobarbital','valproato','lamotrigina','gabapentina','pregabalina','topiramato'] },
    { nome:'Anticolinérgicos',             termos:['oxibutinina','tolterodina','solifenacina','difenidramina','clorfeniramina','prometazina','ciclobenzaprina','biperideno'] },
  ];

  const nNorm = meds.map(m => m.nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,''));
  const classesPresentes = classeRisco.filter(c =>
    c.termos.some(t => nNorm.some(n => n.includes(t)))
  );

  return { total: n, nivel: n >= 10 ? 'grave' : 'moderado', riscoQueda: classesPresentes.length >= 3, classesQueda: classesPresentes.map(c => c.nome) };
}

/* ── Alertas clínicos ── */
function renderAlertas() {
  const wrap = document.getElementById('alertas-wrap');
  const alertas = gerarAlertas(medicamentos);
  const dups    = (typeof verificarDuplicidade === 'function') ? verificarDuplicidade(medicamentos) : [];
  const polif   = calcularPolifarmacia(medicamentos);
  const acb     = (typeof calcularCargaAnticolin === 'function') ? calcularCargaAnticolin(medicamentos) : null;
  const cis     = (typeof verificarContraindicacoes === 'function' && paciente?.condicoes?.length)
    ? verificarContraindicacoes(medicamentos, paciente.condicoes) : [];

  if (!alertas.length && !dups.length && !polif && (!acb || acb.total === 0) && !cis.length) { wrap.innerHTML = ''; return; }

  const nivelCor = {
    grave:    { borda:'#ef4444', bg:'#fff5f5', icone:'🔴' },
    moderado: { borda:'#f97316', bg:'#fff7ed', icone:'🟠' },
    leve:     { borda:'#eab308', bg:'#fefce8', icone:'🟡' },
  };
  const tipoCor = {
    interacao:   { borda:'#ef4444', bg:'#fff5f5', icone:'🔴' },
    alimentacao: { borda:'#3b82f6', bg:'#eff6ff', icone:'⚠️' },
  };

  const renderAlerta = (a) => {
    const c = nivelCor[a.nivel] || tipoCor[a.tipo] || nivelCor.leve;
    return `<div class="al-card" style="border-left-color:${c.borda};background:${c.bg}">
      <span class="al-icon">${c.icone}</span>
      <div>
        <p class="al-title">${a.titulo}</p>
        <p class="al-desc">${a.desc || a.aviso || ''}</p>
      </div>
    </div>`;
  };

  const renderDup = (d) => {
    const c = nivelCor[d.nivel] || nivelCor.moderado;
    return `<div class="al-card" style="border-left-color:${c.borda};background:${c.bg}">
      <span class="al-icon">🔵</span>
      <div>
        <p class="al-title">Duplicidade: ${d.classe}</p>
        <p class="al-desc" style="margin-bottom:4px">
          <strong>Medicamentos:</strong> ${d.meds.join(' · ')}
        </p>
        <p class="al-desc">${d.aviso}</p>
      </div>
    </div>`;
  };

  let html = '<p class="sec-header">Alertas Clínicos</p><div class="alertas-sec">';

  // Contraindicações por Patologia (aparecem primeiro — podem ser graves)
  cis.forEach(ci => {
    const isGrave = ci.risco === 'grave';
    const bg = isGrave ? '#fff5f5' : '#fff7ed';
    const borda = isGrave ? '#ef4444' : '#f97316';
    html += `<div class="al-card" style="border-left-color:${borda};background:${bg}">
      <span class="al-icon">${isGrave ? '⛔' : '🟠'}</span>
      <div>
        <p class="al-title">${isGrave ? 'Contraindicação' : 'Cautela'}: ${ci.med} + ${(CONDICOES_LABELS||{})[ci.condicoes[0]] || ci.condicoes[0]}</p>
        <p class="al-desc">${ci.motivo}</p>
        <p class="al-desc" style="margin-top:4px;color:#047857;font-weight:600;font-size:.77rem">Alternativa: ${ci.alternativa}</p>
      </div>
    </div>`;
  });

  // Polimedicação + Risco de Queda
  if (polif) {
    const pCor = polif.nivel === 'grave'
      ? { bg:'#fff5f5', borda:'#ef4444', txt:'#991b1b' }
      : { bg:'#fff7ed', borda:'#f97316', txt:'#9a3412' };
    html += `<div class="al-card" style="border-left-color:${pCor.borda};background:${pCor.bg}">
      <span class="al-icon">${polif.nivel === 'grave' ? '🔴' : '🟠'}</span>
      <div>
        <p class="al-title">${polif.nivel === 'grave' ? 'Polifarmácia Grave' : 'Polimedicação'} — ${polif.total} medicamentos</p>
        <p class="al-desc">${polif.nivel === 'grave'
          ? 'Paciente com ≥ 10 medicamentos em uso simultâneo. Risco elevado de interações, baixa adesão, quedas e hospitalização. Realizar revisão completa da farmacoterapia.'
          : 'Paciente com ≥ 5 medicamentos em uso simultâneo (polimedicação). Avaliar necessidade de cada item, duplicidades e potenciais interações.'}</p>
        ${polif.riscoQueda ? `<p class="al-desc" style="margin-top:4px;color:#9a3412;font-weight:600">
          ⚠️ Risco de Queda: ${polif.classesQueda.join(' · ')}
        </p>` : ''}
      </div>
    </div>`;
  }

  // Carga Anticolinérgica total
  if (acb && acb.total > 0) {
    const aCores = {
      alto:     { bg:'#fff5f5', borda:'#ef4444', icone:'🔴', txt:'Risco cognitivo alto — revisar urgentemente' },
      moderado: { bg:'#fff7ed', borda:'#f97316', icone:'🟠', txt:'Carga moderada — considerar substituição dos itens com score ≥ 2' },
      baixo:    { bg:'#fefce8', borda:'#eab308', icone:'🟡', txt:'Carga baixa — monitorar, especialmente em idosos' },
    };
    const c = aCores[acb.nivel];
    html += `<div class="al-card" style="border-left-color:${c.borda};background:${c.bg}">
      <span class="al-icon">${c.icone}</span>
      <div>
        <p class="al-title">Carga Anticolinérgica (ACB) — Escore Total: ${acb.total}</p>
        <p class="al-desc">${c.txt}</p>
        <p class="al-desc" style="margin-top:4px;font-size:.77rem">
          ${acb.itens.map(i => `🧠 ${i.nome} (${i.score}pt · ${i.classe})`).join('<br>')}
        </p>
      </div>
    </div>`;
  }

  dups.forEach(d => { html += renderDup(d); });
  alertas.forEach(a => { html += renderAlerta(a); });
  html += '</div>';
  wrap.innerHTML = html;
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

/* ── Banner de alergias ── */
function renderBannerAlergia(pac) {
  const wrap = document.getElementById('banner-alergia');
  if (!wrap) return;
  const txt = pac && pac.alergias ? pac.alergias.trim() : '';
  if (!txt) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  wrap.innerHTML = `
    <div class="banner-alergia">
      <span class="banner-alergia-icon">🚨</span>
      <div class="banner-alergia-body">
        <p class="banner-alergia-title">Alergias registradas</p>
        <p class="banner-alergia-texto">${txt}</p>
      </div>
      <a href="perfil.html" title="Editar" style="color:#c53030;font-size:1rem;text-decoration:none;flex-shrink:0;padding:2px 4px">✏️</a>
    </div>`;
}

/* ── Reações adversas ── */
function abrirReacoes(medId, medNome) {
  const antigo = document.getElementById('vd-reacoes-popup');
  if (antigo) antigo.remove();

  const med    = medicamentos.find(m => m.id === medId);
  const lista  = buscarReacoes(medNome);
  const obsAtual = (med && med.reacoesObs) || '';

  const listaHtml = lista
    ? lista.map(r => `
        <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="color:#e53e3e;font-size:1rem;flex-shrink:0;margin-top:1px">•</span>
          <span style="font-size:.9rem;color:var(--text-1)">${r}</span>
        </div>`).join('')
    : `<p style="color:var(--text-2);font-size:.85rem;padding:8px 0">
        Não disponível na base local. Consulte a bula ou o farmacêutico.
      </p>`;

  const el = document.createElement('div');
  el.id = 'vd-reacoes-popup';
  el.innerHTML = `
    <div style="position:fixed;inset:0;z-index:400;background:rgba(15,52,96,.45);
      backdrop-filter:blur(3px);display:flex;align-items:flex-end;justify-content:center"
      onclick="document.getElementById('vd-reacoes-popup').remove()">
      <div onclick="event.stopPropagation()" style="background:var(--white);border-radius:20px 20px 0 0;
        padding:24px 20px 36px;max-width:430px;width:100%;max-height:85vh;overflow-y:auto;
        box-shadow:0 -8px 40px rgba(0,0,0,.18)">
        <p style="font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;
          color:var(--text-2);margin-bottom:4px">⚠️ Reações Adversas</p>
        <p style="font-size:1.05rem;font-weight:700;color:var(--navy);margin-bottom:16px">${medNome}</p>

        ${lista ? `<p style="font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--text-2);margin-bottom:4px">Mais comuns</p>` : ''}
        ${listaHtml}

        <div style="border-top:1px solid var(--border);margin:18px 0 14px"></div>
        <p style="font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--text-2);margin-bottom:8px">📝 Minhas observações</p>
        <p style="font-size:.78rem;color:var(--text-2);margin-bottom:10px">Anote reações que você sentiu ou observações do médico/farmacêutico.</p>
        <textarea id="vd-reacoes-obs-input"
          placeholder="Ex: Sinto tontura ao levantar nos primeiros dias..."
          style="width:100%;box-sizing:border-box;border:1.5px solid var(--border);border-radius:10px;
            padding:10px 12px;font-size:.9rem;font-family:inherit;color:var(--text-1);
            background:var(--bg);resize:vertical;min-height:90px;outline:none"
          onfocus="this.style.borderColor='var(--gold)'"
          onblur="this.style.borderColor='var(--border)'">${obsAtual}</textarea>

        <button class="btn btn-primary btn-full" style="margin-top:12px"
          onclick="salvarReacoesObs(${medId})">✓ Salvar observação</button>
        <button class="btn btn-outline btn-full" style="margin-top:8px"
          onclick="document.getElementById('vd-reacoes-popup').remove()">Fechar</button>
      </div>
    </div>`;
  document.body.appendChild(el);
}

async function salvarReacoesObs(medId) {
  const obs = document.getElementById('vd-reacoes-obs-input')?.value.trim() || '';
  const med = medicamentos.find(m => m.id === medId);
  if (!med) return;
  med.reacoesObs = obs;
  await dbPut('medicamentos', med);
  document.getElementById('vd-reacoes-popup')?.remove();
  showToast('✓ Observação salva');
}

/* ── Critérios de Beers — modal de detalhe ── */
function abrirBeers(nomeMed) {
  document.getElementById('vd-beers-popup')?.remove();
  if (typeof buscarBeers !== 'function') return;
  const b = buscarBeers(nomeMed);
  if (!b) return;

  const cores = {
    alto:     { bg:'#fee2e2', borda:'#f87171', titulo:'#991b1b', icone:'🔴', label:'ALTO RISCO — Critérios de Beers' },
    moderado: { bg:'#ffedd5', borda:'#fb923c', titulo:'#9a3412', icone:'🟠', label:'RISCO MODERADO — Critérios de Beers' },
    cautela:  { bg:'#fef9c3', borda:'#fbbf24', titulo:'#854d0e', icone:'🟡', label:'USO COM CAUTELA — Critérios de Beers' },
  };
  const c = cores[b.risco] || cores.cautela;

  const el = document.createElement('div');
  el.id    = 'vd-beers-popup';
  el.style.cssText = 'position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.5);display:flex;align-items:flex-end';
  el.innerHTML = `
    <div style="background:var(--card);border-radius:22px 22px 0 0;width:100%;padding:22px 20px 36px;max-height:85vh;overflow-y:auto">
      <p style="font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:${c.titulo};margin-bottom:4px">
        ${c.icone} ${c.label}
      </p>
      <p style="font-size:1.05rem;font-weight:800;color:var(--navy);margin-bottom:4px">${nomeMed}</p>
      <p style="font-size:.76rem;color:var(--text-2);margin-bottom:14px">${b.categoria}</p>

      <div style="background:${c.bg};border:1.5px solid ${c.borda};border-radius:12px;padding:14px 16px;margin-bottom:12px">
        <p style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:${c.titulo};margin-bottom:6px">⚠️ Por que é inapropriado em idosos?</p>
        <p style="font-size:.86rem;color:${c.titulo};line-height:1.55;margin:0">${b.motivo}</p>
      </div>

      ${b.alternativa ? `<div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:12px;padding:12px 14px;margin-bottom:14px">
        <p style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#166534;margin-bottom:4px">✅ Alternativa mais segura</p>
        <p style="font-size:.86rem;color:#166534;line-height:1.5;margin:0">${b.alternativa}</p>
      </div>` : ''}

      <p style="font-size:.7rem;color:var(--text-2);margin-bottom:14px;line-height:1.4">
        📚 Fonte: AGS Beers Criteria® 2023 · A conduta final deve ser avaliada pelo médico e farmacêutico responsáveis.
      </p>
      <button class="btn btn-primary btn-full"
        onclick="document.getElementById('vd-beers-popup').remove()">Fechar</button>
    </div>`;
  el.addEventListener('click', e => { if (e.target === el) el.remove(); });
  document.body.appendChild(el);
}

/* ── Ajuste Renal — modal de detalhe ── */
function abrirAjusteRenal(nomeMed, texto, nivel) {
  document.getElementById('vd-renal-popup')?.remove();
  const cores = {
    contraindicado: { bg:'#fee2e2', borda:'#f87171', titulo:'#991b1b', icone:'🔴', label:'CONTRAINDICADO / EVITAR' },
    reduzir:        { bg:'#ffedd5', borda:'#fb923c', titulo:'#9a3412', icone:'🟠', label:'REDUZIR DOSE' },
    cautela:        { bg:'#fef9c3', borda:'#fbbf24', titulo:'#854d0e', icone:'🟡', label:'USAR COM CAUTELA' },
  };
  const c   = cores[nivel] || cores.cautela;
  const tfg = paciente?.tfg;
  const est = tfg ? estagioRenal(tfg) : null;

  const el  = document.createElement('div');
  el.id     = 'vd-renal-popup';
  el.style.cssText = 'position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.5);display:flex;align-items:flex-end';
  el.innerHTML = `
    <div style="background:var(--card);border-radius:22px 22px 0 0;width:100%;padding:22px 20px 36px;max-height:80vh;overflow-y:auto">
      <p style="font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:${c.titulo};margin-bottom:6px">
        ${c.icone} ${c.label}
      </p>
      <p style="font-size:1.05rem;font-weight:800;color:var(--navy);margin-bottom:14px">${nomeMed}</p>
      <div style="background:${c.bg};border:1.5px solid ${c.borda};border-radius:12px;padding:14px 16px;margin-bottom:14px">
        <p style="font-size:.88rem;color:${c.titulo};font-weight:600;line-height:1.5;margin:0">${texto}</p>
      </div>
      ${est ? `<p style="font-size:.78rem;color:var(--text-2);margin-bottom:14px">
        TFG atual do paciente: <strong style="color:${est.cor}">${tfg} mL/min</strong> — Estágio ${est.estadio} (${est.descricao})
      </p>` : ''}
      <p style="font-size:.72rem;color:var(--text-2);margin-bottom:14px;line-height:1.4">
        ⚕️ Esta informação é de apoio à decisão clínica. A conduta final deve ser avaliada pelo profissional de saúde responsável.
      </p>
      <button class="btn btn-primary btn-full"
        onclick="document.getElementById('vd-renal-popup').remove()">Fechar</button>
    </div>`;
  el.addEventListener('click', e => { if (e.target === el) el.remove(); });
  document.body.appendChild(el);
}

/* ── Carga Anticolinérgica — modal de detalhe ── */
function abrirAnticolin(nomeMed, score) {
  document.getElementById('vd-acb-popup')?.remove();
  const nivel = score >= 3 ? 'alto' : score >= 2 ? 'moderado' : 'leve';
  const cores = {
    alto:     { bg:'#fff5f5', borda:'#f87171', titulo:'#991b1b', label:'RISCO ALTO (Score ' + score + '/3)' },
    moderado: { bg:'#fff7ed', borda:'#fb923c', titulo:'#9a3412', label:'RISCO MODERADO (Score ' + score + '/2)' },
    leve:     { bg:'#fefce8', borda:'#fbbf24', titulo:'#854d0e', label:'RISCO LEVE (Score 1)' },
  };
  const c = cores[nivel];

  const el  = document.createElement('div');
  el.id     = 'vd-acb-popup';
  el.style.cssText = 'position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.5);display:flex;align-items:flex-end';
  el.innerHTML = `
    <div style="background:var(--card);border-radius:22px 22px 0 0;width:100%;padding:22px 20px 36px;max-height:80vh;overflow-y:auto">
      <p style="font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:${c.titulo};margin-bottom:6px">
        🧠 CARGA ANTICOLINÉRGICA — ${c.label}
      </p>
      <p style="font-size:1.05rem;font-weight:800;color:var(--navy);margin-bottom:14px">${nomeMed}</p>
      <div style="background:${c.bg};border:1.5px solid ${c.borda};border-radius:12px;padding:14px 16px;margin-bottom:14px">
        <p style="font-size:.88rem;color:${c.titulo};font-weight:600;line-height:1.5;margin:0">
          ${score === 3 ? 'Efeito anticolinérgico definido e potente. Pode causar confusão mental, boca seca, retenção urinária, constipação, taquicardia e visão turva. Em idosos, aumenta risco de delirium e declínio cognitivo.' :
            score === 2 ? 'Efeito anticolinérgico moderado. Contribui significativamente para a carga total. Avaliar necessidade de uso e possibilidade de substituição por alternativa com menor efeito anticolinérgico.' :
            'Efeito anticolinérgico possível ou leve. Contribui para a carga total, especialmente em pacientes com múltiplos medicamentos desta categoria.'}
        </p>
      </div>
      <p style="font-size:.8rem;color:var(--text-2);line-height:1.5;margin-bottom:14px">
        <strong>Escala ACB (Anticholinergic Cognitive Burden Scale):</strong><br>
        Score 1 = possível atividade anticolinérgica<br>
        Score 2 = atividade anticolinérgica moderada<br>
        Score 3 = atividade anticolinérgica definida<br>
        <strong>Total ≥ 3 pontos = risco aumentado de disfunção cognitiva em idosos</strong>
      </p>
      <p style="font-size:.72rem;color:var(--text-2);margin-bottom:14px;line-height:1.4">
        Referência: Boustani MA et al. Anticholinergic Cognitive Burden Scale (2012). AGS Beers Criteria® 2023.
      </p>
      <button class="btn btn-primary btn-full"
        onclick="document.getElementById('vd-acb-popup').remove()">Fechar</button>
    </div>`;
  el.addEventListener('click', e => { if (e.target === el) el.remove(); });
  document.body.appendChild(el);
}

/* ── Nomes comerciais ── */
function mostrarMarcas(medNome) {
  const antigo = document.getElementById('vd-marcas-popup');
  if (antigo) antigo.remove();

  const marcas = buscarMarcas(medNome);

  const conteudo = marcas
    ? marcas.map((m, i) => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
          <span style="width:22px;height:22px;border-radius:50%;background:var(--navy);color:#fff;font-size:.7rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</span>
          <span style="font-size:.95rem;font-weight:600;color:var(--text-1)">${m}</span>
        </div>`).join('')
    : `<p style="color:var(--text-2);font-size:.85rem;text-align:center;padding:12px 0">
        Não encontrado na base local.<br>Consulte a bula ou o farmacêutico.
      </p>`;

  const el = document.createElement('div');
  el.id = 'vd-marcas-popup';
  el.innerHTML = `
    <div style="position:fixed;inset:0;z-index:400;background:rgba(15,52,96,.45);backdrop-filter:blur(3px);
      display:flex;align-items:center;justify-content:center;padding:20px"
      onclick="document.getElementById('vd-marcas-popup').remove()">
      <div onclick="event.stopPropagation()" style="background:var(--white);border-radius:18px;
        padding:24px 20px 20px;max-width:340px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,.22)">
        <p style="font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;
          color:var(--text-2);margin-bottom:4px">📦 Nomes Comerciais</p>
        <p style="font-size:1.05rem;font-weight:700;color:var(--navy);margin-bottom:2px">${medNome}</p>
        <p style="font-size:.75rem;color:var(--text-2);margin-bottom:14px">3 marcas disponíveis no Brasil</p>
        ${conteudo}
        <button class="btn btn-outline btn-full" style="margin-top:16px"
          onclick="document.getElementById('vd-marcas-popup').remove()">Fechar</button>
      </div>
    </div>`;
  document.body.appendChild(el);
}

/* ── Adesão Terapêutica — modal de detalhe ── */
function abrirAdesao(medId) {
  document.getElementById('vd-adesao-popup')?.remove();
  const med = medicamentos.find(m => m.id === medId);
  const ad  = _adesaoMap[medId];
  if (!med || !ad) return;

  const corNivel = { alta:'#16a34a', media:'#d97706', baixa:'#dc2626' };
  const bgNivel  = { alta:'#dcfce7', media:'#fef9c3', baixa:'#fee2e2' };
  const nomNivel = { alta:'ALTA ≥ 80%', media:'MÉDIA 50–79%', baixa:'BAIXA < 50%' };
  const cor = corNivel[ad.nivel], bg = bgNivel[ad.nivel];

  const el = document.createElement('div');
  el.id    = 'vd-adesao-popup';
  el.style.cssText = 'position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.5);display:flex;align-items:flex-end';
  el.innerHTML = `
    <div style="background:var(--card);border-radius:22px 22px 0 0;width:100%;padding:22px 20px 36px;max-height:80vh;overflow-y:auto">
      <p style="font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:${cor};margin-bottom:4px">
        📊 ADESÃO TERAPÊUTICA — ÚLTIMOS 30 DIAS
      </p>
      <p style="font-size:1.05rem;font-weight:800;color:var(--navy);margin-bottom:16px">${med.nome}</p>
      <div style="text-align:center;margin-bottom:14px">
        <div style="font-size:3rem;font-weight:900;color:${cor};line-height:1">${ad.pct}%</div>
        <div style="font-size:.8rem;color:var(--text-2);margin-top:4px">${ad.tomadas} de ${ad.total} doses registradas</div>
      </div>
      <div style="background:#e5e7eb;border-radius:99px;height:12px;margin-bottom:12px;overflow:hidden">
        <div style="background:${cor};width:${ad.pct}%;height:100%;border-radius:99px"></div>
      </div>
      <div style="background:${bg};border-radius:10px;padding:12px 14px;margin-bottom:14px">
        <p style="font-weight:800;color:${cor};font-size:.82rem;margin-bottom:4px">Nível de Adesão: ${nomNivel[ad.nivel]}</p>
        <p style="font-size:.8rem;color:var(--text-1);margin:0;line-height:1.5">
          ${ad.nivel === 'alta'
            ? 'Excelente! O paciente está tomando o medicamento de forma consistente. Manter o monitoramento.'
            : ad.nivel === 'media'
            ? 'Adesão parcial. Investigar barreiras: efeitos adversos, esquecimento, custo ou complexidade do esquema posológico.'
            : 'Baixa adesão — risco de falha terapêutica. Revisão urgente do esquema e estratégias de suporte motivacional.'}
        </p>
      </div>
      <p style="font-size:.7rem;color:var(--text-2);margin-bottom:14px;line-height:1.4">
        ℹ️ Baseado nos registros de confirmação de dose no app. Doses não confirmadas são contadas como não tomadas.
      </p>
      <button class="btn btn-primary btn-full"
        onclick="document.getElementById('vd-adesao-popup').remove()">Fechar</button>
    </div>`;
  el.addEventListener('click', e => { if (e.target === el) el.remove(); });
  document.body.appendChild(el);
}

/* ── Contraindicações por Patologia — modal de detalhe ── */
function abrirCI(nomeMed) {
  document.getElementById('vd-ci-popup')?.remove();
  if (typeof buscarContraindicacoes !== 'function' || !paciente?.condicoes?.length) return;

  const cis = buscarContraindicacoes(nomeMed, paciente.condicoes);
  if (!cis.length) return;

  const ciHtml = cis.map(ci => {
    const isGrave = ci.risco === 'grave';
    const bg    = isGrave ? '#fff5f5' : '#fff7ed';
    const borda = isGrave ? '#f87171' : '#fb923c';
    const cor   = isGrave ? '#991b1b' : '#9a3412';
    const cond  = (CONDICOES_LABELS || {})[ci.condicoes[0]] || ci.condicoes[0];
    return `<div style="background:${bg};border:1.5px solid ${borda};border-radius:12px;padding:14px 16px;margin-bottom:10px">
      <p style="font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:${cor};margin-bottom:4px">
        ${isGrave ? '⛔ CONTRAINDICADO' : '⚠️ CAUTELA'} — ${cond}
      </p>
      <p style="font-size:.86rem;color:${cor};font-weight:600;line-height:1.5;margin-bottom:8px">${ci.motivo}</p>
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:8px 10px">
        <p style="font-size:.78rem;color:#166534;font-weight:600;margin:0">✅ ${ci.alternativa}</p>
      </div>
    </div>`;
  }).join('');

  const el = document.createElement('div');
  el.id    = 'vd-ci-popup';
  el.style.cssText = 'position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.5);display:flex;align-items:flex-end';
  el.innerHTML = `
    <div style="background:var(--card);border-radius:22px 22px 0 0;width:100%;padding:22px 20px 36px;max-height:85vh;overflow-y:auto">
      <p style="font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#991b1b;margin-bottom:4px">
        ⛔ CONTRAINDICAÇÃO DETECTADA
      </p>
      <p style="font-size:1.05rem;font-weight:800;color:var(--navy);margin-bottom:16px">${nomeMed}</p>
      ${ciHtml}
      <p style="font-size:.72rem;color:var(--text-2);margin-bottom:14px;line-height:1.4">
        ⚕️ Informação de apoio clínico. A conduta final deve ser avaliada pelo profissional de saúde responsável.
      </p>
      <button class="btn btn-primary btn-full"
        onclick="document.getElementById('vd-ci-popup').remove()">Fechar</button>
    </div>`;
  el.addEventListener('click', e => { if (e.target === el) el.remove(); });
  document.body.appendChild(el);
}

/* ── Start ── */
document.addEventListener('DOMContentLoaded', init);
