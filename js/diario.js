'use strict';

let _dia     = new Date().toISOString().slice(0, 10);
let _regId   = null;
let _periodo = 30;
let _altura  = null;

const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

/* ── Init ── */
async function init() {
  _altura = await dbGetConfig('altura') || null;
  if (_altura) setv('f-altura', _altura);
  renderNavData();
  await carregarDia();
  await renderHistorico();
}

/* ── Navegação de data ── */
function renderNavData() {
  const hoje = new Date().toISOString().slice(0, 10);
  const [y, m, d] = _dia.split('-');
  const prefixo = _dia === hoje ? 'Hoje — ' : '';
  document.getElementById('diario-data').textContent = `${prefixo}${d} ${MESES[+m-1]}. ${y}`;
  document.getElementById('btn-prox').disabled = _dia >= hoje;
}

async function mudarDia(delta) {
  const hoje = new Date().toISOString().slice(0, 10);
  const dt = new Date(_dia + 'T12:00:00');
  dt.setDate(dt.getDate() + delta);
  const nova = dt.toISOString().slice(0, 10);
  if (nova > hoje) return;
  _dia = nova;
  renderNavData();
  await carregarDia();
}

/* ── Carregar / salvar ── */
async function carregarDia() {
  const regs = await dbGetDiario(_dia);
  const r    = regs[0] || {};
  _regId = r.id || null;
  setv('f-pa-sis',  r.paSis         || '');
  setv('f-pa-dia',  r.paDia         || '');
  setv('f-gli',     r.glicemia      || '');
  setv('f-gli-ctx', r.glicemiaCtx   || 'jejum');
  setv('f-peso',    r.peso          || '');
  atualizarBadges(r);
  calcularIMC();
}

async function salvarRegistro() {
  const paSis  = ni('f-pa-sis');
  const paDia  = ni('f-pa-dia');
  const gli    = ni('f-gli');
  const gliCtx = gv('f-gli-ctx');
  const peso   = nf('f-peso');
  const alt    = ni('f-altura');

  if (!paSis && !gli && !peso) { showToast('Preencha ao menos um campo'); return; }
  if ((paSis && !paDia) || (!paSis && paDia)) { showToast('Informe sistólica e diastólica'); return; }

  // Salva altura automaticamente se informada
  if (alt && alt >= 100 && alt <= 220) {
    _altura = alt;
    await dbSetConfig('altura', alt);
  }

  const imc = (peso && _altura)
    ? +( peso / Math.pow(_altura / 100, 2) ).toFixed(1)
    : null;

  const reg = { data: _dia, paSis, paDia, glicemia: gli, glicemiaCtx: gliCtx, peso, imc };
  if (_regId) reg.id = _regId;
  _regId = await dbSalvarDiario(reg);
  atualizarBadges(reg);
  showToast('✓ Registro salvo');
  await renderHistorico();
}

/* ── IMC ── */
function calcularIMC() {
  const peso   = nf('f-peso');
  const alt    = ni('f-altura') || _altura;
  const wrap   = document.getElementById('imc-wrap');

  if (!peso || !alt || alt < 100) { wrap.style.display = 'none'; return; }

  const imc = peso / Math.pow(alt / 100, 2);
  const { cls, lbl } = statusIMC(imc);

  document.getElementById('imc-valor').textContent = imc.toFixed(1);
  const badge = document.getElementById('imc-badge');
  badge.className   = `badge badge-${cls}`;
  badge.textContent = lbl;
  wrap.style.display = 'flex';
}

async function salvarAltura() {
  const val = ni('f-altura');
  if (val && val >= 100 && val <= 220) {
    _altura = val;
    await dbSetConfig('altura', val);
  }
  calcularIMC();
}

function statusIMC(imc) {
  if (imc < 18.5) return { cls: 'amber', lbl: 'Abaixo do peso' };
  if (imc < 25)   return { cls: 'green', lbl: 'Peso normal' };
  if (imc < 30)   return { cls: 'amber', lbl: 'Sobrepeso' };
  if (imc < 35)   return { cls: 'red',   lbl: 'Obesidade I' };
  if (imc < 40)   return { cls: 'red',   lbl: 'Obesidade II' };
  return                 { cls: 'red',   lbl: 'Obesidade III' };
}

/* ── Classificação clínica ── */
function statusPA(sis, dia) {
  if (sis > 180 || dia > 120) return { cls: 'red',   lbl: 'Crise hipertensiva' };
  if (sis >= 140 || dia >= 90) return { cls: 'red',   lbl: 'Hipertensão' };
  if (sis >= 130 || dia >= 80) return { cls: 'amber', lbl: 'Elevada' };
  if (sis >= 120)              return { cls: 'amber', lbl: 'Pré-hipertensão' };
  return                              { cls: 'green', lbl: 'Normal' };
}

function statusGli(val, ctx) {
  if (val < 70) return { cls: 'red', lbl: 'Hipoglicemia' };
  if (ctx === 'jejum' || ctx === 'deitar') {
    if (val >= 126) return { cls: 'red',   lbl: 'Hiperglicemia' };
    if (val >= 100) return { cls: 'amber', lbl: 'Pré-diabetes' };
    return                 { cls: 'green', lbl: 'Normal' };
  }
  if (val >= 200) return { cls: 'red',   lbl: 'Hiperglicemia' };
  if (val >= 140) return { cls: 'amber', lbl: 'Elevada' };
  return                 { cls: 'green', lbl: 'Normal' };
}

/* ── Badges ao vivo ── */
function atualizarBadges(r) {
  const paBadge  = document.getElementById('pa-badge');
  const gliBadge = document.getElementById('gli-badge');

  if (r.paSis && r.paDia) {
    const { cls, lbl } = statusPA(r.paSis, r.paDia);
    paBadge.className   = `badge badge-${cls}`;
    paBadge.textContent = lbl;
    paBadge.style.display = '';
  } else {
    paBadge.style.display = 'none';
  }

  if (r.glicemia) {
    const { cls, lbl } = statusGli(r.glicemia, r.glicemiaCtx || 'jejum');
    gliBadge.className   = `badge badge-${cls}`;
    gliBadge.textContent = lbl;
    gliBadge.style.display = '';
  } else {
    gliBadge.style.display = 'none';
  }
}

/* ── Histórico ── */
async function renderHistorico() {
  const hoje = new Date().toISOString().slice(0, 10);
  const dt   = new Date(hoje + 'T12:00:00');
  dt.setDate(dt.getDate() - _periodo + 1);
  const inicio = dt.toISOString().slice(0, 10);

  const regs = await dbGetDiarioRange(inicio, hoje);
  regs.sort((a, b) => b.data.localeCompare(a.data));

  const lista      = document.getElementById('hist-lista');
  const vazio      = document.getElementById('hist-vazio');
  const chartsWrap = document.getElementById('charts-wrap');

  if (!regs.length) {
    lista.innerHTML = '';
    vazio.style.display = 'block';
    chartsWrap.style.display = 'none';
    return;
  }
  vazio.style.display = 'none';

  const maxPts = Math.max(
    regs.filter(r => r.paSis).length,
    regs.filter(r => r.glicemia).length,
    regs.filter(r => r.peso).length
  );
  if (maxPts >= 3) {
    chartsWrap.style.display = 'block';
    setTimeout(() => renderCharts(regs), 60);
  } else {
    chartsWrap.style.display = 'none';
  }

  const ontem = (() => {
    const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10);
  })();

  lista.innerHTML = regs.map(r => {
    const [y, m, d] = r.data.split('-');
    const lbl = r.data === hoje ? 'Hoje' : r.data === ontem ? 'Ontem' : `${d} ${MESES[+m-1]}`;

    let paH = '';
    if (r.paSis && r.paDia) {
      const { cls } = statusPA(r.paSis, r.paDia);
      paH = `<span class="badge badge-${cls}" style="font-size:.63rem;padding:2px 7px">${r.paSis}/${r.paDia}</span>`;
    }
    let gliH = '';
    if (r.glicemia) {
      const { cls } = statusGli(r.glicemia, r.glicemiaCtx);
      const ctxLabel = { jejum: 'J', pos: 'P', deitar: 'D', outro: '' }[r.glicemiaCtx] || '';
      gliH = `<span class="badge badge-${cls}" style="font-size:.63rem;padding:2px 7px">${r.glicemia}${ctxLabel ? ' ('+ctxLabel+')' : ''}</span>`;
    }
    let pesoH = r.peso
      ? `<span class="badge badge-gray" style="font-size:.63rem;padding:2px 7px">${r.peso} kg</span>`
      : '';
    let imcH = '';
    if (r.imc) {
      const { cls } = statusIMC(r.imc);
      imcH = `<span class="badge badge-${cls}" style="font-size:.63rem;padding:2px 7px">IMC ${r.imc}</span>`;
    }

    return `<div class="diario-row">
      <span class="diario-data-lbl">${lbl}</span>
      <div class="diario-badges">${paH}${gliH}${pesoH}${imcH}</div>
    </div>`;
  }).join('');
}

/* ── Sparklines ── */
function renderCharts(regs) {
  const ord  = [...regs].sort((a, b) => a.data.localeCompare(b.data)).slice(-14);
  const paSis = ord.map(r => r.paSis    || null);
  const gli   = ord.map(r => r.glicemia || null);
  const imc   = ord.map(r => r.imc      || null);

  spark('chart-pa',   paSis, '#0F3460');
  spark('chart-gli',  gli,   '#C9A84C');
  spark('chart-imc',  imc,   '#2EB85C');

  const uPA  = [...ord].reverse().find(r => r.paSis);
  const uGli = [...ord].reverse().find(r => r.glicemia);
  const uIMC = [...ord].reverse().find(r => r.imc);
  document.getElementById('v-pa').textContent  = uPA  ? `${uPA.paSis}/${uPA.paDia}` : '—';
  document.getElementById('v-gli').textContent = uGli ? `${uGli.glicemia} mg/dL`    : '—';
  document.getElementById('v-imc').textContent = uIMC ? `${uIMC.imc}`               : '—';
}

function spark(id, dados, cor) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const W = canvas.parentElement.clientWidth - 20;
  if (W <= 0) return;
  canvas.width  = W;
  canvas.height = 52;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, 52);

  const vals = dados.filter(v => v !== null);
  if (vals.length < 2) return;

  const lo   = Math.min(...vals) * 0.95;
  const hi   = Math.max(...vals) * 1.05;
  const span = hi - lo || 1;
  const H = 52, PAD = 6;
  const px = i => (i / (dados.length - 1)) * (W - PAD * 2) + PAD;
  const py = v => H - PAD - ((v - lo) / span) * (H - PAD * 2);

  ctx.beginPath();
  let first = true, lastI = 0;
  dados.forEach((v, i) => {
    if (v === null) return;
    if (first) { ctx.moveTo(px(i), H); ctx.lineTo(px(i), py(v)); first = false; }
    else ctx.lineTo(px(i), py(v));
    lastI = i;
  });
  ctx.lineTo(px(lastI), H);
  ctx.closePath();
  ctx.fillStyle = cor + '22';
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = cor;
  ctx.lineWidth   = 2;
  ctx.lineJoin    = 'round';
  first = true;
  dados.forEach((v, i) => {
    if (v === null) return;
    if (first) { ctx.moveTo(px(i), py(v)); first = false; }
    else ctx.lineTo(px(i), py(v));
  });
  ctx.stroke();

  const lv = dados[lastI];
  ctx.beginPath(); ctx.arc(px(lastI), py(lv), 4, 0, Math.PI * 2);
  ctx.fillStyle = cor; ctx.fill();
  ctx.beginPath(); ctx.arc(px(lastI), py(lv), 2, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill();
}

/* ── Período ── */
function setPeriodo(dias, btn) {
  _periodo = dias;
  document.querySelectorAll('.periodo-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderHistorico();
}

/* ── Helpers ── */
function gv(id)      { return document.getElementById(id).value; }
function setv(id, v) { document.getElementById(id).value = v; }
function ni(id)      { return parseInt(gv(id))   || null; }
function nf(id)      { return parseFloat(gv(id)) || null; }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

document.addEventListener('DOMContentLoaded', init);
