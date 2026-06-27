/* VitaDose — Interações Alimento–Medicamento
   Referências: Stockley's Drug Interactions; UpToDate; Micromedex; SBCFF.
   Cada regra: termos[] (fragmentos do nome normalizado), alimento, risco, titulo, desc, conduta.
*/

const _ALIMENTO = [

  /* ══ Anticoagulantes ══════════════════════════════════════════════ */
  {
    termos: ['warfarina','varfarina','acenocumarol'],
    alimento: 'Vitamina K — folhas verdes (espinafre, couve, brócolis, alface)',
    risco: 'grave',
    titulo: 'Anticoagulante + Vitamina K',
    desc: 'Vitamina K antagoniza o efeito da warfarina reduzindo anticoagulação (risco de trombose). Variações abruptas no consumo desestabilizam o INR.',
    conduta: 'Manter ingestão constante de alimentos ricos em vitamina K — não eliminar, apenas estabilizar. Monitorar INR regularmente.',
  },
  {
    termos: ['warfarina','varfarina','acenocumarol'],
    alimento: 'Álcool etílico',
    risco: 'grave',
    titulo: 'Anticoagulante + Álcool',
    desc: 'Álcool em excesso inibe o metabolismo hepático da warfarina (aumenta anticoagulação e risco de sangramento) e pode potencializar hepatotoxicidade.',
    conduta: 'Evitar consumo de álcool. Uso ocasional moderado: monitorar INR com maior frequência.',
  },

  /* ══ Estatinas / BCC + Grapefruit ════════════════════════════════ */
  {
    termos: ['sinvastatina','lovastatina','atorvastatina','rosuvastatina'],
    alimento: 'Suco ou fruta de grapefruit (toranja)',
    risco: 'grave',
    titulo: 'Estatina + Grapefruit',
    desc: 'Grapefruit inibe a CYP3A4 intestinal, aumentando drasticamente os níveis plasmáticos de estatinas — risco de miopatia e rabdomiólise.',
    conduta: 'Evitar grapefruit e seu suco durante o uso de sinvastatina e lovastatina. Atorvastatina: cautela; rosuvastatina: risco menor (não metabolizada pela CYP3A4).',
  },
  {
    termos: ['nifedipina','felodipina','nimodipina','nisoldipina','lercanidipina'],
    alimento: 'Suco ou fruta de grapefruit (toranja)',
    risco: 'grave',
    titulo: 'Bloqueador de canal de cálcio + Grapefruit',
    desc: 'Grapefruit inibe CYP3A4 intestinal, aumentando biodisponibilidade desses BCC em até 3× — risco de hipotensão e taquicardia reflexa.',
    conduta: 'Evitar grapefruit e seu suco durante o tratamento.',
  },
  {
    termos: ['ciclosporina','tacrolimo','tacrolimus','sirolimo','everolimo'],
    alimento: 'Suco ou fruta de grapefruit (toranja)',
    risco: 'grave',
    titulo: 'Imunossupressor + Grapefruit',
    desc: 'Inibição da CYP3A4 pelo grapefruit pode elevar drasticamente os níveis séricos de ciclosporina e tacrolimus — risco de nefrotoxicidade e toxicidade sistêmica grave.',
    conduta: 'Contraindicado o consumo de grapefruit ou seu suco durante o uso desses imunossupressores.',
  },

  /* ══ Levotiroxina ════════════════════════════════════════════════ */
  {
    termos: ['levotiroxina','liotironina'],
    alimento: 'Cálcio, soja, fibras, ferro, café (próximos à tomada)',
    risco: 'moderado',
    titulo: 'Levotiroxina + Alimentos interferentes',
    desc: 'Cálcio, soja, fibra alimentar, leite, café e ferro oral reduzem a absorção da levotiroxina em até 40%, podendo comprometer o controle do hipotireoidismo.',
    conduta: 'Tomar em jejum, 30–60 min antes do café da manhã. Separar 2–4 horas de suplementos de cálcio, ferro ou refeições ricas em soja e fibras.',
  },

  /* ══ IECAs / BRAs + Potássio ══════════════════════════════════ */
  {
    termos: ['captopril','enalapril','lisinopril','ramipril','fosinopril','perindopril','trandolapril',
             'losartana','valsartana','irbesartana','candesartana','olmesartana','telmisartana',
             'espironolactona','eplerenona'],
    alimento: 'Substitutos de sal com KCl e alimentos ricos em potássio (banana, abacate, laranja, feijão)',
    risco: 'moderado',
    titulo: 'IECA/BRA/Poupador de K⁺ + Potássio',
    desc: 'IECAs, BRAs e diuréticos poupadores de potássio reduzem a excreção renal de K⁺. Ingestão excessiva de potássio pode causar hipercalemia com risco de arritmia.',
    conduta: 'Monitorar K⁺ sérico regularmente. Evitar excesso de substitutos de sal (Reducel, NoSalt) e suplementos de potássio.',
  },

  /* ══ IMAOs + Tiramina ════════════════════════════════════════ */
  {
    termos: ['fenelzina','tranilcipromina','selegilina','rasagilina','isocarboxazida','moclobemida'],
    alimento: 'Tiramina — queijos curados, vinho tinto, cerveja, embutidos, molho shoyu, extrato de levedura',
    risco: 'grave',
    titulo: 'IMAO + Tiramina (Crise Hipertensiva)',
    desc: 'IMAOs inibem a metabolização da tiramina dietética. Acúmulo de tiramina provoca liberação maciça de catecolaminas → crise hipertensiva grave (potencialmente fatal).',
    conduta: 'CONTRAINDICADO o consumo de alimentos ricos em tiramina durante e até 14 dias após uso de IMAOs irreversíveis. Lista completa de restrições disponível na orientação.',
  },

  /* ══ Metronidazol / Tinidazol + Álcool ══════════════════════ */
  {
    termos: ['metronidazol','tinidazol','secnidazol','ornidazol'],
    alimento: 'Álcool etílico',
    risco: 'grave',
    titulo: 'Nitroimidazol + Álcool (Reação Dissulfiram)',
    desc: 'Metronidazol e tinidazol inibem a aldeído desidrogenase, causando acúmulo de acetaldeído ao ingerir álcool → náusea, vômito, rubor, taquicardia (reação dissulfiram-like).',
    conduta: 'Evitar completamente o álcool durante o tratamento e por 48 horas após o término do metronidazol (72 h para o tinidazol).',
  },

  /* ══ Benzodiazepínicos + Álcool ══════════════════════════════ */
  {
    termos: ['diazepam','clonazepam','alprazolam','bromazepam','lorazepam','midazolam',
             'nitrazepam','zolpidem','zopiclona','zaleplon','clobazam'],
    alimento: 'Álcool etílico',
    risco: 'grave',
    titulo: 'Benzodiazepínico/Hipnótico + Álcool',
    desc: 'Potencialização sinérgica da depressão do SNC — sedação excessiva, depressão respiratória, risco de apneia e morte.',
    conduta: 'Contraindicado. Orientar o paciente para evitar completamente o álcool durante o tratamento.',
  },

  /* ══ Metformina + Álcool ══════════════════════════════════════ */
  {
    termos: ['metformina'],
    alimento: 'Álcool etílico',
    risco: 'grave',
    titulo: 'Metformina + Álcool',
    desc: 'Álcool potencializa o efeito da metformina sobre o metabolismo do lactato, aumentando o risco de acidose lática — especialmente em uso crônico ou com consumo excessivo.',
    conduta: 'Limitar ou evitar o consumo de álcool durante o uso de metformina. Alerta especial em caso de hepatopatia ou uso excessivo.',
  },

  /* ══ Quinolonas / Tetraciclinas + Laticínios / Cálcio ═══════ */
  {
    termos: ['ciprofloxacino','norfloxacino','ofloxacino','levofloxacino','moxifloxacino'],
    alimento: 'Laticínios, antiácidos com cálcio/magnésio/alumínio',
    risco: 'moderado',
    titulo: 'Quinolona + Cálcio/Laticínios',
    desc: 'Íons divalentes (Ca²⁺, Mg²⁺, Al³⁺) quelam as quinolonas no trato GI, reduzindo a absorção oral em até 50–90%.',
    conduta: 'Administrar 2 horas antes ou 6 horas após laticínios e antiácidos com cálcio, magnésio ou alumínio.',
  },
  {
    termos: ['tetraciclina','doxiciclina','minociclina','oxitetraciclina'],
    alimento: 'Laticínios (leite, queijo, iogurte)',
    risco: 'moderado',
    titulo: 'Tetraciclina + Laticínios',
    desc: 'O cálcio dos laticínios forma quelatos com tetraciclinas, reduzindo absorção em até 50%.',
    conduta: 'Administrar 1 hora antes ou 2 horas após laticínios. Doxiciclina tem menor impacto — pode ser tomada com alimentos se houver intolerância gástrica.',
  },

  /* ══ Sulfato Ferroso + Interferentes ════════════════════════ */
  {
    termos: ['sulfato ferroso','gluconato ferroso','fumarato ferroso','ferro','ferrous'],
    alimento: 'Chá, café, leite, cereais ricos em fitatos, suplementos de cálcio',
    risco: 'moderado',
    titulo: 'Ferro oral + Inibidores de absorção',
    desc: 'Taninos (chá, café), fitatos (cereais integrais), cálcio e laticínios reduzem significativamente a absorção do ferro oral.',
    conduta: 'Tomar de preferência em jejum ou com suco de laranja (vitamina C potencializa absorção). Separar pelo menos 2 horas de chá, café e laticínios.',
  },

  /* ══ Ciprofloxacino + Cafeína ════════════════════════════════ */
  {
    termos: ['ciprofloxacino'],
    alimento: 'Cafeína (café, chá preto, energéticos)',
    risco: 'moderado',
    titulo: 'Ciprofloxacino + Cafeína',
    desc: 'Ciprofloxacino inibe a CYP1A2, reduzindo a metabolização da cafeína em até 4×. Pode causar insônia, tremores, taquicardia e ansiedade.',
    conduta: 'Reduzir o consumo de café e bebidas com cafeína durante o tratamento com ciprofloxacino.',
  },

  /* ══ SSRIs / Antidepressivos + Álcool ═══════════════════════ */
  {
    termos: ['fluoxetina','sertralina','paroxetina','escitalopram','citalopram','fluvoxamina',
             'venlafaxina','duloxetina','amitriptilina','nortriptilina','imipramina','bupropiona'],
    alimento: 'Álcool etílico',
    risco: 'moderado',
    titulo: 'Antidepressivo + Álcool',
    desc: 'Álcool potencializa sedação e pode antagonizar o efeito antidepressivo. TCAs têm risco adicional de hipotensão ortostática e arritmia.',
    conduta: 'Evitar ou limitar significativamente o consumo de álcool durante o tratamento. Alerta especial com TCAs e bupropiona (reduz limiar convulsivo).',
  },

  /* ══ NSAIDs + Álcool ═════════════════════════════════════════ */
  {
    termos: ['ibuprofeno','naproxeno','diclofenaco','cetoprofeno','piroxicam','meloxicam','indometacina','celecoxibe'],
    alimento: 'Álcool etílico',
    risco: 'moderado',
    titulo: 'AINE + Álcool',
    desc: 'Álcool potencializa o risco de gastrotoxicidade e sangramento gastrointestinal dos AINEs. Uso combinado aumenta o risco de úlcera e hemorragia digestiva.',
    conduta: 'Evitar o consumo de álcool durante o uso de AINEs. Se necessário, usar com protetor gástrico (omeprazol).',
  },

  /* ══ Digoxina + Alimentos ════════════════════════════════════ */
  {
    termos: ['digoxina'],
    alimento: 'Refeições ricas em fibras e farelo de trigo',
    risco: 'moderado',
    titulo: 'Digoxina + Fibras Alimentares',
    desc: 'Dietas muito ricas em fibra solúvel podem reduzir a absorção oral da digoxina em até 25%, comprometendo o controle da arritmia.',
    conduta: 'Tomar a digoxina de maneira consistente em relação às refeições. Evitar grandes variações na ingestão de fibras.',
  },

  /* ══ Fenitoína + Álcool / Folato ═════════════════════════════ */
  {
    termos: ['fenitoina','fenitoína'],
    alimento: 'Álcool etílico',
    risco: 'moderado',
    titulo: 'Fenitoína + Álcool',
    desc: 'Uso agudo de álcool inibe o metabolismo da fenitoína (risco de toxicidade); uso crônico induz CYP2C9 e pode reduzir os níveis séricos (risco de convulsões).',
    conduta: 'Evitar o consumo de álcool. Monitorar nível sérico de fenitoína em caso de exposição.',
  },

  /* ══ Lítio + Sódio / Cafeína ════════════════════════════════ */
  {
    termos: ['carbonato de litio','litio','lítio'],
    alimento: 'Dieta hipossódica e restrição hídrica (ou excesso de cafeína)',
    risco: 'moderado',
    titulo: 'Lítio + Sódio e Cafeína',
    desc: 'Redução abrupta de sódio na dieta aumenta a reabsorção renal de lítio, elevando seus níveis séricos até à toxicidade. Cafeína aumenta a excreção renal de lítio, podendo reduzir a eficácia.',
    conduta: 'Manter ingestão constante de sódio (sem dietas hipossódicas sem orientação). Manter hidratação adequada. Evitar grandes variações no consumo de cafeína.',
  },

  /* ══ Corticosteroides + Álcool ══════════════════════════════ */
  {
    termos: ['prednisona','prednisolona','dexametasona','betametasona','hidrocortisona','metilprednisolona','deflazacorte'],
    alimento: 'Álcool etílico',
    risco: 'moderado',
    titulo: 'Corticoide + Álcool',
    desc: 'Combinação aumenta o risco de gastrotoxicidade, úlcera péptica e hemorragia gastrointestinal. Ambos também elevam a pressão arterial e a glicemia.',
    conduta: 'Evitar o consumo de álcool. Tomar o corticoide com alimentos para reduzir irritação gástrica.',
  },

  /* ══ Carbamazepina + Grapefruit ══════════════════════════════ */
  {
    termos: ['carbamazepina'],
    alimento: 'Suco ou fruta de grapefruit (toranja)',
    risco: 'moderado',
    titulo: 'Carbamazepina + Grapefruit',
    desc: 'Grapefruit inibe CYP3A4 e pode elevar os níveis séricos de carbamazepina em até 40%, aumentando o risco de ataxia, diplopia e tontura.',
    conduta: 'Evitar grapefruit e seu suco durante o tratamento.',
  },

  /* ══ Sildenafil / Tadalafil + Álcool ════════════════════════ */
  {
    termos: ['sildenafila','tadalafila','vardenafila','avanafila'],
    alimento: 'Álcool etílico',
    risco: 'moderado',
    titulo: 'Inibidor de PDE-5 + Álcool',
    desc: 'Álcool potencializa o efeito vasodilatador, causando hipotensão ortostática, tontura e síncope.',
    conduta: 'Limitar o consumo de álcool. Evitar combinação, especialmente em posição ortostática.',
  },

  /* ══ Paracetamol + Álcool ════════════════════════════════════ */
  {
    termos: ['paracetamol','acetaminofeno'],
    alimento: 'Álcool etílico (uso crônico)',
    risco: 'moderado',
    titulo: 'Paracetamol + Álcool',
    desc: 'Em etilistas crônicos, a indução da CYP2E1 aumenta a produção do metabólito hepatotóxico NAPQI, com risco de hepatotoxicidade grave mesmo em doses terapêuticas.',
    conduta: 'Etilistas crônicos: evitar paracetamol ou limitar a dose máxima (< 2 g/dia). Para a população geral: evitar consumo de álcool durante o uso.',
  },

  /* ══ Levodopa + Proteína ═════════════════════════════════════ */
  {
    termos: ['levodopa','carbidopa','entacapona'],
    alimento: 'Refeições ricas em proteínas (carne, frango, ovos, leite)',
    risco: 'moderado',
    titulo: 'Levodopa + Proteínas na Refeição',
    desc: 'Aminoácidos competem com a levodopa pelo mesmo transportador intestinal e pela barreira hematoencefálica, reduzindo seu efeito clínico.',
    conduta: 'Administrar levodopa 30 min antes das refeições. Distribuir proteínas preferencialmente nas refeições noturnas.',
  },

  /* ══ Fluconazol / Itraconazol + Álcool ══════════════════════ */
  {
    termos: ['itraconazol'],
    alimento: 'Refeições ricas em gordura (cápsulas) — e jejum para solução',
    risco: 'moderado',
    titulo: 'Itraconazol: cápsulas com refeição, solução em jejum',
    desc: 'As CÁPSULAS de itraconazol requerem ambiente ácido para dissolução — absorção aumentada com refeição rica em gordura. A SOLUÇÃO oral deve ser tomada em jejum.',
    conduta: 'Cápsulas: tomar logo após refeição gordurosa. Solução oral: tomar 1 hora antes ou 2 horas após a refeição.',
  },
];

/* ── Normalização ─────────────────────────────────────────────── */
function _normAL(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/* ── Verificação principal ────────────────────────────────────── */
/**
 * @param {Array} medicamentos — lista de medicamentos ativos do paciente
 * @returns {Array} alertas de interação alimento-medicamento (grave primeiro)
 */
function verificarAlimentoFarma(medicamentos) {
  if (!medicamentos?.length) return [];

  const nomesNorm = medicamentos.map(m => ({
    norm: _normAL(m.generico || m.nome || ''),
    original: m.generico || m.nome || '',
  }));

  const alertas = [];
  const vistos  = new Set(); // evita duplicatas da mesma regra

  for (const regra of _ALIMENTO) {
    const medsTrigger = [];
    for (const { norm, original } of nomesNorm) {
      if (regra.termos.some(t => norm.includes(_normAL(t)))) {
        medsTrigger.push(original);
      }
    }
    if (!medsTrigger.length) continue;

    const key = regra.titulo + '|' + medsTrigger.join(',');
    if (vistos.has(key)) continue;
    vistos.add(key);

    alertas.push({ ...regra, medsTrigger });
  }

  // Grave primeiro
  return alertas.sort((a, b) =>
    (a.risco === 'grave' ? 0 : 1) - (b.risco === 'grave' ? 0 : 1)
  );
}
