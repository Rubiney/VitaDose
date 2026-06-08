/* VitaDose — Utilities */

function hoje() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function agoraHHMM() {
  const d = new Date();
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

function minutosTotal(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function fmtDataLonga(iso) {
  const dias  = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
  const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const d = new Date(iso + 'T12:00:00');
  return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

function iniciaisNome(nome) {
  if (!nome) return '?';
  const p = nome.trim().split(' ');
  if (p.length === 1) return p[0][0].toUpperCase();
  return (p[0][0] + p[p.length-1][0]).toUpperCase();
}

function getActivePacienteId() {
  return parseInt(localStorage.getItem('vd_active') || '0', 10);
}
function setActivePacienteId(id) {
  localStorage.setItem('vd_active', id);
}

function consentOk() {
  return localStorage.getItem('vd_consent') === '1';
}
function setConsent() {
  localStorage.setItem('vd_consent', '1');
}

let _toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

function getStockColor(med) {
  if (!med.qtdAtual || med.qtdAtual <= 0) return 'red';
  if (med.qtdAtual <= med.limiarAlerta)    return 'amber';
  return 'green';
}

function getStockPct(med) {
  if (!med.qtdCaixa) return 0;
  return Math.max(0, Math.min(100, Math.round((med.qtdAtual / med.qtdCaixa) * 100)));
}

function diasRestantes(med) {
  const dosesPerDia = (med.horarios || []).length;
  if (!dosesPerDia || !med.qtdAtual) return 0;
  return Math.floor(med.qtdAtual / dosesPerDia);
}
