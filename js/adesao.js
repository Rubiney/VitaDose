/* VitaDose — Adesão Terapêutica (função pura) */

/**
 * Calcula a adesão de um medicamento nos últimos `dias` dias.
 * Dose confirmada no IDB = tomada; ausência no IDB = não tomada.
 *
 * @param {object} med    — medicamento com { id, horarios:[] }
 * @param {Array}  doses  — todas as entradas do store 'doses'
 * @param {number} dias   — janela de análise (padrão 30)
 * @returns {{ pct, tomadas, total, nivel } | null}
 *          null se dados insuficientes (< 3 doses esperadas)
 */
function calcularAdesao(med, doses, dias = 30) {
  if (!med.horarios || !med.horarios.length) return null;

  const dosesDoMed = doses.filter(d => d.medicamentoId === med.id);
  const dosesSet   = new Set(dosesDoMed.map(d => `${d.data}_${d.horario}`));

  const agora    = new Date();
  const hoje     = agora.toISOString().slice(0, 10);
  const agoraMin = agora.getHours() * 60 + agora.getMinutes();

  let total = 0, tomadas = 0;

  for (let i = dias - 1; i >= 0; i--) {
    const dia     = new Date(agora);
    dia.setDate(dia.getDate() - i);
    const dataStr = dia.toISOString().slice(0, 10);
    const eHoje   = dataStr === hoje;

    for (const h of med.horarios) {
      if (eHoje) {
        const [hh, mm] = h.split(':').map(Number);
        if (hh * 60 + mm > agoraMin) continue; // horário ainda não chegou
      }
      total++;
      if (dosesSet.has(`${dataStr}_${h}`)) tomadas++;
    }
  }

  if (total < 3) return null; // dados insuficientes

  const pct   = Math.round((tomadas / total) * 100);
  const nivel = pct >= 80 ? 'alta' : pct >= 50 ? 'media' : 'baixa';

  return { pct, tomadas, total, nivel };
}
