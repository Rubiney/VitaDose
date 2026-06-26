/* VitaDose — Laboratório: dados de exames e funções puras (compartilhado) */

const EXAMES = [
  { id:'creatinina',   label:'Creatinina',      unidade:'mg/dL', ref:{ min:0.6,  max:1.2   }, casas:2, nota:'Valores de referência gerais (homens: 0,7–1,2 · mulheres: 0,5–1,0)' },
  { id:'hba1c',        label:'HbA1c',           unidade:'%',     ref:{ min:4.0,  max:5.6   }, casas:1, nota:'Alvo em DM: < 7,0% (ADA/SBD 2023)' },
  { id:'glicemia',     label:'Glicemia Jejum',  unidade:'mg/dL', ref:{ min:70,   max:99    }, casas:0, nota:'Normal < 100 · pré-DM 100–125 · DM ≥ 126' },
  { id:'inr',          label:'INR',             unidade:'',      ref:{ min:0.8,  max:1.2   }, casas:2, nota:'Anticoagulação com varfarina: alvo 2,0–3,0 (FA) · 2,5–3,5 (válvula mecânica)' },
  { id:'potassio',     label:'Potássio',        unidade:'mEq/L', ref:{ min:3.5,  max:5.0   }, casas:1, nota:'Hipo < 3,5 · Hiper > 5,5 — monitorar em IECA/BRA/Espiro' },
  { id:'sodio',        label:'Sódio',           unidade:'mEq/L', ref:{ min:136,  max:145   }, casas:0, nota:'Hipo < 136 · Hiper > 145 mEq/L' },
  { id:'colesterol',   label:'Colest. Total',   unidade:'mg/dL', ref:{ min:0,    max:200   }, casas:0, nota:'Desejável < 200 · Limítrofe 200–239 · Alto ≥ 240' },
  { id:'ldl',          label:'LDL',             unidade:'mg/dL', ref:{ min:0,    max:130   }, casas:0, nota:'Alto risco CV: < 70 · Muito alto: < 50 mg/dL (SBC 2023)' },
  { id:'hdl',          label:'HDL',             unidade:'mg/dL', ref:{ min:40,   max:9999  }, casas:0, nota:'Baixo < 40 (H) / < 50 (M) mg/dL — risco CV aumentado' },
  { id:'triglicerios', label:'Triglicerídeos',  unidade:'mg/dL', ref:{ min:0,    max:150   }, casas:0, nota:'Normal < 150 · Limítrofe 150–199 · Alto 200–499 · Muito alto ≥ 500' },
  { id:'alt',          label:'ALT (TGP)',       unidade:'U/L',   ref:{ min:0,    max:40    }, casas:0, nota:'Hepatotoxicidade: > 3× LSN com sintomas ou > 5× LSN sem sintomas' },
  { id:'ast',          label:'AST (TGO)',       unidade:'U/L',   ref:{ min:0,    max:40    }, casas:0, nota:'Elevar AST > ALT sugere hepatopatia alcoólica (razão AST/ALT > 2)' },
  { id:'tsh',          label:'TSH',             unidade:'mUI/L', ref:{ min:0.4,  max:4.0   }, casas:2, nota:'Hipotireoidismo: TSH > 4,0 · Hipertireoidismo: TSH < 0,4 mUI/L' },
  { id:'hemoglobina',  label:'Hemoglobina',     unidade:'g/dL',  ref:{ min:12,   max:17.5  }, casas:1, nota:'Anemia: H < 13 g/dL · M < 12 g/dL (OMS)' },
  { id:'ck',           label:'CK',              unidade:'U/L',   ref:{ min:0,    max:200   }, casas:0, nota:'Monitorar em uso de estatinas. Miopatia: > 10× LSN. Rabdomiólise: > 40× LSN' },
  { id:'pcr',          label:'PCR',             unidade:'mg/dL', ref:{ min:0,    max:0.5   }, casas:2, nota:'PCR-us < 1,0: baixo risco CV · PCR > 1,0: inflamação ativa' },
];

/* ── Status clínico de um valor laboratorial ──────────────────────────
   Retorna: 'normal' | 'alto' | 'baixo' | null (tipo desconhecido)
*/
function statusLab(tipo, valor) {
  const exame = EXAMES.find(e => e.id === tipo);
  if (!exame) return null;
  const { min, max } = exame.ref;
  if (valor > max && max < 9999) return 'alto';
  if (valor < min && min > 0)    return 'baixo';
  return 'normal';
}

/* ── Gráfico SVG de tendência (puro, sem DOM) ─────────────────────── */
function gerarSVG(lista, exame) {
  if (lista.length < 2) {
    return `<p style="text-align:center;color:#94a3b8;font-size:.75rem">Registre ao menos 2 valores para ver o gráfico de tendência.</p>`;
  }

  const ultimos = lista.slice(-10);
  const vals    = ultimos.map(r => r.valor);
  const ref     = exame.ref;
  const minV    = Math.min(...vals, ref.min) * 0.92;
  const maxV    = Math.max(...vals, ref.max === 9999 ? Math.max(...vals) : ref.max) * 1.08;
  const W = 260, H = 80, pX = 16, pY = 10;

  const toX = i => pX + (i / (ultimos.length - 1)) * W;
  const toY = v => pY + H - ((v - minV) / (maxV - minV || 1)) * H;

  const refY1 = toY(ref.max === 9999 ? maxV : ref.max);
  const refY2 = toY(ref.min);
  const pts   = ultimos.map((r,i) => `${toX(i).toFixed(1)},${toY(r.valor).toFixed(1)}`).join(' ');

  const dots = ultimos.map((r,i) => {
    const x   = toX(i).toFixed(1);
    const y   = toY(r.valor).toFixed(1);
    const cor = (r.valor > ref.max && ref.max < 9999) || (r.valor < ref.min && ref.min > 0)
      ? '#ef4444' : '#0f3460';
    return `<circle cx="${x}" cy="${y}" r="4" fill="${cor}"/>
      <text x="${x}" y="${(parseFloat(y)-7).toFixed(1)}" text-anchor="middle"
        fill="${cor}" font-size="9" font-weight="700">${r.valor.toFixed(exame.casas)}</text>`;
  }).join('');

  const dataTicks = ultimos.map((r,i) =>
    `<text x="${toX(i).toFixed(1)}" y="${(pY + H + 16).toFixed(1)}"
      text-anchor="middle" fill="#94a3b8" font-size="8">${r.data.slice(5)}</text>`
  ).join('');

  return `<svg viewBox="0 0 ${W+2*pX} ${H+2*pY+20}" style="width:100%;max-height:130px;display:block">
    <rect x="${pX}" y="${Math.min(refY1,refY2).toFixed(1)}"
      width="${W}" height="${Math.abs(refY2-refY1).toFixed(1)}"
      fill="#dcfce7" opacity=".5" rx="2"/>
    <polyline points="${pts}" fill="none" stroke="#0f3460" stroke-width="2" stroke-linejoin="round"/>
    ${dots}
    ${dataTicks}
  </svg>`;
}
