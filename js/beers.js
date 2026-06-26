/* VitaDose — Critérios de Beers (AGS 2023)
   Referência: American Geriatrics Society Beers Criteria® Update 2023
   Aplica-se a pacientes com perfil "idoso" (≥ 60 anos)
   Risco: 'alto' | 'moderado' | 'cautela'
*/

const _BEERS = {

  /* ── Antidepressivos Tricíclicos ── */
  'amitriptilina': {
    categoria: 'Antidepressivo tricíclico',
    risco: 'alto',
    motivo: 'Anticolinérgico potente: sedação, hipotensão ortostática, retenção urinária, constipação, confusão mental e risco elevado de quedas.',
    alternativa: 'ISRS: Sertralina 25–50 mg/dia ou Escitalopram 5–10 mg/dia',
  },
  'nortriptilina': {
    categoria: 'Antidepressivo tricíclico',
    risco: 'alto',
    motivo: 'Menos anticolinérgico que amitriptilina, mas ainda com risco de hipotensão ortostática, sedação e quedas.',
    alternativa: 'ISRS: Sertralina ou Escitalopram em baixas doses',
  },
  'imipramina': {
    categoria: 'Antidepressivo tricíclico',
    risco: 'alto',
    motivo: 'Anticolinérgico potente; risco de arritmia (alargamento QT), hipotensão ortostática e confusão mental.',
    alternativa: 'ISRS: Sertralina ou Escitalopram',
  },
  'clomipramina': {
    categoria: 'Antidepressivo tricíclico',
    risco: 'alto',
    motivo: 'Potente efeito anticolinérgico e sedativo; risco de confusão, retenção urinária e hipotensão em idosos.',
    alternativa: 'ISRS com menor perfil anticolinérgico',
  },

  /* ── Benzodiazepínicos ── */
  'diazepam': {
    categoria: 'Benzodiazepínico (longa ação)',
    risco: 'alto',
    motivo: 'Meia-vida muito longa em idosos (até 200h); acúmulo com sedação excessiva, ataxia, quedas, fraturas e comprometimento cognitivo.',
    alternativa: 'Tratar causa base; se necessário: Lorazepam em dose mínima e prazo curtíssimo',
  },
  'clonazepam': {
    categoria: 'Benzodiazepínico',
    risco: 'alto',
    motivo: 'Sedação excessiva, ataxia e risco elevado de quedas. Dependência e síndrome de abstinência com uso crônico.',
    alternativa: 'Revisar indicação; ISRS para ansiedade; Terapia Cognitivo-Comportamental para insônia',
  },
  'alprazolam': {
    categoria: 'Benzodiazepínico',
    risco: 'alto',
    motivo: 'Alta potência; risco de sedação, quedas e comprometimento cognitivo; síndrome de abstinência intensa.',
    alternativa: 'ISRS/IRSN para transtornos de ansiedade generalizada',
  },
  'bromazepam': {
    categoria: 'Benzodiazepínico',
    risco: 'alto',
    motivo: 'Sedação, ataxia e quedas; efeito prolongado em idosos por redução do metabolismo hepático.',
    alternativa: 'Tratar causa base; retirada gradual se uso crônico',
  },
  'lorazepam': {
    categoria: 'Benzodiazepínico (curta ação)',
    risco: 'alto',
    motivo: 'Mesmo os BZD de curta ação aumentam risco de sedação e quedas em idosos. Uso pode ser aceitável em situações específicas e muito curto prazo.',
    alternativa: 'Indicação criteriosa; usar dose mínima efetiva ≤ 7 dias',
  },
  'nitrazepam': {
    categoria: 'Benzodiazepínico',
    risco: 'alto',
    motivo: 'Meia-vida longa; acúmulo em idosos com sedação diurna, quedas e piora cognitiva.',
    alternativa: 'Higiene do sono; Melatonina 0,5–3 mg; revisar hipnóticos Z',
  },
  'midazolam': {
    categoria: 'Benzodiazepínico (curta ação)',
    risco: 'alto',
    motivo: 'Uso oral/bucal em idosos associado a sedação profunda e paradoxal, risco de queda e depressão respiratória.',
    alternativa: 'Evitar uso domiciliar rotineiro',
  },

  /* ── Hipnóticos não benzodiazepínicos (drogas Z) ── */
  'zolpidem': {
    categoria: 'Hipnótico Z',
    risco: 'alto',
    motivo: 'Risco de sonambulismo, comportamentos complexos do sono, quedas noturnas, delirium e comprometimento cognitivo. FDA recomenda dose de 5 mg em mulheres idosas.',
    alternativa: 'Higiene do sono; Melatonina 0,5–3 mg; CBT-I (Terapia Cognitivo-Comportamental para insônia)',
  },
  'zopiclona': {
    categoria: 'Hipnótico Z',
    risco: 'alto',
    motivo: 'Perfil de risco similar ao Zolpidem: sedação residual matinal, quedas, piora cognitiva.',
    alternativa: 'Higiene do sono; Melatonina; revisar causa da insônia',
  },

  /* ── Anti-histamínicos de 1ª geração ── */
  'difenidramina': {
    categoria: 'Anti-histamínico 1ª geração',
    risco: 'alto',
    motivo: 'Anticolinérgico forte: confusão mental aguda, retenção urinária, constipação, sedação e risco de delirium. Presente em muitos compostos de gripe e indutores do sono.',
    alternativa: 'Anti-histamínico de 2ª geração: Loratadina, Cetirizina (com cautela) ou Fexofenadina',
  },
  'clorfeniramina': {
    categoria: 'Anti-histamínico 1ª geração',
    risco: 'alto',
    motivo: 'Sedação, efeito anticolinérgico e risco de confusão em idosos. Muito presente em xaropes e compostos antigripais.',
    alternativa: 'Loratadina 10 mg ou Fexofenadina 120 mg (sem efeito anticolinérgico)',
  },
  'prometazina': {
    categoria: 'Anti-histamínico / Antieméticos 1ª geração',
    risco: 'alto',
    motivo: 'Alto risco de sedação excessiva, hipotensão ortostática, efeito anticolinérgico e risco extrapiramidal. Contraindicada como antiemético rotineiro em idosos.',
    alternativa: 'Ondansetrona 4–8 mg para náuseas; Dimenidrinato com cautela',
  },
  'hidroxizina': {
    categoria: 'Anti-histamínico / Ansiolítico',
    risco: 'moderado',
    motivo: 'Efeito anticolinérgico relevante; sedação; risco de prolongamento de QT. Uso prolongado associado a piora cognitiva.',
    alternativa: 'ISRS para ansiedade; Buspirona para ansiedade generalizada',
  },

  /* ── Antipsicóticos ── */
  'haloperidol': {
    categoria: 'Antipsicótico típico',
    risco: 'moderado',
    motivo: 'Risco de efeitos extrapiramidais (parkinsonismo, discinesia tardia), sedação e hipotensão. Em pacientes com demência: aumento de mortalidade.',
    alternativa: 'Tratar causa base do comportamento; uso somente em situações de risco imediato e menor dose possível',
  },
  'clorpromazina': {
    categoria: 'Antipsicótico típico',
    risco: 'alto',
    motivo: 'Forte efeito anticolinérgico e sedativo; hipotensão ortostática grave; risco de arritmia (QT longo) e parkinsonismo.',
    alternativa: 'Evitar; se necessário antipsicótico: Risperidona em dose muito baixa com vigilância',
  },
  'quetiapina': {
    categoria: 'Antipsicótico atípico',
    risco: 'moderado',
    motivo: 'Em pacientes com demência: risco aumentado de AVC e mortalidade. Sedação e hipotensão ortostática frequentes.',
    alternativa: 'Abordagens não farmacológicas para demência; uso somente em psicose grave refratária',
  },
  'risperidona': {
    categoria: 'Antipsicótico atípico',
    risco: 'moderado',
    motivo: 'Em demência: risco de AVC aumentado. Síndrome metabólica e parkinsonismo em idosos.',
    alternativa: 'Abordagens não farmacológicas; uso criterioso e revisão frequente',
  },

  /* ── Sulfoniluréias ── */
  'glibenclamida': {
    categoria: 'Sulfonilureia (longa ação)',
    risco: 'alto',
    motivo: 'Meia-vida longa com metabólitos ativos; hipoglicemia grave e prolongada em idosos, especialmente com IRC ou dieta irregular. Incluída nos Critérios de Beers.',
    alternativa: 'Glipizida (curta ação) em dose baixa; Sitagliptina; Metformina (se TFG ≥ 45)',
  },
  'glipizida': {
    categoria: 'Sulfonilureia (curta ação)',
    risco: 'cautela',
    motivo: 'Menor risco que Glibenclamida, mas ainda com potencial de hipoglicemia em idosos frágeis ou com dieta irregular.',
    alternativa: 'iDPP-4 (Sitagliptina) têm menor risco de hipoglicemia',
  },

  /* ── Anticolinérgicos urinários ── */
  'oxibutinina': {
    categoria: 'Anticolinérgico / Bexiga hiperativa',
    risco: 'alto',
    motivo: 'Potente anticolinérgico que atravessa a barreira hematoencefálica: confusão mental, delirium e piora cognitiva em idosos.',
    alternativa: 'Treinamento vesical; Solifenacina (menor SNC) ou Mirabegrona (sem anticolinérgico)',
  },
  'tolterodina': {
    categoria: 'Anticolinérgico / Bexiga hiperativa',
    risco: 'moderado',
    motivo: 'Efeito anticolinérgico em SNC menor que oxibutinina, mas ainda com risco de piora cognitiva em idosos com demência.',
    alternativa: 'Mirabegrona 25–50 mg (agonista beta-3, sem efeito anticolinérgico)',
  },

  /* ── Relaxantes musculares ── */
  'ciclobenzaprina': {
    categoria: 'Relaxante muscular',
    risco: 'alto',
    motivo: 'Estrutura semelhante aos tricíclicos: forte efeito anticolinérgico, sedação, ataxia e risco de quedas. Pouca evidência de eficácia em idosos.',
    alternativa: 'Fisioterapia; analgesia adequada sem relaxante muscular',
  },
  'carisoprodol': {
    categoria: 'Relaxante muscular',
    risco: 'alto',
    motivo: 'Sedação excessiva, potencial de dependência e risco de quedas. Metabolizado em meprobamato, que tem efeito ansiolítico com risco de abuso.',
    alternativa: 'Evitar; analgesia não opioide + fisioterapia',
  },
  'metaxalona': {
    categoria: 'Relaxante muscular',
    risco: 'alto',
    motivo: 'Sedação e risco de quedas; pouca evidência de benefício em idosos.',
    alternativa: 'Fisioterapia ativa; analgesia multimodal sem relaxante muscular',
  },

  /* ── Opioides ── */
  'meperidina': {
    categoria: 'Opioide',
    risco: 'alto',
    motivo: 'Metabólito ativo (normeperidina) acumula-se em idosos e IRC causando convulsões, delirium e excitação paradoxal do SNC. Não deve ser usado em idosos.',
    alternativa: 'Morfina em dose baixa ou Tramadol (com cautela) para dor moderada a grave',
  },
  'tramadol': {
    categoria: 'Opioide / Analgésico atípico',
    risco: 'moderado',
    motivo: 'Risco de hipoglicemia (especialmente com sulfonilureias), síndrome serotoninérgica, rebaixamento do limiar convulsivo e quedas. Ajuste de dose na IRC.',
    alternativa: 'Paracetamol regular para dor leve-moderada; morfina com cautela para dor grave',
  },

  /* ── AINEs crônicos ── */
  'ibuprofeno': {
    categoria: 'AINE',
    risco: 'alto',
    motivo: 'Uso crônico em idosos: risco elevado de sangramento GI, úlcera péptica, retenção hídrica, hipertensão e piora de função renal e cardíaca.',
    alternativa: 'Paracetamol para dor leve-moderada; se AINE necessário: uso tópico (gel diclofenaco) ou mínima dose oral + Omeprazol',
  },
  'naproxeno': {
    categoria: 'AINE',
    risco: 'alto',
    motivo: 'Meia-vida longa em idosos; mesmo risco GI e renal que outros AINEs; interação com anticoagulantes.',
    alternativa: 'Paracetamol; se necessário AINE: Ibuprofeno em dose mínima < 7 dias',
  },
  'diclofenaco': {
    categoria: 'AINE',
    risco: 'alto',
    motivo: 'Alto risco cardiovascular entre os AINEs; risco GI significativo. Uso crônico associado a IM em idosos.',
    alternativa: 'Paracetamol; gel diclofenaco tópico tem menor absorção sistêmica',
  },
  'cetoprofeno': {
    categoria: 'AINE',
    risco: 'alto',
    motivo: 'Risco GI e renal elevado; meia-vida que pode ser prolongada em idosos.',
    alternativa: 'Paracetamol ou AINE tópico de menor risco sistêmico',
  },
  'celecoxibe': {
    categoria: 'AINE Inibidor COX-2',
    risco: 'moderado',
    motivo: 'Menor risco GI que AINEs não seletivos, mas risco cardiovascular presente especialmente em idosos com DCV. Risco renal mantido.',
    alternativa: 'Paracetamol; avaliar risco-benefício individualmente',
  },

  /* ── Cardiovasculares ── */
  'nifedipina': {
    categoria: 'Bloqueador de canal de cálcio (ação rápida)',
    risco: 'alto',
    motivo: 'Formulação de liberação imediata: hipotensão aguda grave com risco de isquemia miocárdica reflexa e quedas em idosos.',
    alternativa: 'Nifedipina de liberação prolongada ou Anlodipina 2,5–5 mg',
  },
  'amiodarona': {
    categoria: 'Antiarrítmico',
    risco: 'moderado',
    motivo: 'Toxicidade pulmonar, hepática e tiroidiana acumulada com uso prolongado; múltiplas interações medicamentosas; meia-vida de meses.',
    alternativa: 'Betabloqueador ou Sotalol para controle de FA; avaliar ablação quando possível',
  },
  'metildopa': {
    categoria: 'Anti-hipertensivo de ação central',
    risco: 'alto',
    motivo: 'Hipotensão ortostática, depressão do SNC, sedação e bradicardia. Especialmente perigoso em idosos com histórico de quedas.',
    alternativa: 'Amlodipina, IECA ou BRA em baixas doses para HAS em idosos',
  },
  'clonidina': {
    categoria: 'Anti-hipertensivo de ação central',
    risco: 'moderado',
    motivo: 'Hipotensão ortostática e sedação; efeito rebote com suspensão abrupta.',
    alternativa: 'Amlodipina ou outros anti-hipertensivos de 1ª linha em idosos',
  },
  'digoxina': {
    categoria: 'Glicosídeo cardíaco',
    risco: 'moderado',
    motivo: 'Em idosos: excreção renal reduzida → acúmulo → risco de intoxicação (náusea, bradiarritmia, alteração visual). Dose > 0,125 mg/dia aumenta mortalidade. Monitorar nível sérico.',
    alternativa: 'Se FA: betabloqueador ou diltiazem para controle de FC; Digoxina apenas em IC refratária em dose ≤ 0,125 mg/dia',
  },
  'sotalol': {
    categoria: 'Antiarrítmico / Betabloqueador',
    risco: 'moderado',
    motivo: 'Prolonga QT com risco de Torsades de Pointes; excreção renal reduzida em idosos exige ajuste de dose.',
    alternativa: 'Betabloqueador sem ação antiarrítmica adicional para controle de FC',
  },

  /* ── Neurológicos / Anticonvulsivantes ── */
  'fenobarbital': {
    categoria: 'Barbitúrico / Anticonvulsivante',
    risco: 'alto',
    motivo: 'Sedação excessiva, ataxia, quedas, tolerância, dependência física e comprometimento cognitivo acentuado em idosos.',
    alternativa: 'Lamotrigina ou Levetiracetam para epilepsia em idosos (melhor perfil de tolerabilidade)',
  },
  'carbamazepina': {
    categoria: 'Anticonvulsivante / Estabilizador de humor',
    risco: 'moderado',
    motivo: 'Hiponatremia (SIADH) em idosos, ataxia, visão dupla, sedação e múltiplas interações medicamentosas (indutor enzimático).',
    alternativa: 'Lamotrigina ou Oxcarbazepina com monitoramento de sódio',
  },
  'fenitoina': {
    categoria: 'Anticonvulsivante',
    risco: 'moderado',
    motivo: 'Ataxia, nistagmo e comprometimento cognitivo; hiperplasia gengival; janela terapêutica estreita; múltiplas interações.',
    alternativa: 'Lamotrigina ou Levetiracetam em idosos',
  },

  /* ── Gastrointestinais ── */
  'metoclopramida': {
    categoria: 'Antiemético / Procinético',
    risco: 'moderado',
    motivo: 'Risco de parkinsonismo tardio e discinesia tardia irreversível com uso prolongado em idosos. Mais sensíveis que adultos jovens.',
    alternativa: 'Ondansetrona 4–8 mg para náuseas; Domperidona com menor risco de SNC para gastroparesia',
  },
  'cimetidina': {
    categoria: 'Antagonista H2',
    risco: 'moderado',
    motivo: 'Efeito anticolinérgico e inibição de enzimas hepáticas (múltiplas interações); risco de confusão mental em idosos.',
    alternativa: 'IBP (Omeprazol, Pantoprazol) para DRGE; Famotidina (menor efeito anticolinérgico que Cimetidina)',
  },
  'ranitidina': {
    categoria: 'Antagonista H2',
    risco: 'cautela',
    motivo: 'Menor risco que Cimetidina, mas ainda com possibilidade de confusão em doses altas. Retirada voluntária por contaminação por nitrosaminas (ANVISA, 2020).',
    alternativa: 'IBP: Omeprazol 20 mg ou Pantoprazol 40 mg',
  },

  /* ── Outros ── */
  'nitrofurantoina': {
    categoria: 'Antibiótico / ITU',
    risco: 'moderado',
    motivo: 'Uso crônico profilático: risco de fibrose pulmonar, toxicidade hepática e neuropatia periférica. Ineficaz se TFG < 30 mL/min (muito comum em idosos).',
    alternativa: 'Revisar necessidade de profilaxia; Fosfomicina para ITU aguda',
  },
  'teofilina': {
    categoria: 'Broncodilatador / Xantina',
    risco: 'moderado',
    motivo: 'Janela terapêutica estreita; toxicidade cardiovascular (taquicardia, arritmia) e neurológica (convulsões); múltiplas interações em idosos polimedicados.',
    alternativa: 'Beta-2 agonistas inalatórios + anticolinérgicos inalatórios (LABA/LAMA) para DPOC',
  },
  'dextropropoxifeno': {
    categoria: 'Opioide',
    risco: 'alto',
    motivo: 'Metabólito acumula em IRC e idosos causando depressão respiratória e cardiotoxicidade. Retirado do mercado em muitos países.',
    alternativa: 'Paracetamol ou Tramadol com cautela',
  },
  'prometazina': {
    categoria: 'Anti-histamínico / Fenotiazínico',
    risco: 'alto',
    motivo: 'Anticolinérgico potente + efeito sedativo forte + risco de efeitos extrapiramidais. FDA emitiu alerta especial para uso em idosos.',
    alternativa: 'Ondansetrona para náuseas; Loratadina para alergia',
  },
};

/* ── Normalização ── */
function _normBeers(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\b(comprimido|capsula|solucao|suspensao|injetavel|xarope|cloridrato|maleato|besilato|mesilato|sodico|potassico|calcico|hemihidratado)\b/g, '')
    .replace(/\b\d[\d,.]*\s*(mg|ml|mcg|g|ui|%|meg|ug)\b/g, '')
    .replace(/\s+/g, ' ').trim();
}

/* ── Busca ── */
function buscarBeers(nomeGenerico) {
  const chave = _normBeers(nomeGenerico);

  let dados = _BEERS[chave];
  if (dados) return dados;

  const palavras = chave.split(' ');
  for (const [k, v] of Object.entries(_BEERS)) {
    if (k.startsWith(palavras[0])) return v;
  }
  const primeira = palavras[0];
  for (const [k, v] of Object.entries(_BEERS)) {
    if (k.split(' ')[0] === primeira) return v;
  }
  return null;
}

/* ── Verifica se paciente é idoso ── */
function pacienteIdoso(pac) {
  if (!pac) return false;
  if (pac.perfil === 'idoso') return true;
  if (pac.idadePac && parseInt(pac.idadePac) >= 60) return true;
  return false;
}
