/* VitaDose — Cadastro de Paciente e Medicamentos */

let pacienteAtual  = null;
let medHorarios    = [];
let _editandoMedId = null;
let _fotoBase64     = null;
let _fotoCaixaB64   = null;
let _fotoReceitaB64 = null;
let isManipulado   = false;
let isNebulizacao  = false;

/* ── Fotos do medicamento ── */
function _processarFotoMed(file, maxPx, quadrado, callback) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      const canvas = document.createElement('canvas');
      if (quadrado) {
        const s = Math.min(w, h, maxPx);
        canvas.width = s; canvas.height = s;
        const ox = (w - Math.min(w,h)) / 2, oy = (h - Math.min(w,h)) / 2;
        canvas.getContext('2d').drawImage(img, ox, oy, Math.min(w,h), Math.min(w,h), 0, 0, s, s);
      } else {
        const r = Math.min(1, maxPx / Math.max(w, h));
        w = Math.round(w*r); h = Math.round(h*r);
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      }
      callback(canvas.toDataURL('image/jpeg', quadrado ? 0.70 : 0.75));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function _setFotoMedPreview(elId, inputId, b64, emoji) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (b64) {
    el.innerHTML = `
      <img src="${b64}" style="width:100%;height:100%;object-fit:cover">
      <button class="foto-med-del" onclick="event.stopPropagation();_removerFotoMed('${elId}','${inputId}','${emoji}')">×</button>`;
    el.onclick = () => abrirLightbox(b64);
  } else {
    el.innerHTML = `<span style="font-size:1.6rem">${emoji}</span><span style="font-size:.65rem;color:var(--text-2)">Toque para fotografar</span>`;
    el.onclick = () => document.getElementById(inputId).click();
  }
}

function _removerFotoMed(elId, inputId, emoji) {
  if (elId === 'foto-caixa-preview')   _fotoCaixaB64   = null;
  else                                  _fotoReceitaB64 = null;
  _setFotoMedPreview(elId, inputId, null, emoji);
  document.getElementById(inputId).value = '';
}

function handleFotoCaixa(input) {
  _processarFotoMed(input.files[0], 400, true, b64 => {
    _fotoCaixaB64 = b64;
    _setFotoMedPreview('foto-caixa-preview', 'input-foto-caixa', b64, '📦');
  });
}

function handleFotoReceita(input) {
  _processarFotoMed(input.files[0], 1200, false, b64 => {
    _fotoReceitaB64 = b64;
    _setFotoMedPreview('foto-receita-preview', 'input-foto-receita', b64, '📄');
  });
}

/* ── Init ── */
async function init() {
  const pid = getActivePacienteId();
  if (pid) {
    pacienteAtual = await dbGet('pacientes', pid);
  }

  if (pacienteAtual) {
    preencherFormPaciente(pacienteAtual);
    document.getElementById('sec-meds').classList.remove('hidden');
    await renderMedList();
  }

  // Fotos med — estado inicial (vazio → abre câmera)
  _setFotoMedPreview('foto-caixa-preview',   'input-foto-caixa',   null, '📦');
  _setFotoMedPreview('foto-receita-preview', 'input-foto-receita', null, '📄');

  // Horário input
  document.getElementById('btn-add-horario').addEventListener('click', adicionarHorario);
  document.getElementById('input-horario').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); adicionarHorario(); }
  });

  // Calcular limiar automático ao mudar intervalo ou qtdCaixa
  document.getElementById('f-qtd-caixa').addEventListener('input', calcLimiar);
  document.getElementById('f-intervalo').addEventListener('change', calcLimiar);
}

/* ── Foto do paciente ── */
function handleFotoUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 150; canvas.height = 150;
      const ctx = canvas.getContext('2d');
      const size = Math.min(img.width, img.height);
      const ox = (img.width  - size) / 2;
      const oy = (img.height - size) / 2;
      ctx.drawImage(img, ox, oy, size, size, 0, 0, 150, 150);
      _fotoBase64 = canvas.toDataURL('image/jpeg', 0.75);
      _mostrarFotoPreview(_fotoBase64);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function _mostrarFotoPreview(src) {
  const imgEl  = document.getElementById('foto-img');
  const iconEl = document.getElementById('foto-icon');
  if (src) {
    imgEl.src = src;
    imgEl.style.display = 'block';
    iconEl.style.display = 'none';
  } else {
    imgEl.style.display = 'none';
    iconEl.style.display = '';
  }
}

/* ── Preencher form paciente ── */
function preencherFormPaciente(p) {
  document.getElementById('f-nome').value     = p.nome     || '';
  document.getElementById('f-perfil').value   = p.perfil   || 'adulto';
  document.getElementById('f-cuidador').value = p.cuidador || '';
  _mostrarFotoPreview(p.foto || null);
}

/* ── Salvar paciente ── */
async function salvarPaciente() {
  const nome     = document.getElementById('f-nome').value.trim();
  const perfil   = document.getElementById('f-perfil').value;
  const cuidador = document.getElementById('f-cuidador').value.trim();

  if (!nome) { showToast('⚠ Informe o nome do paciente'); return; }

  const foto = _fotoBase64 || pacienteAtual?.foto || null;

  if (pacienteAtual) {
    pacienteAtual = { ...pacienteAtual, nome, perfil, cuidador, foto };
    await dbPut('pacientes', pacienteAtual);
  } else {
    const id = await dbAdd('pacientes', { nome, perfil, cuidador, foto, criadoEm: new Date().toISOString() });
    pacienteAtual = await dbGet('pacientes', id);
    setActivePacienteId(id);
    document.getElementById('sec-meds').classList.remove('hidden');
  }

  showToast('✓ Paciente salvo');
}

/* ── Horários builder ── */
function toggleHorarioPreset(h) {
  if (medHorarios.includes(h)) {
    medHorarios = medHorarios.filter(x => x !== h);
  } else {
    medHorarios.push(h);
    medHorarios.sort();
  }
  renderHorarioTags();
}

function adicionarHorario() {
  const input = document.getElementById('input-horario');
  const val   = input.value.trim();
  if (!val || !/^\d{2}:\d{2}$/.test(val)) { showToast('⚠ Use o formato HH:MM'); return; }
  if (medHorarios.includes(val))           { showToast('Horário já adicionado'); return; }
  medHorarios.push(val);
  medHorarios.sort();
  input.value = '';
  renderHorarioTags();
}

function removerHorario(h) {
  medHorarios = medHorarios.filter(x => x !== h);
  renderHorarioTags();
}

function renderHorarioTags() {
  const wrap = document.getElementById('horario-tags');
  wrap.innerHTML = medHorarios.map(h =>
    `<span class="h-tag">${h}<button type="button" onclick="removerHorario('${h}')">×</button></span>`
  ).join('');
  document.querySelectorAll('.h-preset').forEach(btn => {
    btn.classList.toggle('ativo', medHorarios.includes(btn.textContent.trim()));
  });
  calcEstoque();
}

/* ── Calcular limiar automático ── */
function calcLimiar() {
  const duracao = parseInt(document.getElementById('f-duracao').value) || 0;
  if (duracao) return; // tratamento com prazo — limiar não se aplica
  const caixa     = parseInt(document.getElementById('f-qtd-caixa').value) || 0;
  const intervalo = parseInt(document.getElementById('f-intervalo').value) || 24;
  const dosesPerDia = 24 / intervalo;
  const diasAntecedencia = 3;
  const limiar = Math.ceil(dosesPerDia * diasAntecedencia);
  document.getElementById('f-limiar').value = limiar || '';
  document.getElementById('limiar-hint').textContent =
    limiar ? `Auto: ${limiar} un. = ${diasAntecedencia} dias de antecedência` : '';
}

/* ── Calcular estoque necessário (tratamentos com duração) ── */
function calcEstoque() {
  const duracao = parseInt(document.getElementById('f-duracao').value) || 0;
  const hint    = document.getElementById('duracao-hint');
  const qtdInput = document.getElementById('f-qtd-atual');
  if (!duracao) {
    hint.textContent = 'Sem duração = medicamento de uso contínuo';
    return;
  }
  const dosesPorDia = medHorarios.length;
  if (dosesPorDia) {
    const total = duracao * dosesPorDia;
    hint.textContent = `${dosesPorDia} dose/dia × ${duracao} dias = ${total} unidades necessárias`;
    if (qtdInput.value === '') qtdInput.value = total;
  } else {
    hint.textContent = `Tratamento de ${duracao} dias`;
  }
}

/* ── Editar medicamento ── */
async function editarMed(id) {
  const m = await dbGet('medicamentos', id);
  if (!m) return;

  _editandoMedId = id;

  if (m.nebulizacao && m.componentes?.length) {
    // ── modo nebulização
    if (!isNebulizacao) toggleNebulizacao();
    const apelido = m.nome.startsWith('Nebulização: ') ? '' : m.nome;
    document.getElementById('f-nebul-apelido').value      = apelido;
    document.getElementById('f-nebul-diluente').value     = m.diluente?.nome   || 'Soro Fisiológico 0,9%';
    document.getElementById('f-nebul-diluente-vol').value = m.diluente?.volume || '';
    const rowsN = document.querySelectorAll('#sec-nebulizacao .nebul-row');
    m.componentes.forEach((comp, i) => {
      if (!rowsN[i]) return;
      rowsN[i].querySelector('.nebul-nome').value    = comp.nome;
      rowsN[i].querySelector('.nebul-dose').value    = comp.dose;
      rowsN[i].querySelector('.nebul-unidade').value = comp.unidade || 'mL';
    });
  } else if (m.manipulado && m.componentes?.length) {
    // ── modo manipulado
    if (!isManipulado) toggleManipulado();
    const apelido = m.nome.startsWith('Manipulado: ') ? '' : m.nome;
    document.getElementById('f-manip-apelido').value = apelido;
    const rows = document.querySelectorAll('#sec-manipulado .comp-row');
    m.componentes.forEach((comp, i) => {
      if (!rows[i]) return;
      rows[i].querySelector('.comp-nome').value    = comp.nome;
      rows[i].querySelector('.comp-dose').value    = comp.dose;
      rows[i].querySelector('.comp-unidade').value = comp.unidade || 'mg';
    });
  } else {
    // ── modo simples
    if (isManipulado)  toggleManipulado();
    if (isNebulizacao) toggleNebulizacao();
    document.getElementById('f-med-nome').value  = m.nome      || '';
    document.getElementById('f-dose').value      = m.dose      || '';
    document.getElementById('f-unidade').value   = m.unidade   || 'mg';
  }

  document.getElementById('f-indicacao').value = m.indicacao  || '';
  document.getElementById('f-forma').value     = m.forma      || 'comprimido';
  document.getElementById('f-olho').value      = m.olho       || 'ao';
  document.getElementById('f-intervalo').value = m.intervalo  || 24;
  document.getElementById('f-qtd-caixa').value = m.qtdCaixa   ?? '';
  document.getElementById('f-qtd-atual').value = m.qtdAtual   ?? '';
  document.getElementById('f-limiar').value    = m.limiarAlerta || '';
  document.getElementById('f-duracao').value   = m.duracaoDias  || '';

  medHorarios = [...(m.horarios || [])];
  renderHorarioTags();

  // Restaurar fotos
  _fotoCaixaB64   = m.fotoCaixa   || null;
  _fotoReceitaB64 = m.fotoReceita || null;
  _setFotoMedPreview('foto-caixa-preview',   'input-foto-caixa',   _fotoCaixaB64,   '📦');
  _setFotoMedPreview('foto-receita-preview', 'input-foto-receita', _fotoReceitaB64, '📄');

  document.getElementById('btn-salvar-med').textContent    = '✓ Salvar Alterações';
  document.getElementById('btn-cancelar-ed').style.display = '';

  atualizarLabelEstoque();
  document.getElementById('btn-manip-toggle').scrollIntoView({ behavior: 'smooth', block: 'center' });
  showToast('Editando: ' + m.nome);
}

function cancelarEdicao() {
  _editandoMedId = null;
  limparFormMed();
}

/* ── Salvar medicamento ── */
async function salvarMedicamento() {
  if (!pacienteAtual) { showToast('⚠ Salve o paciente primeiro'); return; }

  let nome, dose, unidade, componentes = null, extras = {};

  if (isNebulizacao) {
    const rows = document.querySelectorAll('#sec-nebulizacao .nebul-row');
    componentes = [];
    rows.forEach(row => {
      const n = row.querySelector('.nebul-nome').value.trim();
      const d = row.querySelector('.nebul-dose').value.trim();
      const u = row.querySelector('.nebul-unidade').value;
      if (n) componentes.push({ nome: n, dose: d, unidade: u });
    });
    if (!componentes.length) { showToast('⚠ Informe pelo menos 1 medicamento inalatório'); return; }
    const apelido  = document.getElementById('f-nebul-apelido').value.trim();
    const diluente = {
      nome:   document.getElementById('f-nebul-diluente').value.trim(),
      volume: document.getElementById('f-nebul-diluente-vol').value.trim()
    };
    nome    = apelido || 'Nebulização: ' + componentes.map(c => c.nome).join(' + ');
    dose    = '1';
    unidade = 'sessão';
    extras  = { nebulizacao: true, diluente, componentes };
  } else if (isManipulado) {
    // coleta componentes
    const rows = document.querySelectorAll('#sec-manipulado .comp-row');
    componentes = [];
    rows.forEach(row => {
      const n = row.querySelector('.comp-nome').value.trim();
      const d = row.querySelector('.comp-dose').value.trim();
      const u = row.querySelector('.comp-unidade').value;
      if (n) componentes.push({ nome: n, dose: d, unidade: u });
    });
    if (!componentes.length) { showToast('⚠ Informe pelo menos 1 princípio ativo'); return; }
    const apelido = document.getElementById('f-manip-apelido').value.trim();
    nome    = apelido || 'Manipulado: ' + componentes.map(c => c.nome).join(' + ');
    dose    = '1';
    unidade = 'cáp.';
    extras  = { manipulado: true, componentes };
  } else {
    nome    = document.getElementById('f-med-nome').value.trim();
    dose    = document.getElementById('f-dose').value.trim();
    unidade = document.getElementById('f-unidade').value;
    if (!nome) { showToast('⚠ Informe o nome do medicamento'); return; }
  }

  const indicacao   = document.getElementById('f-indicacao').value.trim();
  const forma       = isNebulizacao ? 'inalacao' : isManipulado ? 'capsula' : document.getElementById('f-forma').value;
  const olho        = forma === 'colirio' ? (document.getElementById('f-olho')?.value || 'ao') : null;
  const intervalo   = parseInt(document.getElementById('f-intervalo').value) || 24;
  const qtdCaixa    = parseInt(document.getElementById('f-qtd-caixa').value) || 0;
  const qtdAtual    = parseInt(document.getElementById('f-qtd-atual').value) || 0;
  const limiar      = parseInt(document.getElementById('f-limiar').value)    || 0;
  const duracaoDias = parseInt(document.getElementById('f-duracao').value)   || 0;

  if (!medHorarios.length) { showToast('⚠ Adicione pelo menos um horário'); return; }


  if (_editandoMedId) {
    const original   = await dbGet('medicamentos', _editandoMedId);
    const dataInicio = original.dataInicio || hoje();
    const dataFim    = duracaoDias ? calcDataFim(dataInicio, duracaoDias) : null;

    await dbPut('medicamentos', {
      ...original,
      nome, indicacao, forma, dose, unidade, olho,
      intervalo, horarios: [...medHorarios],
      qtdCaixa, qtdAtual, limiarAlerta: limiar,
      duracaoDias: duracaoDias || null,
      dataInicio:  duracaoDias ? dataInicio : original.dataInicio,
      dataFim,
      fotoCaixa:   _fotoCaixaB64,
      fotoReceita: _fotoReceitaB64,
      ...extras,
    });

    limparFormMed();
    await renderMedList();
    showToast('✓ Medicamento atualizado');
  } else {
    const dataInicio = hoje();
    const dataFim    = duracaoDias ? calcDataFim(dataInicio, duracaoDias) : null;

    await dbAdd('medicamentos', {
      pacienteId: pacienteAtual.id,
      nome, indicacao, forma, dose, unidade, olho,
      intervalo, horarios: [...medHorarios],
      qtdCaixa, qtdAtual, limiarAlerta: limiar,
      duracaoDias: duracaoDias || null,
      dataInicio:  duracaoDias ? dataInicio : null,
      dataFim, ativo: true,
      criadoEm: new Date().toISOString(),
      fotoCaixa:   _fotoCaixaB64,
      fotoReceita: _fotoReceitaB64,
      ...extras,
    });

    limparFormMed();
    await renderMedList();
    showToast('✓ Medicamento adicionado');
  }

  document.getElementById('sec-meds').scrollIntoView({ behavior: 'smooth' });
}

function limparFormMed() {
  ['f-med-nome','f-indicacao','f-dose','f-qtd-caixa','f-qtd-atual','f-limiar','f-duracao'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('f-forma').value     = 'comprimido';
  document.getElementById('f-olho').value      = 'ao';
  document.getElementById('f-unidade').value   = 'mg';
  document.getElementById('f-intervalo').value = '24';
  medHorarios     = [];
  _editandoMedId  = null;
  _fotoCaixaB64   = null;
  _fotoReceitaB64 = null;
  _setFotoMedPreview('foto-caixa-preview',   'input-foto-caixa',   null, '📦');
  _setFotoMedPreview('foto-receita-preview', 'input-foto-receita', null, '📄');
  renderHorarioTags();
  document.getElementById('limiar-hint').textContent  = '';
  document.getElementById('duracao-hint').textContent = 'Sem duração = medicamento de uso contínuo';
  document.getElementById('btn-salvar-med').textContent    = 'Adicionar Medicamento';
  document.getElementById('btn-cancelar-ed').style.display = 'none';
  if (isManipulado)  toggleManipulado();
  if (isNebulizacao) toggleNebulizacao();
  _limparCompRows();
  _limparNebulRows();
  atualizarLabelEstoque();
}

/* ── Listar medicamentos cadastrados ── */
async function renderMedList() {
  if (!pacienteAtual) return;
  const meds = await dbGetByIndex('medicamentos', 'pacienteId', pacienteAtual.id);
  const el   = document.getElementById('med-list-cadastro');

  if (!meds.length) {
    el.innerHTML = '<p class="text-sm text-2" style="padding:8px 0">Nenhum medicamento ainda.</p>';
    return;
  }

  el.innerHTML = meds.map(m => {
    const nomeDisplay = m.nebulizacao
      ? `${m.nome} <span class="nebul-badge">Nebulização</span>`
      : m.manipulado
        ? `${m.nome} <span class="manip-badge">Manipulado</span>`
        : `${m.nome} — ${m.dose}${m.unidade}`;
    const detalheComp = (m.nebulizacao || m.manipulado) && m.componentes?.length
      ? m.componentes.map(c => `${c.nome} ${c.dose}${c.unidade}`).join(' · ')
      : '';
    return `
    <div class="med-list-item">
      <div class="med-list-dot"></div>
      <div class="med-list-info">
        <p class="med-list-name">${nomeDisplay}</p>
        ${detalheComp ? `<p class="med-list-detail" style="font-size:.72rem">${detalheComp}</p>` : ''}
        <p class="med-list-detail">${(m.horarios||[]).join(' · ')} · Estoque: ${m.qtdAtual}/${m.qtdCaixa}${m.duracaoDias ? ` · ${m.duracaoDias}d` : ''}</p>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button class="btn btn-sm" style="background:var(--blue-bg);color:var(--blue);border:1px solid rgba(25,80,185,.15)" onclick="editarMed(${m.id})">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="removerMed(${m.id})">Remover</button>
      </div>
    </div>`;
  }).join('');
}

async function removerMed(id) {
  if (!confirm('Remover este medicamento?')) return;
  await dbDelete('medicamentos', id);
  await renderMedList();
  showToast('Medicamento removido');
}

/* ── Ir para home ── */
function irParaHome() {
  if (!pacienteAtual) { showToast('⚠ Salve o paciente e adicione medicamentos primeiro'); return; }
  window.location.href = 'index.html';
}

/* ── Restaurar backup direto da tela de cadastro ── */
async function handleRestauracao(input) {
  if (!input.files[0]) return;
  try {
    await importarBackup(input.files[0]);
    showToast('✓ Backup restaurado — redirecionando...');
    setTimeout(() => window.location.href = 'index.html', 1500);
  } catch(e) {
    showToast('⚠ Arquivo inválido ou corrompido');
  }
}

/* ── Backup ── */
async function fazerBackup() {
  await exportarBackup();
  showToast('✓ Backup exportado');
}

async function handleImport(input) {
  const file = input.files[0];
  if (!file) return;
  try {
    await importarBackup(file);
    showToast('✓ Backup restaurado — recarregando...');
    setTimeout(() => window.location.reload(), 1200);
  } catch(e) {
    showToast('⚠ Arquivo inválido');
  }
}

/* ── Labels de estoque por forma farmacêutica ── */
const _ESTOQUE_LABELS = {
  comprimido: { caixa: 'Comprimidos na caixa',    atual: 'Estoque atual'      },
  capsula:    { caixa: 'Cápsulas na embalagem',   atual: 'Estoque atual'      },
  xarope:     { caixa: 'Doses por frasco',         atual: 'Doses restantes'    },
  solucao:    { caixa: 'Doses por frasco',         atual: 'Doses restantes'    },
  suspensao:  { caixa: 'Doses por frasco',         atual: 'Doses restantes'    },
  gotas:      { caixa: 'Doses por frasco',         atual: 'Doses restantes'    },
  colirio:    { caixa: 'Gotas no frasco',          atual: 'Gotas restantes'    },
  inalacao:   { caixa: 'Sessões por frascos',      atual: 'Sessões restantes'  },
  injetavel:  { caixa: 'Ampolas / frascos',        atual: 'Estoque atual'      },
  adesivo:    { caixa: 'Adesivos na embalagem',    atual: 'Estoque atual'      },
  creme:      { caixa: 'Tubos / embalagens',       atual: 'Estoque atual'      },
  outro:      { caixa: 'Unidades na embalagem',    atual: 'Estoque atual'      },
};

function atualizarLabelEstoque() {
  if (isManipulado || isNebulizacao) return;
  const forma  = document.getElementById('f-forma')?.value || 'comprimido';
  const labels = _ESTOQUE_LABELS[forma] || _ESTOQUE_LABELS.comprimido;
  const lblCaixa = document.getElementById('lbl-qtd-caixa');
  const lblAtual = document.getElementById('lbl-qtd-atual');
  if (lblCaixa) lblCaixa.textContent = labels.caixa;
  if (lblAtual) lblAtual.textContent = labels.atual;
  const secColirio = document.getElementById('sec-colirio');
  if (secColirio) secColirio.style.display = forma === 'colirio' ? '' : 'none';
}

/* ── Toggle manipulado / simples ── */
function toggleManipulado() {
  isManipulado = !isManipulado;
  if (isManipulado && isNebulizacao) {
    isNebulizacao = false;
    document.getElementById('btn-nebul-toggle').classList.remove('ativo');
    document.getElementById('sec-nebulizacao').style.display = 'none';
  }
  document.getElementById('btn-manip-toggle').classList.toggle('ativo', isManipulado);
  document.getElementById('sec-med-normal').style.display = isManipulado ? 'none' : '';
  document.getElementById('sec-manipulado').style.display = isManipulado ? 'block' : 'none';
  const lblCaixa = document.getElementById('lbl-qtd-caixa');
  const lblAtual = document.getElementById('lbl-qtd-atual');
  if (isManipulado) {
    if (lblCaixa) lblCaixa.textContent = 'Cápsulas na embalagem';
    if (lblAtual) lblAtual.textContent = 'Estoque atual';
  } else {
    atualizarLabelEstoque();
  }
}

function toggleNebulizacao() {
  isNebulizacao = !isNebulizacao;
  if (isNebulizacao && isManipulado) {
    isManipulado = false;
    document.getElementById('btn-manip-toggle').classList.remove('ativo');
    document.getElementById('sec-manipulado').style.display = 'none';
  }
  document.getElementById('btn-nebul-toggle').classList.toggle('ativo', isNebulizacao);
  document.getElementById('sec-med-normal').style.display = isNebulizacao ? 'none' : '';
  document.getElementById('sec-nebulizacao').style.display = isNebulizacao ? 'block' : 'none';
  const lblCaixa = document.getElementById('lbl-qtd-caixa');
  const lblAtual = document.getElementById('lbl-qtd-atual');
  if (isNebulizacao) {
    if (lblCaixa) lblCaixa.textContent = 'Sessões por frascos';
    if (lblAtual) lblAtual.textContent = 'Sessões restantes';
  } else {
    atualizarLabelEstoque();
  }
}

function _limparCompRows() {
  document.querySelectorAll('#sec-manipulado .comp-row').forEach(row => {
    row.querySelector('.comp-nome').value    = '';
    row.querySelector('.comp-dose').value    = '';
    row.querySelector('.comp-unidade').value = 'mg';
  });
  document.getElementById('f-manip-apelido').value = '';
}

function _limparNebulRows() {
  document.querySelectorAll('#sec-nebulizacao .nebul-row').forEach(row => {
    row.querySelector('.nebul-nome').value    = '';
    row.querySelector('.nebul-dose').value    = '';
    row.querySelector('.nebul-unidade').value = 'mL';
  });
  document.getElementById('f-nebul-apelido').value      = '';
  document.getElementById('f-nebul-diluente').value     = 'Soro Fisiológico 0,9%';
  document.getElementById('f-nebul-diluente-vol').value = '';
}

/* ── Toggle campos avançados ── */
function toggleAvancado() {
  const sec = document.getElementById('sec-avancado');
  const btn = document.getElementById('btn-avancado');
  const aberto = sec.style.display !== 'none';
  sec.style.display = aberto ? 'none' : 'block';
  btn.textContent   = (aberto ? '▸' : '▾') + ' Configurações avançadas';
}

/* ── Start ── */
document.addEventListener('DOMContentLoaded', init);
