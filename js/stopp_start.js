/* VitaDose — Critérios STOPP/START v3 (2023)
   Referência: O'Mahony D et al. Age Ageing. 2023; STOPP/START v3.
   Aplicável a pacientes >= 65 anos.

   STOPP — Screening Tool of Older Person's Prescriptions:
     Medicamentos potencialmente inapropriados que DEVERIAM SER RETIRADOS.

   START — Screening Tool to Alert to Right Treatment:
     Medicamentos potencialmente omitidos que DEVERIAM SER INICIADOS.

   Estrutura de cada critério:
     id       — identificador único
     codigo   — código original STOPP/START (ex: A1, B3, K2)
     tipo     — 'STOPP' | 'START'
     classe   — categoria clínica
     termos   — fragmentos normalizados do nome do medicamento
     condicoes— (START) condições necessárias para disparar (array de IDs)
     titulo   — descrição curta
     motivo   — explicação do problema
     alternativa — sugestão (STOPP: substituição; START: iniciar)
     risco    — 'grave' | 'moderado'
*/

/* ── Normalização ─────────────────────────────────────────── */
function _normSS(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
}

/* ═══════════════════ STOPP ══════════════════════════════════ */
const _STOPP = [

  /* ── A. Sistema Cardiovascular ── */
  {
    id:'stopp-a1', codigo:'A1', classe:'Cardiovascular',
    termos:['digoxina'],
    titulo:'Digoxina em dose > 125 mcg/dia em idosos',
    motivo:'Risco de toxicidade digitálica aumentado: menor excreção renal, menor massa muscular e menor volume de distribuição reduzem a janela terapêutica.',
    alternativa:'Manter dose ≤ 125 mcg/dia. Monitorar nível sérico (alvo 0,5–0,9 ng/mL) e função renal.',
    risco:'moderado',
  },
  {
    id:'stopp-a2', codigo:'A2', classe:'Cardiovascular',
    termos:['amiodarona'],
    titulo:'Amiodarona como primeira linha em FA sem IC',
    motivo:'Toxicidade cumulativa significativa (pulmonar, tireoidiana, ocular, hepática, neuropática) sem vantagem de mortalidade sobre outros antiarrítmicos em idosos.',
    alternativa:'Preferir betabloqueador ou diltiazem para controle de frequência. Reservar amiodarona para casos refratários.',
    risco:'moderado',
  },
  {
    id:'stopp-a3', codigo:'A3', classe:'Cardiovascular',
    termos:['tiazida','hidroclorotiazida','indapamida','clortalidona'],
    titulo:'Tiazida em paciente com hipocalemia, hiponatremia ou hipercalcemia',
    motivo:'Tiazidas agravam distúrbios eletrolíticos pré-existentes — risco de arritmia, quedas e confusão mental.',
    alternativa:'Suspender ou substituir por loop diurético se necessário. Corrigir eletrólitos antes.',
    risco:'grave',
  },
  {
    id:'stopp-a4', codigo:'A4', classe:'Cardiovascular',
    termos:['diltiazem','verapamil'],
    titulo:'Diltiazem ou verapamil em IC com FE reduzida',
    motivo:'BCC não-diidropiridínicos têm efeito inotrópico negativo e podem agravar IC sistólica.',
    alternativa:'Suspender. Para controle de frequência em FA: preferir betabloqueador ou digoxina.',
    risco:'grave',
  },
  {
    id:'stopp-a5', codigo:'A5', classe:'Cardiovascular',
    termos:['nifedipina','amlodipina','felodipina'],
    titulo:'BCC de ação curta (nifedipina) ou em queda',
    motivo:'Nifedipina de liberação imediata causa hipotensão abrupta e taquicardia reflexa — risco de isquemia miocárdica e queda.',
    alternativa:'Substituir por formulação de ação prolongada ou outra classe anti-hipertensiva.',
    risco:'moderado',
  },
  {
    id:'stopp-a6', codigo:'A6', classe:'Cardiovascular',
    termos:['espironolactona','eplerenona'],
    titulo:'Antagonista da aldosterona + IECA ou BRA sem monitoramento de K⁺',
    motivo:'Combinação com alto risco de hipercalemia grave em idosos, especialmente com função renal comprometida.',
    alternativa:'Monitorar K⁺ sérico a cada 3–6 meses. Evitar se TFG < 30 mL/min.',
    risco:'grave',
  },

  /* ── B. Anticoagulantes / Antiagregantes ── */
  {
    id:'stopp-b1', codigo:'B1', classe:'Anticoagulação',
    termos:['aspirina','aas','acido acetilsalicilico','ácido acetilsalicílico'],
    titulo:'AAS > 100 mg/dia sem indicação cardiovascular',
    motivo:'Doses > 100 mg/dia não aumentam eficácia antiagregante e multiplicam o risco de sangramento GI, especialmente em idosos.',
    alternativa:'Limitar a 75–100 mg/dia se indicada. Reavaliar indicação periodicamente.',
    risco:'moderado',
  },
  {
    id:'stopp-b2', codigo:'B2', classe:'Anticoagulação',
    termos:['warfarina','varfarina','acenocumarol','rivaroxabana','apixabana','dabigatrana','edoxabana'],
    titulo:'Anticoagulante oral + AINE sem protetor gástrico',
    motivo:'Risco muito elevado de sangramento gastrointestinal grave com a combinação de anticoagulante oral + AINE.',
    alternativa:'Evitar a combinação. Se inevitável, associar omeprazol ou esomeprazol 20–40 mg/dia.',
    risco:'grave',
  },
  {
    id:'stopp-b3', codigo:'B3', classe:'Anticoagulação',
    termos:['clopidogrel','ticagrelor','prasugrel'],
    titulo:'Dupla antiagregação por > 12 meses pós-SCA/stent sem reavaliação',
    motivo:'Manutenção por mais de 12 meses aumenta risco de sangramento sem benefício adicional comprovado na maioria dos pacientes.',
    alternativa:'Reavaliar necessidade de dupla antiagregação. Na maioria, reduzir a monoterapia após 12 meses.',
    risco:'moderado',
  },

  /* ── C. SNC / Psicotrópicos ── */
  {
    id:'stopp-c1', codigo:'C1', classe:'SNC / Psicotrópicos',
    termos:['diazepam','clonazepam','alprazolam','bromazepam','lorazepam','nitrazepam','clobazam','midazolam'],
    titulo:'Benzodiazepínico em idoso (Critérios de Beers + STOPP)',
    motivo:'Sedação excessiva, déficit cognitivo, delírio, risco de queda e fratura de quadril. Tolerância em 4 semanas; dependência física em 8 semanas.',
    alternativa:'Desmame gradual (10–25%/semana). Para insônia: higiene do sono, melatonina, terapia cognitivo-comportamental. Para ansiedade: SSRI, buspirona.',
    risco:'grave',
  },
  {
    id:'stopp-c2', codigo:'C2', classe:'SNC / Psicotrópicos',
    termos:['zolpidem','zopiclona','zaleplon'],
    titulo:'Hipnótico Z (zolpidem, zopiclona) em uso crônico',
    motivo:'Perfil de risco semelhante ao benzodiazepínico: sedação diurna, quedas, amnésia anterógrada, tolerância rápida.',
    alternativa:'Limitar a uso agudo (máx. 4 semanas). Desmame gradual em uso crônico. Higiene do sono.',
    risco:'grave',
  },
  {
    id:'stopp-c3', codigo:'C3', classe:'SNC / Psicotrópicos',
    termos:['haloperidol','clorpromazina','levomepromazina','tioridazina'],
    titulo:'Antipsicótico típico de alta potência em idoso',
    motivo:'Alto risco de sintomas extrapiramidais, acatisia, discinesia tardia, hipotensão ortostática e pneumonia por aspiração.',
    alternativa:'Preferir antipsicóticos atípicos em doses baixas se necessário. Reavaliar indicação.',
    risco:'grave',
  },
  {
    id:'stopp-c4', codigo:'C4', classe:'SNC / Psicotrópicos',
    termos:['amitriptilina','nortriptilina','imipramina','clomipramina','doxepina'],
    titulo:'Antidepressivo tricíclico em idoso',
    motivo:'Efeitos anticolinérgicos intensos (retenção urinária, constipação, visão turva, delirium), hipotensão ortostática, arritmia e risco de queda.',
    alternativa:'Substituir por SSRI (sertralina, escitalopram) ou SNRI. Evitar paroxetina (maior efeito anticolinérgico).',
    risco:'grave',
  },
  {
    id:'stopp-c5', codigo:'C5', classe:'SNC / Psicotrópicos',
    termos:['prometazina','difenidramina','clorfeniramina','dexclorfeniramina','hidroxizina'],
    titulo:'Anti-histamínico de 1ª geração em idoso',
    motivo:'Forte efeito anticolinérgico e sedação: confusão, retenção urinária, constipação, queda. Efeitos mais pronunciados e prolongados em idosos.',
    alternativa:'Substituir por anti-histamínico de 2ª geração (loratadina, cetirizina, fexofenadina).',
    risco:'moderado',
  },

  /* ── D. Analgésicos ── */
  {
    id:'stopp-d1', codigo:'D1', classe:'Analgésicos',
    termos:['morfina','tramadol','codeina','oxicodona','fentanila','hidrocodona','tapentadol','buprenorfina'],
    titulo:'Opioide em uso sem laxante prescrito concomitante',
    motivo:'Opioides causam obstipação intestinal em praticamente 100% dos usuários. Sem profilaxia, o impacto na qualidade de vida é significativo.',
    alternativa:'Prescrever laxante osmótico ou estimulante (polietilenoglicol, lactulose, bisacodil) simultaneamente ao opioide.',
    risco:'moderado',
  },
  {
    id:'stopp-d2', codigo:'D2', classe:'Analgésicos',
    termos:['ibuprofeno','naproxeno','diclofenaco','cetoprofeno','piroxicam','meloxicam','indometacina','celecoxibe'],
    titulo:'AINE em uso crônico sem protetor gástrico em idoso',
    motivo:'Risco de úlcera, hemorragia digestiva e insuficiência renal aguda aumentado em idosos. NSAIDs são a principal causa de sangramento GI em > 65 anos.',
    alternativa:'Preferir paracetamol para analgesia. Se AINE necessário: dose mínima, duração máxima de 2 semanas, associar IBP.',
    risco:'grave',
  },
  {
    id:'stopp-d3', codigo:'D3', classe:'Analgésicos',
    termos:['ibuprofeno','naproxeno','diclofenaco','cetoprofeno','piroxicam','meloxicam','indometacina'],
    titulo:'AINE não-seletivo em paciente com TFG < 50 mL/min',
    motivo:'AINEs inibem a prostaglandina renal, reduzindo o fluxo sanguíneo renal e podendo precipitar IRA em pacientes com função renal comprometida.',
    alternativa:'Evitar completamente. Usar paracetamol para analgesia. Se necessário AINE: celecoxibe em menor dose, com monitoramento de creatinina.',
    risco:'grave',
  },
  {
    id:'stopp-d4', codigo:'D4', classe:'Analgésicos',
    termos:['gabapentina','pregabalina'],
    titulo:'Gabapentina/Pregabalina em doses acima do ajuste renal indicado',
    motivo:'Acúmulo por redução da depuração renal: sedação excessiva, tontura, quedas e encefalopatia.',
    alternativa:'Ajustar dose conforme TFG. Monitorar sedação e função cognitiva.',
    risco:'moderado',
  },

  /* ── E. Aparelho Digestivo ── */
  {
    id:'stopp-e1', codigo:'E1', classe:'Gastrointestinal',
    termos:['metoclopramida','domperidona'],
    titulo:'Pró-cinético dopaminérgico em idoso por período prolongado',
    motivo:'Metoclopramida causa sintomas extrapiramidais e discinesia tardia irreversível. Domperidona tem risco de prolongamento do QT.',
    alternativa:'Evitar uso > 5 dias. Se necessário, preferir alternativas (betanecol, eritromicina em baixas doses).',
    risco:'moderado',
  },
  {
    id:'stopp-e2', codigo:'E2', classe:'Gastrointestinal',
    termos:['omeprazol','pantoprazol','esomeprazol','lansoprazol','rabeprazol'],
    titulo:'IBP em dose plena sem indicação documentada por > 8 semanas',
    motivo:'Uso prolongado de IBP associa-se a hipomagnesemia, deficiência de vitamina B12, osteoporose e maior risco de infecções (C. difficile, pneumonia).',
    alternativa:'Reavaliação periódica da indicação. Reduzir à menor dose eficaz ou suspender se não há indicação clara.',
    risco:'moderado',
  },

  /* ── F. Sistema Musculoesquelético ── */
  {
    id:'stopp-f1', codigo:'F1', classe:'Musculoesquelético',
    termos:['colchicina'],
    titulo:'Colchicina em paciente com TFG < 30 mL/min sem ajuste',
    motivo:'A colchicina é depurada principalmente pelos rins. Acúmulo pode causar toxicidade neuromuscular (fraqueza, paralisia) e agranulocitose.',
    alternativa:'Contraindicada com TFG < 10 mL/min. Reduzir frequência com TFG 10–30 mL/min. Preferir corticoide para crises agudas de gota.',
    risco:'grave',
  },
  {
    id:'stopp-f2', codigo:'F2', classe:'Musculoesquelético',
    termos:['ciclobenzaprina','carisoprodol','metaxalona'],
    titulo:'Relaxante muscular em idoso',
    motivo:'Efeito anticolinérgico, sedação, risco aumentado de queda, tolerância e dependência. Baixa eficácia em dor musculoesquelética crônica em idosos.',
    alternativa:'Fisioterapia. Para espasticidade: baclofeno em doses baixas. Para dor: paracetamol, tópicos (diclofenaco gel).',
    risco:'moderado',
  },
  {
    id:'stopp-f3', codigo:'F3', classe:'Musculoesquelético',
    termos:['corticoide','prednisona','prednisolona','dexametasona','betametasona','metilprednisolona'],
    titulo:'Corticoide sistêmico oral em uso crônico (> 3 meses) sem prevenção de osteoporose',
    motivo:'Corticoides em uso crônico causam perda óssea acelerada e aumentam risco de fratura por fragilidade.',
    alternativa:'Associar cálcio (1000–1200 mg/dia), vitamina D (800–1000 UI/dia) e bifosfonato em uso > 3 meses.',
    risco:'moderado',
  },

  /* ── G. Sistema Endócrino ── */
  {
    id:'stopp-g1', codigo:'G1', classe:'Endócrino',
    termos:['glibenclamida','gliburida'],
    titulo:'Glibenclamida (sulfonilureia de longa ação) em idoso',
    motivo:'Metabólitos ativos e meia-vida prolongada: risco elevado de hipoglicemia grave e prolongada em idosos, especialmente com alimentação irregular.',
    alternativa:'Substituir por glipizida ou gliclazida (meia-vida mais curta) ou inibidor de DPP-4 (sitagliptina, saxagliptina).',
    risco:'grave',
  },

  /* ── H. Urológico ── */
  {
    id:'stopp-h1', codigo:'H1', classe:'Urológico',
    termos:['oxibutinina','tolterodina','solifenacina','darifenacina','trospium','fesoterodina'],
    titulo:'Antimuscarínico urinário em paciente com glaucoma, retenção urinária ou constipação grave',
    motivo:'Efeitos anticolinérgicos: pode precipitar retenção urinária aguda, agravar glaucoma de ângulo fechado e constipação intratável em idosos vulneráveis.',
    alternativa:'Avaliar indicação. Para incontinência urinária: fisioterapia pélvica, mirabegrona (agonista β3, menos anticolinérgico).',
    risco:'moderado',
  },

  /* ── I. Medicamentos com risco de queda ── */
  {
    id:'stopp-i1', codigo:'I1', classe:'Risco de Queda',
    termos:['diazepam','clonazepam','alprazolam','bromazepam','lorazepam','zolpidem','zopiclona',
            'quetiapina','olanzapina','risperidona','haloperidol','clorpromazina',
            'amitriptilina','nortriptilina','imipramina',
            'doxazosina','terazosina','prazosina'],
    titulo:'Medicamento com alto risco de queda em idoso com histórico de queda',
    motivo:'Benzodiazepínicos, hipnóticos, antipsicóticos, TCAs e alfabloqueadores têm evidência robusta de aumento de risco de queda e fratura em idosos.',
    alternativa:'Revisar indicação com atenção ao balanço risco-benefício. Programas de prevenção de quedas. Desmame gradual quando possível.',
    risco:'grave',
  },
];

/* ═══════════════════ START ══════════════════════════════════ */
const _START = [

  /* ── A. Cardiovascular ── */
  {
    id:'start-a1', codigo:'A1', classe:'Cardiovascular',
    termos:['enalapril','captopril','lisinopril','ramipril','losartana','valsartana'],
    condicoes:['insuficiencia_cardiaca','ic','icc'],
    titulo:'IECA ou BRA na IC com FE reduzida',
    motivo:'IECAs/BRAs reduzem mortalidade e hospitalizações na IC sistólica. Ausência desta classe sem contraindicação é omissão terapêutica grave.',
    alternativa:'Iniciar IECA (enalapril, lisinopril) ou BRA (losartana, valsartana) com titulação gradual.',
    risco:'grave',
    ehOmissao: true,
  },
  {
    id:'start-a2', codigo:'A2', classe:'Cardiovascular',
    termos:['bisoprolol','carvedilol','metoprolol','nebivolol'],
    condicoes:['insuficiencia_cardiaca','ic','icc'],
    titulo:'Betabloqueador na IC com FE reduzida',
    motivo:'Betabloqueadores (bisoprolol, carvedilol, metoprolol succinato) reduzem mortalidade em 30–35% na IC sistólica estável.',
    alternativa:'Iniciar bisoprolol ou carvedilol em doses baixas com titulação lenta conforme tolerância.',
    risco:'grave',
    ehOmissao: true,
  },
  {
    id:'start-a3', codigo:'A3', classe:'Cardiovascular',
    termos:['sinvastatina','atorvastatina','rosuvastatina','pravastatina','fluvastatina'],
    condicoes:['doenca_coronariana','infarto','iam','angina','aterosclerose'],
    titulo:'Estatina na doença coronariana estabelecida',
    motivo:'Estatinas reduzem eventos cardiovasculares e mortalidade em pacientes com DCV estabelecida. Omissão sem contraindicação configura subtratamento.',
    alternativa:'Iniciar atorvastatina 20–40 mg/dia ou rosuvastatina 10–20 mg/dia.',
    risco:'grave',
    ehOmissao: true,
  },
  {
    id:'start-a4', codigo:'A4', classe:'Cardiovascular',
    termos:['aspirina','aas','clopidogrel'],
    condicoes:['doenca_coronariana','infarto','iam','angina','acidente_vascular','avc','avci'],
    titulo:'Antiagregante plaquetário na DCV aterosclerótica estabelecida',
    motivo:'AAS ou clopidogrel reduzem eventos isquêmicos secundários em pacientes com DCV estabelecida.',
    alternativa:'AAS 75–100 mg/dia ou clopidogrel 75 mg/dia se intolerância ao AAS.',
    risco:'moderado',
    ehOmissao: true,
  },

  /* ── B. Respiratório ── */
  {
    id:'start-b1', codigo:'B1', classe:'Respiratório',
    termos:['tiotropio','ipratropio','formoterol','salmeterol','indacaterol'],
    condicoes:['dpoc','bpco','enfisema','bronquite_cronica'],
    titulo:'Broncodilatador de longa ação no DPOC sintomático',
    motivo:'LAMA e LABA reduzem exacerbações e melhoram qualidade de vida no DPOC. Omissão de broncodilatador em DPOC sintomático é subutratamento.',
    alternativa:'Iniciar tiotropio (LAMA) ou formoterol/salmeterol (LABA). Combinar se sintomático com monoterapia.',
    risco:'moderado',
    ehOmissao: true,
  },

  /* ── C. Musculoesquelético / Osteoporose ── */
  {
    id:'start-c1', codigo:'C1', classe:'Osteoporose',
    termos:['alendronato','risedronato','ibandronato','zoledronato','denosumabe'],
    condicoes:['osteoporose','fratura_osteoporotica','fratura_quadril','fratura_vertebral'],
    titulo:'Bifosfonato ou antirreabsortivo na osteoporose diagnosticada',
    motivo:'Bifosfonatos reduzem risco de fratura vertebral em 40–70% e de quadril em 25–40%. Omissão em osteoporose confirmada por DXA é subutratamento.',
    alternativa:'Alendronato 70 mg/semana ou zoledronato 5 mg/ano EV. Associar cálcio e vitamina D.',
    risco:'moderado',
    ehOmissao: true,
  },
  {
    id:'start-c2', codigo:'C2', classe:'Osteoporose',
    termos:['calcio','carbonato de calcio','citrato de calcio'],
    condicoes:['osteoporose','corticoide_cronico'],
    titulo:'Suplementação de cálcio e vitamina D em uso crônico de corticoide',
    motivo:'Corticoides causam perda óssea dose-dependente. Cálcio + vitamina D são essenciais para prevenção de osteoporose induzida por corticoide.',
    alternativa:'Carbonato de cálcio 500–1000 mg + vitamina D 800–1000 UI/dia. Considerar bifosfonato se uso > 3 meses.',
    risco:'moderado',
    ehOmissao: true,
  },

  /* ── D. Endócrino ── */
  {
    id:'start-d1', codigo:'D1', classe:'Endócrino',
    termos:['metformina'],
    condicoes:['diabetes_tipo2','diabetes','dm2','dm'],
    titulo:'Metformina no DM2 sem contraindicação',
    motivo:'Metformina é a primeira linha no DM2, com evidência de redução de mortalidade cardiovascular. Omissão sem contraindicação é subutratamento.',
    alternativa:'Metformina 500 mg 2×/dia com titulação gradual até 2 g/dia conforme TFG e tolerância GI.',
    risco:'moderado',
    ehOmissao: true,
  },
  {
    id:'start-d2', codigo:'D2', classe:'Endócrino',
    termos:['levotiroxina','liotironina'],
    condicoes:['hipotireoidismo'],
    titulo:'Levotiroxina no hipotireoidismo não tratado',
    motivo:'Hipotireoidismo não tratado causa: piora cognitiva, dislipidemia, ICC, depressão e fadiga crônica — todos potencialmente reversíveis com reposição hormonal.',
    alternativa:'Iniciar levotiroxina com dose baixa (25–50 mcg/dia) e titular pelo TSH.',
    risco:'moderado',
    ehOmissao: true,
  },

  /* ── E. Neurológico / Psiquiátrico ── */
  {
    id:'start-e1', codigo:'E1', classe:'Neurológico',
    termos:['donepezila','rivastigmina','galantamina'],
    condicoes:['alzheimer','demencia','demência'],
    titulo:'Inibidor de colinesterase no Alzheimer leve a moderado',
    motivo:'Inibidores de colinesterase (donepezila, rivastigmina) melhoram função cognitiva e comportamento em Alzheimer leve a moderado. Omissão é subutratamento.',
    alternativa:'Donepezila 5 mg/dia (titular para 10 mg após 4 semanas) ou rivastigmina patch 4,6 mg/24h.',
    risco:'moderado',
    ehOmissao: true,
  },

  /* ── F. Analgesia ── */
  {
    id:'start-f1', codigo:'F1', classe:'Analgesia',
    termos:['paracetamol','tramadol','morfina','codeina'],
    condicoes:['dor_moderada_grave','dor_cronica','artrite','artrose'],
    titulo:'Analgesia regular em dor moderada a grave',
    motivo:'Dor crônica não controlada compromete funcionalidade, sono, humor e qualidade de vida. A subprescrição de analgesia é comum em idosos.',
    alternativa:'Paracetamol 500–1000 mg 6/6h para dor leve. Para moderada: tramadol 50 mg 8/8h. Para grave: opioide conforme escada analgésica OMS.',
    risco:'moderado',
    ehOmissao: true,
  },
];

/* ═══ Verificação STOPP ══════════════════════════════════════ */
/**
 * @param {Array}  medicamentos — lista de meds ativos
 * @param {Object} paciente     — objeto paciente (para pegar condições e TFG)
 * @returns {Array} alertas STOPP disparados, grave primeiro
 */
function verificarSTOPP(medicamentos, paciente) {
  if (!medicamentos?.length) return [];

  const nomesNorm = medicamentos.map(m => ({
    norm: _normSS(m.generico || m.nome || ''),
    original: m.generico || m.nome || '',
  }));

  const alertas = [];
  for (const crit of _STOPP) {
    const medsTrigger = [];
    for (const { norm, original } of nomesNorm) {
      if (crit.termos.some(t => norm.includes(_normSS(t)))) {
        medsTrigger.push(original);
      }
    }
    if (!medsTrigger.length) continue;
    alertas.push({ ...crit, medsTrigger });
  }

  return alertas.sort((a, b) =>
    (a.risco === 'grave' ? 0 : 1) - (b.risco === 'grave' ? 0 : 1)
  );
}

/* ═══ Verificação START ══════════════════════════════════════ */
/**
 * Detecta medicamentos que deveriam estar prescritos mas não estão.
 * @param {Array}  medicamentos — lista de meds ativos
 * @param {Object} paciente     — objeto paciente com .condicoes[] (IDs)
 * @returns {Array} alertas START disparados
 */
function verificarSTART(medicamentos, paciente) {
  if (!paciente?.condicoes?.length) return [];

  const nomesNorm = (medicamentos || []).map(m =>
    _normSS(m.generico || m.nome || '')
  );

  const condsNorm = paciente.condicoes.map(c => _normSS(String(c)));

  const alertas = [];
  for (const crit of _START) {
    // Verifica se o paciente tem a condição clínica que dispara o critério
    const temCondicao = crit.condicoes.some(c =>
      condsNorm.some(pc => pc.includes(_normSS(c)) || _normSS(c).includes(pc))
    );
    if (!temCondicao) continue;

    // Verifica se o medicamento da classe JÁ está prescrito
    const jaTemMed = crit.termos.some(t =>
      nomesNorm.some(n => n.includes(_normSS(t)))
    );
    if (jaTemMed) continue; // medicamento já está em uso — OK

    alertas.push({ ...crit, medsTrigger: [] });
  }

  return alertas.sort((a, b) =>
    (a.risco === 'grave' ? 0 : 1) - (b.risco === 'grave' ? 0 : 1)
  );
}

/* ═══ Verificação combinada ════════════════════════════════════ */
function verificarStoppStart(medicamentos, paciente) {
  return {
    stopp:  verificarSTOPP(medicamentos, paciente),
    start:  verificarSTART(medicamentos, paciente),
  };
}
