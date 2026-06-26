/* VitaDose — Carga Anticolinérgica (ACB Scale)
   Referência: Anticholinergic Cognitive Burden Scale (Boustani et al., 2008 / rev. 2012)
               Anticholinergic Drug Scale (Carnahan et al.) — valores consensuais
   score 1 = efeito anticolinérgico possível/leve
   score 2 = efeito moderado
   score 3 = efeito definido/alto (risco cognitivo + periférico)
*/

const _ANTICOLIN = {
  /* Score 3 — Definido, alto risco */
  'amitriptilina':   { score: 3, classe: 'Antidepressivo tricíclico' },
  'nortriptilina':   { score: 3, classe: 'Antidepressivo tricíclico' },
  'imipramina':      { score: 3, classe: 'Antidepressivo tricíclico' },
  'clomipramina':    { score: 3, classe: 'Antidepressivo tricíclico' },
  'doxepina':        { score: 3, classe: 'Antidepressivo tricíclico' },
  'difenidramina':   { score: 3, classe: 'Anti-histamínico 1ª geração' },
  'clorfeniramina':  { score: 3, classe: 'Anti-histamínico 1ª geração' },
  'prometazina':     { score: 3, classe: 'Anti-histamínico / Fenotiazínico' },
  'hidroxizina':     { score: 3, classe: 'Anti-histamínico 1ª geração' },
  'ciproeptadina':   { score: 3, classe: 'Anti-histamínico 1ª geração' },
  'meclizina':       { score: 3, classe: 'Anti-histamínico / Antiemético' },
  'dimenidrinato':   { score: 3, classe: 'Anti-histamínico / Antiemético' },
  'oxibutinina':     { score: 3, classe: 'Anticolinérgico urinário' },
  'tolterodina':     { score: 3, classe: 'Anticolinérgico urinário' },
  'solifenacina':    { score: 3, classe: 'Anticolinérgico urinário' },
  'darifenacina':    { score: 3, classe: 'Anticolinérgico urinário' },
  'fesoterodina':    { score: 3, classe: 'Anticolinérgico urinário' },
  'trospium':        { score: 3, classe: 'Anticolinérgico urinário' },
  'escopolamina':    { score: 3, classe: 'Anticolinérgico / Antiemético' },
  'hioscina':        { score: 3, classe: 'Anticolinérgico / Antiemético' },
  'atropina':        { score: 3, classe: 'Anticolinérgico sistêmico' },
  'biperideno':      { score: 3, classe: 'Anticolinérgico antiparkinsônico' },
  'triexifenidil':   { score: 3, classe: 'Anticolinérgico antiparkinsônico' },
  'prociclidina':    { score: 3, classe: 'Anticolinérgico antiparkinsônico' },
  'clorpromazina':   { score: 3, classe: 'Antipsicótico típico (potente)' },
  'tioridazina':     { score: 3, classe: 'Antipsicótico típico' },
  'trifluoperazina': { score: 3, classe: 'Antipsicótico típico' },
  'ciclobenzaprina': { score: 3, classe: 'Relaxante muscular de ação central' },
  'orfenadrina':     { score: 3, classe: 'Relaxante muscular / Anti-Parkinson' },
  'carisoprodol':    { score: 3, classe: 'Relaxante muscular' },

  /* Score 2 — Moderado */
  'clozapina':       { score: 2, classe: 'Antipsicótico atípico' },
  'olanzapina':      { score: 2, classe: 'Antipsicótico atípico' },
  'quetiapina':      { score: 2, classe: 'Antipsicótico atípico' },
  'carbamazepina':   { score: 2, classe: 'Anticonvulsivante / Estabilizador de humor' },
  'oxcarbazepina':   { score: 2, classe: 'Anticonvulsivante' },
  'meperidina':      { score: 2, classe: 'Opioide (metabólito anticolinérgico)' },

  /* Score 1 — Possível / Leve */
  'paroxetina':      { score: 1, classe: 'ISRS (maior efeito anticolinérgico da classe)' },
  'amantadina':      { score: 1, classe: 'Antiparkinsoniano / Antiviral' },
  'metoclopramida':  { score: 1, classe: 'Procinético / Antiemético' },
  'ranitidina':      { score: 1, classe: 'Antagonista H2' },
  'haloperidol':     { score: 1, classe: 'Antipsicótico típico' },
  'risperidona':     { score: 1, classe: 'Antipsicótico atípico' },
  'tramadol':        { score: 1, classe: 'Analgésico opioide' },
  'codeina':         { score: 1, classe: 'Analgésico opioide' },
  'morfina':         { score: 1, classe: 'Analgésico opioide' },
  'loratadina':      { score: 1, classe: 'Anti-histamínico 2ª geração' },
  'cetirizina':      { score: 1, classe: 'Anti-histamínico 2ª geração' },
  'nifedipina':      { score: 1, classe: 'Bloqueador de canal de cálcio' },
  'furosemida':      { score: 1, classe: 'Diurético de alça' },
  'digoxina':        { score: 1, classe: 'Glicosídeo cardíaco' },
  'prednisolona':    { score: 1, classe: 'Corticoide sistêmico' },
  'prednisona':      { score: 1, classe: 'Corticoide sistêmico' },
  'baclofeno':       { score: 1, classe: 'Relaxante muscular de ação central' },
  'hidralazina':     { score: 1, classe: 'Vasodilatador' },
};

/* ── Normalização ── */
function _normAC(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\b\d[\d,.]*\s*(mg|ml|mcg|g|ui|%)\b/gi, '')
    .replace(/\b(cloridrato|maleato|succinato|tartarato|besilato|mesilato|fumarato|fosfato|sodico|potassico|calcico)\b/gi, '')
    .replace(/\s+/g, ' ').trim();
}

/* ── Busca score de um medicamento ── */
function buscarAnticolinergico(nome) {
  const n = _normAC(nome);

  // Exato
  if (_ANTICOLIN[n]) return _ANTICOLIN[n].score;

  // Prefixo: busca pelo primeiro token significativo
  const primeiroToken = n.split(/\s+/)[0];
  for (const [chave, dados] of Object.entries(_ANTICOLIN)) {
    if (chave.startsWith(primeiroToken) && primeiroToken.length >= 5) return dados.score;
    if (n.includes(chave) && chave.length >= 5) return dados.score;
  }
  return 0;
}

/* ── Calcula carga anticolinérgica total da lista de medicamentos ── */
function calcularCargaAnticolin(medicamentos) {
  if (!medicamentos || !medicamentos.length) return { total: 0, nivel: 'baixo', itens: [] };

  const itens = [];
  let total = 0;

  for (const med of medicamentos) {
    const n = _normAC(med.nome);
    let score = 0;
    let classe = '';

    // Exato
    if (_ANTICOLIN[n]) { score = _ANTICOLIN[n].score; classe = _ANTICOLIN[n].classe; }
    else {
      const tok = n.split(/\s+/)[0];
      for (const [chave, dados] of Object.entries(_ANTICOLIN)) {
        if ((chave.startsWith(tok) || n.includes(chave)) && chave.length >= 5) {
          score = dados.score; classe = dados.classe; break;
        }
      }
    }

    if (score > 0) {
      total += score;
      itens.push({ nome: med.nome, score, classe });
    }
  }

  let nivel = 'baixo';
  if (total >= 6) nivel = 'alto';
  else if (total >= 3) nivel = 'moderado';

  return { total, nivel, itens };
}
