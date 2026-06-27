/* VitaDose — Score de Risco Farmacoterapêutico
   Integra todos os módulos clínicos em uma pontuação consolidada.
   Pode ser carregado em qualquer página; usa typeof-guards para cada dependência.
*/

const _NIVEIS_RISCO = [
  { min:  0, max: 15, nivel:'baixo',   label:'Baixo',   icone:'🟢', cor:'#16a34a', bg:'#f0fdf4', borda:'#86efac' },
  { min: 16, max: 40, nivel:'moderado',label:'Moderado',icone:'🟡', cor:'#ca8a04', bg:'#fefce8', borda:'#fde047' },
  { min: 41, max: 70, nivel:'alto',    label:'Alto',    icone:'🟠', cor:'#ea580c', bg:'#fff7ed', borda:'#fb923c' },
  { min: 71, max: Infinity, nivel:'critico',label:'Crítico',icone:'🔴',cor:'#dc2626',bg:'#fff5f5',borda:'#f87171' },
];

/* Fallback para calcularPolifarmacia (não disponível em relatorio.html) */
function _polif(meds) {
  if (typeof calcularPolifarmacia === 'function') return calcularPolifarmacia(meds);
  const n = meds.length;
  if (n < 5) return null;
  return { total: n, nivel: n >= 10 ? 'grave' : 'moderado' };
}

/**
 * Calcula o Score de Risco Farmacoterapêutico integrando todos os módulos clínicos.
 *
 * @param {Object} opts
 *   medicamentos  — array de meds ativos
 *   paciente      — objeto paciente (idadePac, condicoes, tfg…)
 *   ultimosLab    — { tipo: { valor, data } } — últimos exames
 *   tfg           — TFG numérico (opcional; sobrescreve pac.tfg)
 * @returns {Object} { pontos, nivel, label, icone, cor, bg, borda, breakdown }
 */
function calcularRiscoFarmacoterapeutico({ medicamentos, paciente, ultimosLab = {}, tfg = null }) {
  if (!medicamentos || !medicamentos.length) {
    const n = _NIVEIS_RISCO[0];
    return { pontos:0, ...n, breakdown:[] };
  }

  const breakdown  = [];
  let   totalPontos = 0;
  const tfgUsado   = tfg ?? paciente?.tfg ?? null;

  function add(categoria, icone, pontos, detalhe) {
    if (pontos <= 0) return;
    breakdown.push({ categoria, icone, pontos, detalhe });
    totalPontos += pontos;
  }

  /* ── 1. Interações Fármaco-Laboratório ─────────────────── */
  if (typeof verificarLabFarma === 'function' && ultimosLab && Object.keys(ultimosLab).length) {
    const lf   = verificarLabFarma(ultimosLab, medicamentos);
    const lfG  = lf.filter(a => a.risco === 'grave').length;
    const lfM  = lf.filter(a => a.risco === 'moderado').length;
    const pts  = lfG * 30 + lfM * 12;
    if (lf.length) {
      const partes = [];
      if (lfG) partes.push(`${lfG} grave${lfG > 1 ? 's' : ''}`);
      if (lfM) partes.push(`${lfM} moderado${lfM > 1 ? 's' : ''}`);
      add('Interações Fármaco-Lab', '🔬', pts, partes.join(', '));
    }
  }

  /* ── 2. Contraindicações por Patologia ──────────────────── */
  if (typeof verificarContraindicacoes === 'function' && paciente?.condicoes?.length) {
    const cis = verificarContraindicacoes(medicamentos, paciente.condicoes);
    const cG  = cis.filter(c => c.risco === 'grave').length;
    const cM  = cis.filter(c => c.risco === 'moderado').length;
    const pts = cG * 25 + cM * 10;
    if (cis.length) {
      const partes = [];
      if (cG) partes.push(`${cG} grave${cG > 1 ? 's' : ''}`);
      if (cM) partes.push(`${cM} moderada${cM > 1 ? 's' : ''}`);
      add('Contraindicações por Patologia', '⛔', pts, partes.join(', '));
    }
  }

  /* ── 3. Interações Medicamentosas e Alimentares ─────────── */
  if (typeof gerarAlertas === 'function') {
    const al  = gerarAlertas(medicamentos);
    const iG  = al.filter(a => a.nivel === 'grave' || a.tipo === 'interacao').length;
    const iM  = al.filter(a => a.nivel === 'moderado').length;
    const iL  = al.filter(a => a.nivel === 'leve' || a.tipo === 'alimentacao').length;
    const pts = iG * 20 + iM * 8 + iL * 2;
    if (al.length) add('Interações Medicamentosas', '⚠️', pts,
      `${al.length} alerta${al.length > 1 ? 's' : ''}`);
  }

  /* ── 4. Ajuste Renal ────────────────────────────────────── */
  if (typeof buscarAjusteRenal === 'function' && tfgUsado) {
    let rPts = 0, rCount = 0;
    for (const m of medicamentos) {
      const r = buscarAjusteRenal(m.nome, tfgUsado);
      if (!r) continue;
      rCount++;
      rPts += r.recomendacao === 'contraindicado' ? 20 : r.recomendacao === 'reduzir' ? 10 : 4;
    }
    if (rPts > 0) add('Ajuste Renal', '🫘', rPts,
      `${rCount} med${rCount > 1 ? 's' : ''} c/ restrição — TFG ${Math.round(tfgUsado)} mL/min`);
  }

  /* ── 5. Critérios de Beers (idosos) ─────────────────────── */
  if (typeof buscarBeers === 'function' && (paciente?.idadePac >= 60 || paciente?.perfil === 'idoso')) {
    let bPts = 0, bCount = 0;
    for (const m of medicamentos) {
      const b = buscarBeers(m.nome);
      if (!b) continue;
      bCount++;
      bPts += b.risco === 'alto' ? 10 : b.risco === 'moderado' ? 5 : 2;
    }
    if (bPts > 0) add('Critérios de Beers', '👴', bPts,
      `${bCount} med${bCount > 1 ? 's' : ''} potencialmente inapropriado${bCount > 1 ? 's' : ''}`);
  }

  /* ── 6. Carga Anticolinérgica (ACB) ─────────────────────── */
  if (typeof calcularCargaAnticolin === 'function') {
    const acb = calcularCargaAnticolin(medicamentos);
    if (acb && acb.total > 0) {
      const pts = acb.nivel === 'alto' ? 12 : acb.nivel === 'moderado' ? 6 : 2;
      add('Carga Anticolinérgica', '🧠', pts, `ACB ${acb.total} pt${acb.total > 1 ? 's' : ''} — ${acb.nivel}`);
    }
  }

  /* ── 7. Duplicidade Terapêutica ─────────────────────────── */
  if (typeof verificarDuplicidade === 'function') {
    const dups = verificarDuplicidade(medicamentos);
    const dG   = dups.filter(d => d.nivel === 'grave').length;
    const dM   = dups.filter(d => d.nivel !== 'grave').length;
    const pts  = dG * 15 + dM * 8;
    if (dups.length) add('Duplicidade Terapêutica', '🔵', pts,
      `${dups.length} par${dups.length > 1 ? 'es' : ''} de classe`);
  }

  /* ── 8. Polimedicação ───────────────────────────────────── */
  const polif = _polif(medicamentos);
  if (polif) {
    const pts = polif.nivel === 'grave' ? 15 : 5;
    add('Polimedicação', '💊', pts, `${polif.total} medicamentos em uso`);
  }

  /* ── 9. STOPP (medicamentos inapropriados em idosos) ───────── */
  if (typeof verificarSTOPP === 'function') {
    const stopps = verificarSTOPP(medicamentos, paciente);
    if (stopps.length) {
      const ptsGrave = stopps.filter(s => s.risco === 'grave').length;
      const ptsMod   = stopps.filter(s => s.risco !== 'grave').length;
      const pts      = ptsGrave * 15 + ptsMod * 6;
      if (pts > 0) add('STOPP/START', '🛑', pts, `${stopps.length} critério(s): ${ptsGrave} grave · ${ptsMod} mod.`);
    }
  }

  /* ── Ordenar breakdown por pontos decrescente ─────────────── */
  breakdown.sort((a, b) => b.pontos - a.pontos);

  const nivel = _NIVEIS_RISCO.find(n => totalPontos >= n.min && totalPontos <= n.max)
    ?? _NIVEIS_RISCO[_NIVEIS_RISCO.length - 1];

  return { pontos: totalPontos, ...nivel, breakdown };
}
