/* VitaDose — Duplicidade Terapêutica
   Detecta dois ou mais fármacos da mesma classe farmacológica
   e combinações perigosas entre classes distintas.
*/

const CLASSES_FARM = {
  'AINEs': {
    termos: ['ibuprofeno','naproxeno','diclofenaco','cetoprofeno','meloxicam','piroxicam','celecoxibe','indometacina','tenoxicam','nimesulida'],
    aviso: 'Dois AINEs simultâneos aumentam o risco de sangramento GI grave, lesão renal e eventos cardiovasculares sem benefício analgésico adicional. Usar apenas um AINE.',
  },
  'IECA (Inibidores da ECA)': {
    termos: ['enalapril','captopril','lisinopril','ramipril','perindopril','fosinopril','quinapril','trandolapril','benazepril'],
    aviso: 'Dois IECA combinados não têm benefício e aumentam o risco de hipotensão grave, hipercalemia e insuficiência renal.',
  },
  'BRA / Sartanas': {
    termos: ['losartana','valsartana','irbesartana','candesartana','telmisartana','olmesartana','azilsartana','eprosartana'],
    aviso: 'Dois BRA combinados não têm benefício e aumentam o risco de hipotensão grave, hipercalemia e insuficiência renal.',
  },
  'Betabloqueadores': {
    termos: ['atenolol','metoprolol','propranolol','carvedilol','bisoprolol','nebivolol','esmolol','labetalol','nadolol','pindolol'],
    aviso: 'Dois betabloqueadores combinados causam bradicardia grave e bloqueio AV. Usar apenas um betabloqueador.',
  },
  'Estatinas': {
    termos: ['sinvastatina','atorvastatina','rosuvastatina','lovastatina','pravastatina','fluvastatina','pitavastatina'],
    aviso: 'Duas estatinas combinadas não têm indicação estabelecida e aumentam o risco de miopatia e rabdomiólise. Usar apenas uma estatina.',
  },
  'Benzodiazepínicos': {
    termos: ['diazepam','clonazepam','alprazolam','bromazepam','lorazepam','nitrazepam','midazolam','clobazam','clordiazepoxido'],
    aviso: 'Dois benzodiazepínicos combinados causam sedação excessiva, depressão respiratória e risco elevado de quedas. Usar apenas um BZD, se necessário.',
  },
  'Hipnóticos Z': {
    termos: ['zolpidem','zopiclona','zaleplon'],
    aviso: 'Dois hipnóticos Z combinados aumentam sedação, risco de quedas e comportamentos complexos do sono.',
  },
  'Inibidores da Bomba de Prótons (IBP)': {
    termos: ['omeprazol','pantoprazol','lansoprazol','esomeprazol','rabeprazol','dexlansoprazol'],
    aviso: 'Dois IBP simultâneos não oferecem benefício adicional e aumentam o risco de hipomagnesemia, deficiência de B12 e infecções intestinais.',
  },
  'ISRS (Antidepressivos)': {
    termos: ['fluoxetina','sertralina','paroxetina','escitalopram','citalopram','fluvoxamina'],
    aviso: 'Dois ISRS combinados aumentam o risco de síndrome serotoninérgica (agitação, tremor, taquicardia, hipertermia) sem benefício adicional.',
  },
  'Anticoagulantes Orais': {
    termos: ['varfarina','warfarina','dabigatrana','rivaroxabana','apixabana','edoxabana','betrixabana'],
    aviso: 'Dois anticoagulantes orais combinados causam risco hemorrágico grave, potencialmente fatal. Usar apenas um anticoagulante.',
  },
  'Corticoides Sistêmicos': {
    termos: ['prednisona','prednisolona','dexametasona','hidrocortisona','betametasona','metilprednisolona','deflazacorte'],
    aviso: 'Dois corticoides sistêmicos combinados dobram os efeitos adversos (imunossupressão, osteoporose, hiperglicemia) sem benefício adicional.',
  },
  'Sulfonilureias': {
    termos: ['glibenclamida','glipizida','gliclazida','glimepirida','clorpropamida','tolbutamida'],
    aviso: 'Duas sulfonilureias combinadas aumentam o risco de hipoglicemia grave sem melhora do controle glicêmico.',
  },
  'Opioides de Uso Regular': {
    termos: ['morfina','oxicodona','hidrocodona','buprenorfina','fentanila','metadona','tapentadol'],
    aviso: 'Dois opioides de uso regular combinados aumentam o risco de depressão respiratória e sedação profunda. Raramente indicado fora de contexto de dor oncológica com especialista.',
  },
  'Diuréticos de Alça': {
    termos: ['furosemida','bumetanida','torasemida','piretanida'],
    aviso: 'Dois diuréticos de alça combinados causam diurese excessiva, desidratação, hipocalemia grave e hipotensão ortostática.',
  },
  'Anti-histamínicos de 1ª Geração': {
    termos: ['difenidramina','clorfeniramina','prometazina','hidroxizina','ciproeptadina','dimenidrinato'],
    aviso: 'Dois anti-histamínicos de 1ª geração combinados causam sedação excessiva, efeito anticolinérgico acumulado (confusão, retenção urinária) e risco de quedas.',
  },
  'Antipsicóticos': {
    termos: ['haloperidol','clorpromazina','risperidona','quetiapina','olanzapina','aripiprazol','ziprasidona','clozapina','amisulprida','paliperidona'],
    aviso: 'Dois antipsicóticos combinados aumentam o risco de efeitos adversos (QT longo, sedação, parkinsonismo, síndrome metabólica) sem evidência clara de maior eficácia.',
  },
  'Calcioantagonistas': {
    termos: ['amlodipina','nifedipina','felodipina','verapamil','diltiazem','lercanidipina','manidipina'],
    aviso: 'Dois calcioantagonistas combinados causam hipotensão excessiva. A combinação verapamil/diltiazem (que agem no nó AV) com di-hidropiridinas tem mais evidências, mas requer cautela.',
  },
  'iSGLT2': {
    termos: ['dapagliflozina','empagliflozina','canagliflozina','ertugliflozina'],
    aviso: 'Dois iSGLT2 combinados não têm evidência de benefício adicional e aumentam os riscos de cetoacidose e infecções genitais.',
  },
  'iDPP-4': {
    termos: ['sitagliptina','saxagliptina','alogliptina','linagliptina','vildagliptina'],
    aviso: 'Dois iDPP-4 combinados não têm indicação. Sem benefício adicional.',
  },
};

/* ── Combinações perigosas entre classes distintas ── */
const COMBOS_PERIGOSOS = [
  {
    classA: 'IECA (Inibidores da ECA)',
    classB: 'BRA / Sartanas',
    nivel: 'grave',
    titulo: 'IECA + BRA — Duplo Bloqueio do SRAA Contraindicado',
    aviso: 'A combinação de IECA com BRA (duplo bloqueio do SRAA) é contraindicada na maioria das situações. Risco de hipercalemia grave, hipotensão e insuficiência renal aguda. Evidência: estudo ONTARGET.',
  },
  {
    classA: 'Anticoagulantes Orais',
    classB: 'Anticoagulantes Orais',
    nivel: 'grave',
    titulo: 'Dois Anticoagulantes Orais — Risco Hemorrágico Grave',
    aviso: 'Combinação de dois anticoagulantes orais (ex: varfarina + DOAC) é contraindicada. Risco de hemorragia grave ou fatal.',
  },
  {
    classA: 'ISRS (Antidepressivos)',
    classB: 'IRSN',
    nivel: 'moderado',
    titulo: 'ISRS + IRSN Simultâneos — Síndrome Serotoninérgica',
    aviso: 'Combinar ISRS com IRSN (venlafaxina, duloxetina) aumenta o risco de síndrome serotoninérgica. Usar apenas uma classe de antidepressivo serotoninérgico.',
  },
];

/* ── Normalização ── */
function _normDup(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\b\d[\d,.]*\s*(mg|ml|mcg|g|ui|%)\b/g, '')
    .replace(/\s+/g, ' ').trim();
}

/* ── Verifica duplicidade terapêutica ── */
function verificarDuplicidade(medicamentos) {
  if (!medicamentos || medicamentos.length < 2) return [];

  const nomes = medicamentos.map(m => _normDup(m.nome));
  const resultado = [];
  const vistos = new Set();

  for (const [classe, dados] of Object.entries(CLASSES_FARM)) {
    const medsNaClasse = medicamentos.filter((m, i) =>
      dados.termos.some(t => nomes[i].includes(t))
    );
    if (medsNaClasse.length >= 2) {
      const chave = classe;
      if (!vistos.has(chave)) {
        vistos.add(chave);
        resultado.push({
          tipo: 'duplicidade',
          nivel: 'moderado',
          classe,
          meds: medsNaClasse.map(m => m.nome),
          aviso: dados.aviso,
        });
      }
    }
  }

  // Combos perigosos entre classes distintas
  const classesDoPaciente = {};
  for (const [classe, dados] of Object.entries(CLASSES_FARM)) {
    const match = medicamentos.filter((m, i) => dados.termos.some(t => nomes[i].includes(t)));
    if (match.length) classesDoPaciente[classe] = match.map(m => m.nome);
  }

  // IECA + BRA
  if (classesDoPaciente['IECA (Inibidores da ECA)'] && classesDoPaciente['BRA / Sartanas']) {
    if (!vistos.has('IECA+BRA')) {
      vistos.add('IECA+BRA');
      resultado.unshift({
        tipo: 'duplicidade',
        nivel: 'grave',
        classe: 'IECA + BRA (Duplo Bloqueio do SRAA)',
        meds: [
          ...classesDoPaciente['IECA (Inibidores da ECA)'],
          ...classesDoPaciente['BRA / Sartanas'],
        ],
        aviso: 'CONTRAINDICADO. A combinação de IECA com BRA (duplo bloqueio do SRAA) aumenta risco de hipercalemia grave, hipotensão e IRA (estudo ONTARGET). Usar apenas um dos dois.',
      });
    }
  }

  // Dois anticoagulantes
  if (classesDoPaciente['Anticoagulantes Orais'] &&
      classesDoPaciente['Anticoagulantes Orais'].length >= 2) {
    if (!vistos.has('2anticoag')) {
      vistos.add('2anticoag');
      resultado.unshift({
        tipo: 'duplicidade',
        nivel: 'grave',
        classe: 'Dois Anticoagulantes Orais',
        meds: classesDoPaciente['Anticoagulantes Orais'],
        aviso: 'CONTRAINDICADO. Dois anticoagulantes orais combinados causam risco hemorrágico grave ou fatal.',
      });
    }
  }

  // Ordenar: grave primeiro
  const ordem = { grave: 0, moderado: 1, leve: 2 };
  return resultado.sort((a, b) => (ordem[a.nivel] ?? 2) - (ordem[b.nivel] ?? 2));
}
