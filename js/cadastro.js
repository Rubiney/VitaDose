/* VitaDose — Cadastro de Paciente e Medicamentos */

let pacienteAtual  = null;
let medHorarios    = [];
let _editandoMedId = null;

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

  // Horário input
  document.getElementById('btn-add-horario').addEventListener('click', adicionarHorario);
  document.getElementById('input-horario').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); adicionarHorario(); }
  });

  // Calcular limiar automático ao mudar intervalo ou qtdCaixa
  document.getElementById('f-qtd-caixa').addEventListener('input', calcLimiar);
  document.getElementById('f-intervalo').addEventListener('change', calcLimiar);
}

/* ── Preencher form paciente ── */
function preencherFormPaciente(p) {
  document.getElementById('f-nome').value    = p.nome    || '';
  document.getElementById('f-perfil').value  = p.perfil  || 'adulto';
  document.getElementById('f-cuidador').value = p.cuidador || '';
}

/* ── Salvar paciente ── */
async function salvarPaciente() {
  const nome     = document.getElementById('f-nome').value.trim();
  const perfil   = document.getElementById('f-perfil').value;
  const cuidador = document.getElementById('f-cuidador').value.trim();

  if (!nome) { showToast('⚠ Informe o nome do paciente'); return; }

  if (pacienteAtual) {
    pacienteAtual = { ...pacienteAtual, nome, perfil, cuidador };
    await dbPut('pacientes', pacienteAtual);
  } else {
    const id = await dbAdd('pacientes', { nome, perfil, cuidador, criadoEm: new Date().toISOString() });
    pacienteAtual = await dbGet('pacientes', id);
    setActivePacienteId(id);
    document.getElementById('sec-meds').classList.remove('hidden');
  }

  showToast('✓ Paciente salvo');
}

/* ── Horários builder ── */
function adicionarHorario() {
  const input = document.getElementById('input-horario');
  const val   = input.value.trim();
  if (!val || !/^\d{2}:\d{2}$/.test(val)) { showToast('⚠ Use o formato HH:MM'); return; }
  if (medHorarios.includes(val))            { showToast('Horário já adicionado'); return; }
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

  document.getElementById('f-med-nome').value  = m.nome       || '';
  document.getElementById('f-indicacao').value = m.indicacao  || '';
  document.getElementById('f-forma').value     = m.forma      || 'comprimido';
  document.getElementById('f-dose').value      = m.dose       || '';
  document.getElementById('f-unidade').value   = m.unidade    || 'mg';
  document.getElementById('f-intervalo').value = m.intervalo  || 24;
  document.getElementById('f-qtd-caixa').value = m.qtdCaixa   ?? '';
  document.getElementById('f-qtd-atual').value = m.qtdAtual   ?? '';
  document.getElementById('f-limiar').value    = m.limiarAlerta || '';
  document.getElementById('f-duracao').value   = m.duracaoDias  || '';

  medHorarios = [...(m.horarios || [])];
  renderHorarioTags();

  document.getElementById('btn-salvar-med').textContent  = '✓ Salvar Alterações';
  document.getElementById('btn-cancelar-ed').style.display = '';

  // Scroll até o formulário
  document.getElementById('f-med-nome').scrollIntoView({ behavior: 'smooth', block: 'center' });
  showToast('Editando: ' + m.nome);
}

function cancelarEdicao() {
  _editandoMedId = null;
  limparFormMed();
}

/* ── Salvar medicamento ── */
async function salvarMedicamento() {
  if (!pacienteAtual) { showToast('⚠ Salve o paciente primeiro'); return; }

  const nome        = document.getElementById('f-med-nome').value.trim();
  const indicacao   = document.getElementById('f-indicacao').value.trim();
  const forma       = document.getElementById('f-forma').value;
  const dose        = document.getElementById('f-dose').value.trim();
  const unidade     = document.getElementById('f-unidade').value;
  const intervalo   = parseInt(document.getElementById('f-intervalo').value) || 24;
  const qtdCaixa    = parseInt(document.getElementById('f-qtd-caixa').value) || 0;
  const qtdAtual    = parseInt(document.getElementById('f-qtd-atual').value) || 0;
  const limiar      = parseInt(document.getElementById('f-limiar').value)    || 0;
  const duracaoDias = parseInt(document.getElementById('f-duracao').value)   || 0;

  if (!nome)               { showToast('⚠ Informe o nome do medicamento'); return; }
  if (!medHorarios.length) { showToast('⚠ Adicione pelo menos um horário'); return; }

  if (_editandoMedId) {
    // ── Modo edição: preserva id, pacienteId, criadoEm e dataInicio original
    const original = await dbGet('medicamentos', _editandoMedId);
    const dataInicio = original.dataInicio || hoje();
    const dataFim    = duracaoDias ? calcDataFim(dataInicio, duracaoDias) : null;

    await dbPut('medicamentos', {
      ...original,
      nome, indicacao, forma, dose, unidade,
      intervalo, horarios: [...medHorarios],
      qtdCaixa, qtdAtual, limiarAlerta: limiar,
      duracaoDias: duracaoDias || null,
      dataInicio:  duracaoDias ? dataInicio : original.dataInicio,
      dataFim,
    });

    limparFormMed();
    await renderMedList();
    showToast('✓ Medicamento atualizado');
  } else {
    // ── Modo adição
    const dataInicio = hoje();
    const dataFim    = duracaoDias ? calcDataFim(dataInicio, duracaoDias) : null;

    await dbAdd('medicamentos', {
      pacienteId: pacienteAtual.id,
      nome, indicacao, forma, dose, unidade,
      intervalo, horarios: [...medHorarios],
      qtdCaixa, qtdAtual, limiarAlerta: limiar,
      duracaoDias: duracaoDias || null,
      dataInicio:  duracaoDias ? dataInicio : null,
      dataFim,
      ativo: true, criadoEm: new Date().toISOString(),
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
  document.getElementById('f-unidade').value   = 'mg';
  document.getElementById('f-intervalo').value = '24';
  medHorarios    = [];
  _editandoMedId = null;
  renderHorarioTags();
  document.getElementById('limiar-hint').textContent  = '';
  document.getElementById('duracao-hint').textContent = 'Sem duração = medicamento de uso contínuo';
  document.getElementById('btn-salvar-med').textContent       = 'Adicionar Medicamento';
  document.getElementById('btn-cancelar-ed').style.display    = 'none';
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

  el.innerHTML = meds.map(m => `
    <div class="med-list-item">
      <div class="med-list-dot"></div>
      <div class="med-list-info">
        <p class="med-list-name">${m.nome} — ${m.dose}${m.unidade}</p>
        <p class="med-list-detail">${(m.horarios||[]).join(' · ')} · Estoque: ${m.qtdAtual}/${m.qtdCaixa}${m.duracaoDias ? ` · ${m.duracaoDias}d` : ''}</p>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button class="btn btn-sm" style="background:var(--blue-bg);color:var(--blue);border:1px solid rgba(25,80,185,.15)" onclick="editarMed(${m.id})">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="removerMed(${m.id})">Remover</button>
      </div>
    </div>`).join('');
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
